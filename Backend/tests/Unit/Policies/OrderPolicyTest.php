<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class OrderPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_create_order(): void
    {
        $buyer = $this->createBuyer();
        $this->assertTrue($buyer->can('create', Order::class));
    }

    public function test_seller_cannot_create_order(): void
    {
        $seller = $this->createSeller();
        $this->assertFalse($seller->can('create', Order::class));
    }

    public function test_buyer_can_view_own_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->assertTrue($buyer->can('view', $order));
    }

    public function test_buyer_cannot_view_other_order(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer1, $seller, $product);

        $this->assertFalse($buyer2->can('view', $order));
    }

    public function test_seller_can_view_own_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->assertTrue($seller->can('view', $order));
    }

    public function test_admin_can_view_any_order(): void
    {
        $admin = $this->createAdmin();
        $this->assertTrue($admin->can('viewAny', Order::class));
    }

    public function test_buyer_can_cancel_own_waiting_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'waiting_payment']);

        $this->assertTrue($buyer->can('cancel', $order));
    }

    public function test_buyer_cannot_cancel_paid_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'paid']);

        $this->assertFalse($buyer->can('cancel', $order));
    }

    public function test_seller_can_ship_paid_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'paid']);

        $this->assertTrue($seller->can('ship', $order));
    }

    public function test_seller_cannot_ship_waiting_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'waiting_payment']);

        $this->assertFalse($seller->can('ship', $order));
    }

    public function test_buyer_can_confirm_received_shipped_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'shipped']);

        $this->assertTrue($buyer->can('confirmReceived', $order));
    }

    public function test_buyer_can_pay_own_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'waiting_payment']);

        $this->assertTrue($buyer->can('pay', $order));
    }
}
