<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ExpireOrderJob;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Services\EscrowService;
use App\Services\OrderService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role, string $suffix = ''): User
    {
        $key = $role.$suffix;
        $user = User::create([
            'name' => ucfirst($role).' User',
            'email' => $key.'@order-test.com',
            'phone' => '08'.rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);

        return $user;
    }

    private function createProduct(User $seller, string $status = 'active', string $suffix = ''): Product
    {
        $brand = Brand::firstOrCreate(['name' => 'Brand'.$suffix], ['slug' => 'brand'.$suffix]);
        $cat = Category::firstOrCreate(['name' => 'Cat'.$suffix], ['slug' => 'cat'.$suffix]);

        return Product::create([
            'seller_id' => $seller->id,
            'brand_id' => $brand->id,
            'category_id' => $cat->id,
            'model' => 'Laptop'.$suffix,
            'slug' => 'laptop'.$suffix.'-'.uniqid(),
            'cpu' => 'i5',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'screen_size' => '14"',
            'price' => 5000000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'description' => 'Test product',
            'status' => $status,
        ]);
    }

    // ========== Create Order ==========

    public function test_buyer_can_create_order(): void
    {
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $response = $this->actingAs($buyer)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
            'shipping_address' => 'Jakarta',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'waiting_payment');

        // product_price, platform_fee, total_amount saved (BR-09: 3% platform fee)
        $order = Order::first();
        $this->assertEquals(5000000, (float) $order->product_price);
        $this->assertEquals(150000, (float) $order->platform_fee);
        $this->assertEquals(5150000, (float) $order->total_amount);

        // product becomes booked
        $this->assertEquals('sold', $product->fresh()->status);

        // order_number format INV-YYYYMMDD-XXXX
        $this->assertMatchesRegularExpression('/^INV-\d{8}-\d{4}$/', $order->order_number);

        // snapshot stored
        $this->assertNotNull($order->product_snapshot);
    }

    public function test_unauthenticated_user_cannot_create_order(): void
    {
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $this->postJson('/api/v1/orders', ['product_id' => $product->id])
            ->assertStatus(401);
    }

    // ========== Prevent Self Purchase ==========

    public function test_seller_cannot_buy_own_product(): void
    {
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $this->actingAs($seller)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
        ])->assertStatus(403);

        // product stays active
        $this->assertEquals('active', $product->fresh()->status);
    }

    // ========== Prevent Duplicate Booking ==========

    public function test_booked_product_cannot_be_ordered_again(): void
    {
        $buyer1 = $this->createUser('buyer', '1');
        $buyer2 = $this->createUser('buyer', '2');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        $this->actingAs($buyer1)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
            'shipping_address' => 'Jakarta',
        ])->assertStatus(201);

        $this->actingAs($buyer2)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
            'shipping_address' => 'Jakarta',
        ])->assertStatus(422);
    }

    public function test_paid_product_cannot_be_ordered(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'paid');

        $this->actingAs($buyer)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
        ])->assertStatus(422);
    }

    public function test_sold_product_cannot_be_ordered(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'sold');

        $this->actingAs($buyer)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
        ])->assertStatus(422);
    }

    // ========== Order Expiration ==========

    public function test_expire_order_job_sets_status_expired_and_restores_product(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0001',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->subHour(), // already expired
            'status' => 'waiting_payment',
        ]);

        $product->update(['status' => 'booked']);

        // Run the job
        (new ExpireOrderJob)->handle(app(OrderService::class));

        $this->assertEquals('expired', $order->fresh()->status);
        $this->assertEquals('active', $product->fresh()->status);
    }

    public function test_expire_job_does_not_affect_paid_orders(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'paid');

        $order = Order::create([
            'order_number' => 'INV-20260619-0002',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->subHour(),
            'status' => 'paid', // already paid, should not be expired
        ]);

        (new ExpireOrderJob)->handle(app(OrderService::class));

        $this->assertEquals('paid', $order->fresh()->status);
    }

    // ========== Cancel Order ==========

    public function test_buyer_can_cancel_waiting_payment_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0003',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);
        $product->update(['status' => 'booked']);

        $this->actingAs($buyer)->putJson("/api/v1/orders/{$order->id}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'expired');

        $this->assertEquals('active', $product->fresh()->status);
    }

    public function test_seller_cannot_cancel_buyers_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0004',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);

        $this->actingAs($seller)->putJson("/api/v1/orders/{$order->id}/cancel")
            ->assertStatus(403);
    }

    // ========== Confirm Received ==========

    public function test_buyer_can_confirm_received_shipped_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0005',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'shipped',
        ]);
        $product->update(['status' => 'paid']);

        // Pre-populate escrow using proper service
        app(EscrowService::class)->moveToEscrow($order);

        $this->actingAs($buyer)->putJson("/api/v1/orders/{$order->id}/confirm-received")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $this->assertEquals('sold', $product->fresh()->status);
        $this->assertNotNull($order->fresh()->completed_at);
    }

    public function test_buyer_cannot_confirm_received_non_shipped_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0006',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);

        $this->actingAs($buyer)->putJson("/api/v1/orders/{$order->id}/confirm-received")
            ->assertStatus(403);
    }

    // ========== Authorization / Index / Show ==========

    public function test_buyer_can_only_see_own_orders(): void
    {
        $seller = $this->createUser('seller');
        $buyer1 = $this->createUser('buyer', '1');
        $buyer2 = $this->createUser('buyer', '2');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0007',
            'product_id' => $product->id,
            'buyer_id' => $buyer1->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);

        // buyer1 can see it
        $this->actingAs($buyer1)->getJson("/api/v1/orders/{$order->id}")->assertStatus(200);

        // buyer2 cannot
        $this->actingAs($buyer2)->getJson("/api/v1/orders/{$order->id}")->assertStatus(403);
    }

    public function test_admin_can_see_all_orders(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $admin = $this->createUser('admin');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0008',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);

        $this->actingAs($admin)->getJson("/api/v1/orders/{$order->id}")->assertStatus(200);
    }

    public function test_seller_can_see_order_for_own_product(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        $order = Order::create([
            'order_number' => 'INV-20260619-0009',
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => 'waiting_payment',
        ]);

        $this->actingAs($seller)->getJson("/api/v1/orders/{$order->id}")->assertStatus(200);
    }

    // ========== PHASE 12 CRITICAL FIX: Buyer Role Middleware ==========

    public function test_seller_cannot_create_order_via_buyer_endpoint(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        // Seller tries to create order (should fail - role:buyer middleware)
        $response = $this->actingAs($seller)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(403);
        $response->assertJson(['success' => false]);
    }

    public function test_technician_cannot_create_order_via_buyer_endpoint(): void
    {
        $tech = $this->createUser('technician');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);

        // Technician tries to create order (should fail)
        $response = $this->actingAs($tech)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
        ]);

        $response->assertStatus(403);
    }

    public function test_only_buyer_can_create_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);

        // Only buyer can create
        $response = $this->actingAs($buyer)->postJson('/api/v1/orders', [
            'product_id' => $product->id,
            'shipping_address' => 'Jakarta',
        ]);

        $response->assertStatus(201);
    }
}
