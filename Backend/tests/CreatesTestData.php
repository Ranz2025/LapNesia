<?php

declare(strict_types=1);

namespace Tests;

use App\Models\Brand;
use App\Models\Category;
use App\Models\InspectionJob;
use App\Models\Order;
use App\Models\Product;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Models\Wallet;

trait CreatesTestData
{
    protected function createUser(string $role = 'buyer', string $status = 'active', array $overrides = []): User
    {
        $user = User::create(array_merge([
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->unique()->numerify('08##########'),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => $status,
        ], $overrides));

        Wallet::create([
            'user_id' => $user->id,
            'available_balance' => 0,
            'held_balance' => 0,
            'frozen_balance' => 0,
        ]);

        return $user;
    }

    protected function createBuyer(array $overrides = []): User
    {
        $user = $this->createUser('buyer', 'active', $overrides);
        $user->wallet->update(['available_balance' => 50000000]);

        return $user;
    }

    protected function createSeller(array $overrides = []): User
    {
        return $this->createUser('seller', 'active', $overrides);
    }

    protected function createAdmin(array $overrides = []): User
    {
        return $this->createUser('admin', 'active', $overrides);
    }

    protected function createOwner(array $overrides = []): User
    {
        return $this->createUser('owner', 'active', $overrides);
    }

    protected function createTechnician(array $overrides = []): User
    {
        $user = $this->createUser('technician', 'active', $overrides);

        if (! $user->technicianProfile) {
            TechnicianProfile::create([
                'user_id' => $user->id,
                'inspection_fee' => 150000,
            ]);
        }

        return $user;
    }

    protected function createBrand(string $name = 'ASUS', ?string $slug = null): Brand
    {
        $uniqueName = $name.'-'.uniqid();

        return Brand::firstOrCreate(
            ['name' => $uniqueName],
            ['slug' => $slug ?? strtolower($uniqueName)]
        );
    }

    protected function createCategory(string $name = 'Laptop', ?string $slug = null): Category
    {
        $uniqueName = $name.'-'.uniqid();

        return Category::firstOrCreate(
            ['name' => $uniqueName],
            ['slug' => $slug ?? strtolower($uniqueName)]
        );
    }

    protected function createProduct(User $seller, array $overrides = []): Product
    {
        $brand = $overrides['brand'] ?? $this->createBrand();
        $category = $overrides['category'] ?? $this->createCategory();
        unset($overrides['brand'], $overrides['category']);

        return Product::create(array_merge([
            'seller_id' => $seller->id,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'VivoBook '.uniqid(),
            'slug' => 'product-'.uniqid(),
            'cpu' => 'Intel i7',
            'ram' => 16,
            'storage' => 512,
            'storage_type' => 'SSD',
            'screen_size' => '15.6"',
            'price' => 8000000,
            'condition' => 'very_good',
            'location' => 'Jakarta',
            'description' => 'Test product description',
            'stock' => 1,
            'status' => 'active',
        ], $overrides));
    }

    protected function createOrder(User $buyer, User $seller, Product $product, array $overrides = []): Order
    {
        return Order::create(array_merge([
            'order_number' => 'ORD-'.strtoupper(uniqid()),
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => $product->price,
            'platform_fee' => $product->price * 0.05,
            'total_amount' => $product->price * 1.05,
            'product_snapshot' => ['model' => $product->model],
            'booking_expires_at' => now()->addDay(),
            'status' => 'waiting_payment',
        ], $overrides));
    }

    protected function createJob(User $buyer, User $technician, string $status = 'pending'): InspectionJob
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        return InspectionJob::create([
            'product_id' => $product->id,
            'technician_id' => $technician->id,
            'requested_by' => $buyer->id,
            'status' => $status,
            'fee' => 150000,
            'location' => 'Jakarta',
            'scheduled_date' => now()->addDays(2),
            'notes' => 'Test',
        ]);
    }
}
