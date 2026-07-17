<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\ProductReturn;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ReturnPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_create_return(): void
    {
        $buyer = $this->createBuyer();
        $this->assertTrue($buyer->can('create', ProductReturn::class));
    }

    public function test_seller_cannot_create_return(): void
    {
        $seller = $this->createSeller();
        $this->assertFalse($seller->can('create', ProductReturn::class));
    }

    public function test_buyer_can_view_own_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'pending',
        ]);

        $this->assertTrue($buyer->can('view', $return));
    }

    public function test_seller_can_view_own_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'pending',
        ]);

        $this->assertTrue($seller->can('view', $return));
    }

    public function test_other_buyer_cannot_view_return(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer1, $seller, $product, ['status' => 'completed']);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer1->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'pending',
        ]);

        $this->assertFalse($buyer2->can('view', $return));
    }

    public function test_seller_can_update_return_status(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'pending',
        ]);

        $this->assertTrue($seller->can('updateStatus', $return));
    }

    public function test_buyer_can_submit_resi(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'approved',
        ]);

        $this->assertTrue($buyer->can('submitResi', $return));
    }

    public function test_admin_can_complete_return(): void
    {
        $admin = $this->createAdmin();
        $this->assertTrue($admin->can('complete', ProductReturn::class));
    }
}
