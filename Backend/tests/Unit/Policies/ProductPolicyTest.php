<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ProductPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_anyone_can_view_any_products(): void
    {
        $buyer = $this->createBuyer();
        $this->assertTrue($buyer->can('viewAny', Product::class));
    }

    public function test_anyone_can_view_a_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertTrue($buyer->can('view', $product));
    }

    public function test_seller_can_create_product(): void
    {
        $seller = $this->createSeller();
        $this->assertTrue($seller->can('create', Product::class));
    }

    public function test_buyer_cannot_create_product(): void
    {
        $buyer = $this->createBuyer();
        $this->assertFalse($buyer->can('create', Product::class));
    }

    public function test_seller_can_update_own_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertTrue($seller->can('update', $product));
    }

    public function test_seller_cannot_update_other_seller_product(): void
    {
        $seller1 = $this->createSeller();
        $seller2 = $this->createSeller();
        $product = $this->createProduct($seller1);

        $this->assertFalse($seller2->can('update', $product));
    }

    public function test_seller_can_delete_own_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertTrue($seller->can('delete', $product));
    }

    public function test_seller_cannot_delete_sold_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller, ['status' => 'sold']);

        $this->assertFalse($seller->can('delete', $product));
    }

    public function test_seller_can_archive_own_product(): void
    {
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertTrue($seller->can('archive', $product));
    }

    public function test_seller_cannot_archive_other_product(): void
    {
        $seller1 = $this->createSeller();
        $seller2 = $this->createSeller();
        $product = $this->createProduct($seller1);

        $this->assertFalse($seller2->can('archive', $product));
    }

    public function test_admin_can_view_any_product(): void
    {
        $admin = $this->createAdmin();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);

        $this->assertTrue($admin->can('view', $product));
    }
}
