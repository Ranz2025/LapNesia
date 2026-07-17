<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\ProductReturn;
use App\Services\ReturnService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class ReturnServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private ReturnService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(ReturnService::class);
    }

    public function test_request_return_creates_pending_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        $return = $this->service->request($order, (int) $buyer->id, 'Product is broken');

        $this->assertInstanceOf(ProductReturn::class, $return);
        $this->assertEquals('pending', $return->status);
        $this->assertEquals($buyer->id, $return->buyer_id);
        $this->assertEquals($seller->id, $return->seller_id);
    }

    public function test_update_status_to_approved(): void
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

        $updated = $this->service->updateStatus($return, 'approved');
        $this->assertEquals('approved', $updated->status);
        $this->assertNotNull($updated->approved_at);
    }

    public function test_update_status_to_rejected(): void
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

        $updated = $this->service->updateStatus($return, 'rejected', 'Product works fine');
        $this->assertEquals('rejected', $updated->status);
        $this->assertEquals('Product works fine', $updated->seller_notes);
    }

    public function test_submit_resi(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Test',
            'status' => 'approved', // Return is approved
        ]);

        $updated = $this->service->submitResi($return, (int) $buyer->id, 'JNE999888777');
        $this->assertEquals('approved', $updated->status); // Based on submitResi logic, it only updates resi
        $this->assertEquals('JNE999888777', $updated->return_resi);
    }

    public function test_complete_return(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, ['status' => 'completed']);

        // Provide seller enough available balance to refund the buyer
        $sellerWallet = $seller->wallet;
        $sellerWallet->update(['available_balance' => $order->total_amount + 1000000]);

        $return = ProductReturn::create([
            'order_id' => $order->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'reason' => 'Defective',
            'status' => 'approved',
        ]);
        $return->refresh(); // ensure default status 'pending' is overwritten or fetch correct

        $completed = $this->service->completeReturn($return, 'Product received back');
        $this->assertEquals('completed', $completed->status);
        $this->assertNotNull($completed->completed_at);
    }

    public function test_get_all_returns(): void
    {
        $result = $this->service->getAllReturns();
        $this->assertNotNull($result);
    }
}
