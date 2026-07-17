<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private OrderService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(OrderService::class);
    }

    public function test_create_order_sets_correct_status(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['status' => 'active', 'stock' => 1]);

        $order = $this->service->create([
            'product_id' => $product->id,
            'shipping_address' => 'Test Address',
        ], $buyer->id);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals('waiting_payment', $order->status);
        $this->assertEquals($buyer->id, $order->buyer_id);
        $this->assertEquals($seller->id, $order->seller_id);
    }

    public function test_create_order_books_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        // Set stock to 1 so that after order creation stock becomes 0 and status becomes 'sold'
        $product = $this->createProduct($seller, ['status' => 'active', 'stock' => 1]);

        $this->service->create([
            'product_id' => $product->id,
            'shipping_address' => 'Test Address',
        ], $buyer->id);

        $this->assertEquals('sold', $product->fresh()->status);
    }

    public function test_cancel_order_restores_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        // Give 0 stock to simulate a sold product
        $product = $this->createProduct($seller, ['status' => 'sold', 'stock' => 0]);

        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'waiting_payment']);

        $cancelled = $this->service->cancel($order);
        $this->assertEquals('expired', $cancelled->status); // cancel logic sets to expired
        $this->assertEquals('active', $product->fresh()->status);
    }

    public function test_ship_order_updates_status(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'paid']);

        $shipped = $this->service->ship($order, 'RESI123');
        $this->assertEquals('shipped', $shipped->status);
        $this->assertEquals('RESI123', $shipped->resi_number);
    }

    public function test_confirm_received_completes_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'shipped']);

        // Give SELLER enough held balance so EscrowService can release it
        $seller->wallet->update(['held_balance' => $order->product_price]);

        $completed = $this->service->confirmReceived($order);
        $this->assertEquals('completed', $completed->status);
        $this->assertEquals('sold', $product->fresh()->status);
    }

    public function test_expire_order_sets_status_and_restores_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['status' => 'booked']);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'waiting_payment']);

        $this->service->expireOrder($order);

        $this->assertEquals('expired', $order->fresh()->status);
        $this->assertEquals('active', $product->fresh()->status);
    }

    public function test_order_has_unique_order_number(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product1 = $this->createProduct($seller, ['status' => 'active', 'stock' => 1]);
        $product2 = $this->createProduct($seller, ['status' => 'active', 'stock' => 1]);

        $order1 = $this->service->create(['product_id' => $product1->id, 'shipping_address' => 'Addr 1'], $buyer->id);
        $order2 = $this->service->create(['product_id' => $product2->id, 'shipping_address' => 'Addr 2'], $buyer->id);

        $this->assertNotEquals($order1->order_number, $order2->order_number);
    }
}
