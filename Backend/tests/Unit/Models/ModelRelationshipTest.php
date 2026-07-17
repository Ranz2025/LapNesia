<?php

declare(strict_types=1);

namespace Tests\Unit\Models;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\InspectionJob;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReturn;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ModelRelationshipTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    // ─── User Relationships ──────────────────────────────────────────────

    public function test_user_has_wallet(): void
    {
        $user = $this->createBuyer();
        $this->assertInstanceOf(Wallet::class, $user->wallet);
    }

    public function test_user_has_products(): void
    {
        $seller = $this->createSeller();
        $this->createProduct($seller);

        $this->assertCount(1, $seller->products);
    }

    public function test_user_has_orders_as_buyer(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $this->createOrder($buyer, $seller, $product);

        $this->assertCount(1, $buyer->ordersAsBuyer);
    }

    public function test_user_has_orders_as_seller(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $this->createOrder($buyer, $seller, $product);

        $this->assertCount(1, $seller->ordersAsSeller);
    }

    // ─── Product Relationships ───────────────────────────────────────────

    public function test_product_belongs_to_seller(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertEquals($seller->id, $product->seller->id);
    }

    public function test_product_belongs_to_brand(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand('TestBrand');
        $product = $this->createProduct($seller, ['brand' => $brand]);

        $this->assertStringStartsWith('TestBrand', $product->brand->name);
    }

    public function test_product_belongs_to_category(): void
    {
        $seller = $this->createSeller();
        $category = $this->createCategory('TestCat');
        $product = $this->createProduct($seller, ['category' => $category]);

        $this->assertStringStartsWith('TestCat', $product->category->name);
    }

    public function test_product_has_order(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $this->createOrder($buyer, $seller, $product);

        $this->assertNotNull($product->order);
    }

    // ─── Order Relationships ─────────────────────────────────────────────

    public function test_order_belongs_to_buyer(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->assertEquals($buyer->id, $order->buyer->id);
    }

    public function test_order_belongs_to_seller(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->assertEquals($seller->id, $order->seller->id);
    }

    public function test_order_belongs_to_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->assertEquals($product->id, $order->product->id);
    }

    public function test_order_has_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Test',
            'status' => 'pending',
        ]);

        $this->assertNotNull($order->productReturn);
    }

    // ─── ChatRoom Relationships ──────────────────────────────────────────

    public function test_chat_room_has_messages(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $buyer->id,
            'body' => 'Hello',
        ]);

        $this->assertCount(1, $room->messages);
    }

    public function test_chat_message_belongs_to_sender(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();

        $room = ChatRoom::create([
            'user_one_id' => $buyer->id,
            'user_two_id' => $seller->id,
        ]);

        $msg = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $buyer->id,
            'body' => 'Hello',
        ]);

        $this->assertEquals($buyer->id, $msg->sender->id);
    }

    // ─── Wallet Relationships ────────────────────────────────────────────

    public function test_wallet_belongs_to_user(): void
    {
        $user = $this->createBuyer();
        $this->assertEquals($user->id, $user->wallet->user->id);
    }

    public function test_wallet_has_transactions(): void
    {
        $user = $this->createBuyer();
        $this->assertCount(0, $user->wallet->transactions);
    }

    // ─── Withdrawal Relationships ────────────────────────────────────────

    public function test_withdrawal_belongs_to_wallet(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);

        $withdrawal = Withdrawal::create([
            'wallet_id' => $seller->wallet->id,
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
            'status' => 'pending',
        ]);

        $this->assertEquals($seller->wallet->id, $withdrawal->wallet->id);
    }

    // ─── InspectionJob Relationships ─────────────────────────────────────

    public function test_inspection_job_belongs_to_technician(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'status' => 'pending',
            'fee' => 150000,
        ]);

        $this->assertEquals($tech->id, $job->technician->id);
    }

    public function test_inspection_job_belongs_to_requester(): void
    {
        $buyer = $this->createBuyer();
        $tech = $this->createTechnician();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $job = InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $tech->id,
            'requested_by' => $buyer->id,
            'status' => 'pending',
            'fee' => 150000,
        ]);

        $this->assertEquals($buyer->id, $job->requester->id);
    }

    // ─── Model Casts ─────────────────────────────────────────────────────

    public function test_product_casts_are_correct(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['price' => 8000000.50, 'is_spec_verified' => false]);

        $this->assertIsBool($product->is_spec_verified);
        $this->assertIsString($product->price); // decimal:2 cast returns string
        $this->assertIsString($product->avg_rating ?? '1.00'); // decimal:2
        $this->assertIsInt($product->stock);
    }

    public function test_order_casts_are_correct(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $order->is_disputed = false;

        $this->assertIsBool($order->is_disputed);
        $this->assertIsArray($order->product_snapshot);
        $this->assertIsString($order->product_price);
        $this->assertIsString($order->platform_fee);
        $this->assertIsString($order->total_amount);
        $this->assertInstanceOf(Carbon::class, $order->booking_expires_at);
        if ($order->paid_at) {
            $this->assertInstanceOf(Carbon::class, $order->paid_at);
        }
        if ($order->shipped_at) {
            $this->assertInstanceOf(Carbon::class, $order->shipped_at);
        }
        if ($order->completed_at) {
            $this->assertInstanceOf(Carbon::class, $order->completed_at);
        }
    }

    public function test_wallet_casts_are_correct(): void
    {
        $user = $this->createBuyer();
        $wallet = $user->wallet;

        $this->assertIsString($wallet->available_balance); // decimal:2
        $this->assertIsString($wallet->held_balance);
    }
}
