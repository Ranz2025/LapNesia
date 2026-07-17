<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ProductServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private ProductService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ProductService::class);
    }

    public function test_get_products_returns_paginator(): void
    {
        $seller = $this->createSeller();
        $this->createProduct($seller);

        $result = $this->service->getProducts([]);
        $this->assertGreaterThanOrEqual(1, $result->total());
    }

    public function test_get_products_filters_by_brand(): void
    {
        $seller = $this->createSeller();
        $brand1 = $this->createBrand('ASUS');
        $brand2 = $this->createBrand('Lenovo');

        $this->createProduct($seller, ['brand' => $brand1, 'status' => 'active']);
        $this->createProduct($seller, ['brand' => $brand2, 'status' => 'active']);

        $result = $this->service->getProducts(['brand' => $brand1->slug]);
        foreach ($result as $product) {
            $this->assertEquals($brand1->id, $product->brand_id);
        }
    }

    public function test_get_products_filters_by_price_range(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand();
        $category = $this->createCategory();

        $this->createProduct($seller, [
            'brand' => $brand, 'category' => $category,
            'price' => 5000000, 'status' => 'active',
        ]);
        $this->createProduct($seller, [
            'brand' => $brand, 'category' => $category,
            'price' => 15000000, 'status' => 'active',
        ]);

        $result = $this->service->getProducts(['min_price' => 10000000]);
        foreach ($result as $product) {
            $this->assertGreaterThanOrEqual(10000000, $product->price);
        }
    }

    public function test_get_product_by_slug(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['slug' => 'unique-slug-test']);

        $found = $this->service->getProductBySlug('unique-slug-test');
        $this->assertNotNull($found);
        $this->assertEquals($product->id, $found->id);
    }

    public function test_get_product_by_slug_returns_null_when_not_found(): void
    {
        $result = $this->service->getProductBySlug('nonexistent-slug');
        $this->assertNull($result);
    }

    public function test_create_product(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand();
        $category = $this->createCategory();

        $product = $this->service->createProduct([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'Service Test Laptop',
            'cpu' => 'AMD Ryzen 7',
            'ram' => 16,
            'storage' => 512,
            'storage_type' => 'NVMe',
            'screen_size' => '15.6"',
            'price' => 12000000,
            'condition' => 'very_good',
            'location' => 'Surabaya',
            'description' => 'Created via service',
        ], $seller->id);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals($seller->id, $product->seller_id);
        $this->assertNotEmpty($product->slug);
    }

    public function test_update_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $updated = $this->service->updateProduct($product, [
            'price' => 9999999,
            'description' => 'Updated via service test',
        ]);

        $this->assertEquals(9999999, $updated->price);
        $this->assertEquals('Updated via service test', $updated->description);
    }

    public function test_delete_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $result = $this->service->deleteProduct($product);
        $this->assertTrue($result);
    }

    public function test_create_product_generates_unique_slug(): void
    {
        $seller = $this->createSeller();
        $brand = $this->createBrand();
        $category = $this->createCategory();

        $product1 = $this->service->createProduct([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'Same Model Name',
            'cpu' => 'Intel i5',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'screen_size' => '14"',
            'price' => 7000000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'description' => 'First product',
        ], $seller->id);

        $product2 = $this->service->createProduct([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'Same Model Name',
            'cpu' => 'Intel i5',
            'ram' => 8,
            'storage' => 256,
            'storage_type' => 'SSD',
            'screen_size' => '14"',
            'price' => 7500000,
            'condition' => 'good',
            'location' => 'Jakarta',
            'description' => 'Second product',
        ], $seller->id);

        $this->assertNotEquals($product1->slug, $product2->slug);
    }
}
