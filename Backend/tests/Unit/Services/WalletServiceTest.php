<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private WalletService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(WalletService::class);
    }

    public function test_credit_increases_available_balance(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $transaction = $this->service->credit($wallet, 100000, 'sale_income', $order, 'Test credit');

        $this->assertEquals(100000, $wallet->fresh()->available_balance);
        $this->assertInstanceOf(WalletTransaction::class, $transaction);
    }

    public function test_debit_decreases_available_balance(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 500000]);
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->service->debit($wallet, 200000, 'withdraw', $order, 'Test debit');

        $this->assertEquals(300000, $wallet->fresh()->available_balance);
    }

    public function test_debit_fails_with_insufficient_balance(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 50000]);
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->expectException(\Exception::class);
        $this->service->debit($wallet, 100000, 'withdraw', $order, 'Should fail');
    }

    public function test_hold_moves_to_held_balance(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->service->hold($buyer->wallet, 100000, 'sale_income', $order, 'Escrow hold');

        $wallet = $buyer->wallet->fresh();
        $this->assertEquals(100000, $wallet->held_balance);
    }

    public function test_release_moves_held_to_available(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $buyer->wallet->update(['held_balance' => 100000]);

        $this->service->release($buyer->wallet, 100000, 'escrow_release', $order, 'Release escrow');

        $wallet = $buyer->wallet->fresh();
        $this->assertEquals(0, $wallet->held_balance);
        $this->assertEquals(50100000, $wallet->available_balance);
    }

    public function test_refund_decreases_held_balance(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $buyer->wallet->update(['held_balance' => 100000]);

        $this->service->refund($buyer->wallet, 100000, 'refund', $order, 'Refund escrow');

        $wallet = $buyer->wallet->fresh();
        $this->assertEquals(0, $wallet->held_balance);
    }

    public function test_freeze_for_withdrawal(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 500000]);
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->service->freezeForWithdrawal($wallet, 200000, 'freeze', $order, 'Freeze for withdrawal');

        $wallet->refresh();
        $this->assertEquals(300000, $wallet->available_balance);
        $this->assertEquals(200000, $wallet->frozen_balance);
    }

    public function test_release_freeze(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 300000, 'frozen_balance' => 200000]);
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->service->releaseFreeze($wallet, 200000, 'release_freeze', $order, 'Release frozen');

        $wallet->refresh();
        $this->assertEquals(500000, $wallet->available_balance);
        $this->assertEquals(0, $wallet->frozen_balance);
    }

    public function test_transaction_records_audit_trail(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $buyer = $this->createBuyer();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $this->service->credit($wallet, 250000, 'sale_income', $order, 'Sale credit');

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'amount' => 250000,
            'type' => 'sale_income',
        ]);
    }
}
