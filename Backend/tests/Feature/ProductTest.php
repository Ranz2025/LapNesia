<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_public_can_list_products(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand();
        $category = $this->createCategory();
        $this->createProduct($seller, ['brand' => $brand, 'category' => $category, 'status' => 'active']);

        $response = $this->getJson('/api/v1/products');
        $response->assertStatus(200);
    }

    public function test_public_can_view_product_by_slug(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['slug' => 'test-slug-view']);

        $response = $this->getJson('/api/v1/products/test-slug-view');
        $response->assertStatus(200);
    }

    public function test_public_can_list_brands(): void
    {
        $this->createBrand('TestBrand');
        $response = $this->getJson('/api/v1/brands');
        $response->assertStatus(200);
    }

    public function test_public_can_list_categories(): void
    {
        $this->createCategory('TestCat');
        $response = $this->getJson('/api/v1/categories');
        $response->assertStatus(200);
    }

    public function test_seller_can_list_own_products(): void
    {
        $seller = $this->createSeller();
        $this->createProduct($seller);

        $response = $this->actingAs($seller, 'sanctum')
            ->getJson('/api/v1/seller/products');

        $response->assertStatus(200);
    }

    public function test_seller_can_view_own_product_detail(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $response = $this->actingAs($seller, 'sanctum')
            ->getJson("/api/v1/seller/products/{$product->id}");

        $response->assertStatus(200);
    }

    public function test_seller_can_create_product(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand();
        $category = $this->createCategory();

        $response = $this->actingAs($seller)
            ->postJson('/api/v1/seller/products', [
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'model' => 'New Laptop Model',
                'cpu' => 'Intel i5',
                'ram' => 8,
                'storage' => 256,
                'storage_type' => 'SSD',
                'screen_size' => '14"',
                'price' => 5000000,
                'condition' => 'good',
                'location' => 'Bandung',
                'description' => 'Brand new laptop for testing',
                'stock' => 1,
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', ['model' => 'New Laptop Model', 'seller_id' => $seller->id]);
    }

    public function test_buyer_cannot_create_product(): void
    {
        $buyer = $this->createBuyer();
        $brand = $this->createBrand();
        $category = $this->createCategory();

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/v1/seller/products', [
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'model' => 'Illegal Product',
                'cpu' => 'Intel i5',
                'ram' => 8,
                'storage' => 256,
                'storage_type' => 'SSD',
                'screen_size' => '14"',
                'price' => 5000000,
                'condition' => 'good',
                'location' => 'Surabaya',
                'description' => 'Should not be created',
            ]);

        $response->assertStatus(403);
    }

    public function test_seller_can_update_own_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $response = $this->actingAs($seller, 'sanctum')
            ->putJson("/api/v1/seller/products/{$product->id}", [
                'price' => 9500000,
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200);
    }

    public function test_seller_cannot_update_other_seller_product(): void
    {
        $seller1 = $this->createSeller();
        $seller2 = $this->createSeller();
        $product = $this->createProduct($seller1);

        $response = $this->actingAs($seller2, 'sanctum')
            ->putJson("/api/v1/seller/products/{$product->id}", [
                'price' => 100,
            ]);

        $response->assertStatus(403);
    }

    public function test_seller_can_archive_own_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $response = $this->actingAs($seller, 'sanctum')
            ->putJson("/api/v1/seller/products/{$product->id}/archive");

        $response->assertStatus(200);
    }

    public function test_seller_cannot_archive_other_seller_product(): void
    {
        $seller1 = $this->createSeller();
        $seller2 = $this->createSeller();
        $product = $this->createProduct($seller1);

        $response = $this->actingAs($seller2, 'sanctum')
            ->putJson("/api/v1/seller/products/{$product->id}/archive");

        $response->assertStatus(403);
    }

    public function test_product_creation_requires_validation(): void
    {
        $seller = $this->createSeller();

        $response = $this->actingAs($seller, 'sanctum')
            ->postJson('/api/v1/seller/products', []);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_create_product(): void
    {
        $response = $this->postJson('/api/v1/seller/products', []);
        $response->assertUnauthorized();
    }
}
