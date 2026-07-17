<?php

declare(strict_types=1);

namespace Tests\Unit\Services;

use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class WithdrawalServiceTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    private WithdrawalService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(WithdrawalService::class);
    }

    public function test_create_withdrawal(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);

        $withdrawal = $this->service->create($seller->wallet, [
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test Seller',
            'account_number' => '1234567890',
        ]);

        $this->assertInstanceOf(Withdrawal::class, $withdrawal);
        $this->assertEquals('pending', $withdrawal->status);
        $this->assertEquals(100000, $withdrawal->amount);
    }

    public function test_create_withdrawal_freezes_balance(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);

        $this->service->create($seller->wallet, [
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
        ]);

        $wallet = $seller->wallet->fresh();
        $this->assertEquals(400000, $wallet->available_balance);
        $this->assertEquals(100000, $wallet->frozen_balance);
    }

    public function test_approve_withdrawal(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);
        $admin = $this->createAdmin();

        $withdrawal = $this->service->create($seller->wallet, [
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
        ]);

        $approved = $this->service->approve($withdrawal, $admin);
        $this->assertEquals('approved', $approved->status);
        $this->assertEquals($admin->id, $approved->approved_by);
    }

    public function test_reject_withdrawal_restores_balance(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);
        $admin = $this->createAdmin();

        $withdrawal = $this->service->create($seller->wallet, [
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
        ]);

        $this->service->reject($withdrawal, $admin, 'Invalid account');

        $wallet = $seller->wallet->fresh();
        $this->assertEquals(500000, $wallet->available_balance);
        $this->assertEquals(0, $wallet->frozen_balance);
    }

    public function test_reject_withdrawal_stores_reason(): void
    {
        $seller = $this->createSeller();
        $seller->wallet->update(['available_balance' => 500000]);
        $admin = $this->createAdmin();

        $withdrawal = $this->service->create($seller->wallet, [
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
        ]);

        $rejected = $this->service->reject($withdrawal, $admin, 'Invalid account number');
        $this->assertEquals('rejected', $rejected->status);
        $this->assertEquals('Invalid account number', $rejected->rejection_reason);
    }
}
