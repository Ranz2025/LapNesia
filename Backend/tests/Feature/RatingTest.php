<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Rating;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        $user = User::create([
            'name'     => ucfirst($role) . ' User',
            'email'    => $role . '@lapnesia.com',
            'phone'    => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role'     => $role,
            'status'   => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);
        return $user;
    }

    private function createProduct(User $seller): Product
    {
        $brand = Brand::firstOrCreate(['name' => 'BrandA'], ['slug' => 'branda']);
        $cat   = Category::firstOrCreate(['name' => 'CatA'], ['slug' => 'cata']);
        return Product::create([
            'seller_id' => $seller->id, 'brand_id' => $brand->id, 'category_id' => $cat->id,
            'model' => 'ModelA', 'slug' => 'model-a-' . uniqid(),
            'cpu' => 'i5', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD',
            'screen_size' => '14"', 'price' => 1000000, 'condition' => 'good',
            'location' => 'Jakarta', 'description' => 'desc', 'status' => 'booked',
        ]);
    }

    public function test_buyer_can_rate_completed_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        
        $order = Order::create([
            'order_number'       => 'INV-' . uniqid(),
            'product_id'         => $product->id,
            'buyer_id'           => $buyer->id,
            'seller_id'          => $seller->id,
            'product_price'      => 1000000,
            'platform_fee'       => 50000,
            'total_amount'       => 1050000,
            'product_snapshot'   => $product->toArray(),
            'booking_expires_at' => now()->addDay(),
            'status'             => 'completed',
            'completed_at'       => now(),
        ]);

        $response = $this->actingAs($buyer)
            ->postJson('/api/v1/ratings', [
                'order_id' => $order->id,
                'seller_rating' => 5,
                'seller_review' => 'Luar biasa bagus!',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        $this->assertEquals(5, $product->fresh()->avg_rating);
        $this->assertEquals(5, $seller->fresh()->avg_rating);
    }
}
