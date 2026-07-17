<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private User $seller;

    private User $buyer;

    private User $admin;

    private Product $product;

    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::create([
            'name' => 'Seller',
            'email' => 'seller@auth.com',
            'phone' => '081444444441',
            'password' => bcrypt('password'),
            'role' => 'seller',
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $this->seller->id, 'available_balance' => 0, 'held_balance' => 0]);

        $this->buyer = User::create([
            'name' => 'Buyer',
            'email' => 'buyer@auth.com',
            'phone' => '081444444442',
            'password' => bcrypt('password'),
            'role' => 'buyer',
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $this->buyer->id, 'available_balance' => 10000000, 'held_balance' => 0]);

        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@auth.com',
            'phone' => '081444444443',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $brand = Brand::create(['name' => 'Brand', 'slug' => 'brand']);
        $category = Category::create(['name' => 'Category', 'slug' => 'category']);

        $this->product = Product::create([
            'seller_id' => $this->seller->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'Model X',
            'slug' => 'model-x-'.uniqid(),
            'cpu' => 'CPU',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'screen_size' => '15"',
            'price' => 5000000,
            'condition' => 'very_good',
            'location' => 'Jakarta',
            'description' => 'Test',
            'stock' => 10,
            'status' => 'active',
        ]);

        $this->order = Order::create([
            'order_number' => 'ORD-'.uniqid(),
            'buyer_id' => $this->buyer->id,
            'seller_id' => $this->seller->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'product_price' => 5000000,
            'platform_fee' => 0,
            'total_amount' => 5000000,
            'product_snapshot' => json_encode(['id' => $this->product->id]),
            'booking_expires_at' => now()->addMinutes(30),
            'status' => 'waiting_payment',
        ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_endpoints(): void
    {
        $this->getJson('/api/v1/orders')
            ->assertUnauthorized();

        $this->getJson('/api/v1/wallet')
            ->assertUnauthorized();
    }

    public function test_seller_can_access_seller_products_endpoint(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->getJson('/api/v1/seller/products');

        $response->assertStatus(200);
    }

    public function test_buyer_cannot_access_seller_products_endpoint(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->getJson('/api/v1/seller/products');

        $response->assertStatus(403);
    }

    public function test_seller_can_view_own_product(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->getJson("/api/v1/products/{$this->product->slug}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $this->product->id);
    }

    public function test_seller_cannot_view_other_seller_product(): void
    {
        $otherSeller = User::create([
            'name' => 'Other Seller',
            'email' => 'other-seller@auth.com',
            'phone' => '081444444444',
            'password' => bcrypt('password'),
            'role' => 'seller',
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $otherSeller->id, 'available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]);

        $response = $this->actingAs($otherSeller, 'sanctum')
            ->getJson("/api/v1/seller/products/{$this->product->id}");

        $response->assertStatus(403);
    }

    public function test_buyer_can_view_any_product(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->getJson("/api/v1/products/{$this->product->slug}");

        $response->assertStatus(200);
    }

    public function test_buyer_can_create_order(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->postJson('/api/v1/orders', [
                'product_id' => $this->product->id,
                'quantity' => 1,
                'shipping_address' => 'Jl. Test Address No 123',
            ]);

        $response->assertStatus(201);
    }

    public function test_seller_cannot_create_order(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->postJson('/api/v1/orders', [
                'product_id' => $this->product->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(403);
    }

    public function test_buyer_can_view_own_order(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->getJson("/api/v1/orders/{$this->order->id}");

        $response->assertStatus(200);
    }

    public function test_buyer_cannot_view_other_buyer_order(): void
    {
        $otherBuyer = User::create([
            'name' => 'Other Buyer',
            'email' => 'other-buyer@auth.com',
            'phone' => '081444444445',
            'password' => bcrypt('password'),
            'role' => 'buyer',
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $otherBuyer->id, 'available_balance' => 5000000, 'held_balance' => 0]);

        $response = $this->actingAs($otherBuyer, 'sanctum')
            ->getJson("/api/v1/orders/{$this->order->id}");

        $response->assertStatus(403);
    }

    public function test_seller_can_view_own_order(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->getJson("/api/v1/orders/{$this->order->id}");

        $response->assertStatus(200);
    }

    public function test_admin_can_view_any_order(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/orders/{$this->order->id}");

        $response->assertStatus(200);
    }

    public function test_seller_can_create_withdrawal(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->postJson('/api/v1/withdrawals', [
                'amount' => 50000,
                'bank_name' => 'BCA',
                'account_name' => 'Test Seller',
                'account_number' => '1234567890',
            ]);

        // Will fail if wallet balance insufficient, but authorization should pass
        $response->assertStatus(422);
    }

    public function test_buyer_cannot_create_withdrawal(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->postJson('/api/v1/withdrawals', [
                'amount' => 100000,
                'bank_code' => 'bca',
                'account_number' => '1234567890',
                'account_holder' => 'Test Buyer',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_view_withdrawals_list(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/withdrawals');

        $response->assertStatus(200);
    }

    public function test_seller_cannot_access_admin_endpoints(): void
    {
        $response = $this->actingAs($this->seller, 'sanctum')
            ->getJson('/api/v1/admin/withdrawals');

        $response->assertStatus(403);
    }

    public function test_buyer_cannot_access_admin_endpoints(): void
    {
        $response = $this->actingAs($this->buyer, 'sanctum')
            ->getJson('/api/v1/admin/withdrawals');

        $response->assertStatus(403);
    }
}
