<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ProductReturn;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ReturnTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_request_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $response = $this->actingAs($buyer, 'sanctum')
            ->postJson('/api/v1/returns', [
                'order_id' => $order->id,
                'reason' => 'Product is defective',
            ]);

        $response->assertStatus(201);
    }

    public function test_seller_cannot_request_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $response = $this->actingAs($seller, 'sanctum')
            ->postJson('/api/v1/returns', [
                'order_id' => $order->id,
                'reason' => 'Invalid return attempt',
            ]);

        $response->assertStatus(403);
    }

    public function test_buyer_can_list_returns(): void
    {
        $buyer = $this->createBuyer();

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson('/api/v1/returns');

        $response->assertStatus(200);
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

        $response = $this->actingAs($buyer, 'sanctum')
            ->getJson("/api/v1/returns/{$return->id}");

        $response->assertStatus(200);
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

        $response = $this->actingAs($seller, 'sanctum')
            ->putJson("/api/v1/returns/{$return->id}/status", [
                'status' => 'approved',
            ]);

        $response->assertStatus(200);
    }

    public function test_buyer_can_submit_return_resi(): void
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

        $response = $this->actingAs($buyer, 'sanctum')
            ->putJson("/api/v1/returns/{$return->id}/resi", [
                'return_resi' => 'JNE123456789',
            ]);

        $response->assertStatus(200);
    }

    public function test_admin_can_list_all_returns(): void
    {
        $admin = $this->createAdmin();

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/returns');

        $response->assertStatus(200);
    }

    public function test_admin_can_complete_return(): void
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

        $seller->wallet()->updateOrCreate(
            ['user_id' => $seller->id],
            [
                'available_balance' => 10000000,
                'held_balance' => 0,
                'frozen_balance' => 0,
            ]
        );

        $response = $this->actingAs($admin = $this->createAdmin(), 'sanctum')
            ->putJson("/api/v1/admin/returns/{$return->id}/complete");

        $response->assertStatus(200);
    }

    public function test_unauthenticated_cannot_access_returns(): void
    {
        $this->getJson('/api/v1/returns')->assertUnauthorized();
        $this->postJson('/api/v1/returns', [])->assertUnauthorized();
    }

    public function test_buyer_cannot_view_other_buyer_return(): void
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

        $response = $this->actingAs($buyer2, 'sanctum')
            ->getJson("/api/v1/returns/{$return->id}");

        $response->assertStatus(403);
    }
}
