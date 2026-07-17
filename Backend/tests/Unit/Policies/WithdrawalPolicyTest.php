<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class WithdrawalPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_seller_can_create_withdrawal(): void
    {
        $seller = $this->createSeller();
        $this->assertTrue($seller->can('create', Withdrawal::class));
    }

    public function test_technician_can_create_withdrawal(): void
    {
        $tech = $this->createTechnician();
        $this->assertTrue($tech->can('create', Withdrawal::class));
    }

    public function test_buyer_cannot_create_withdrawal(): void
    {
        $buyer = $this->createBuyer();
        $this->assertFalse($buyer->can('create', Withdrawal::class));
    }

    public function test_admin_can_view_any_withdrawal(): void
    {
        $admin = $this->createAdmin();
        $this->assertTrue($admin->can('viewAny', Withdrawal::class));
    }

    public function test_seller_can_view_any_withdrawal(): void
    {
        $seller = $this->createSeller();
        $this->assertTrue($seller->can('viewAny', Withdrawal::class));
    }

    public function test_admin_can_approve_withdrawal(): void
    {
        $admin = $this->createAdmin();
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 500000]);

        $withdrawal = Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
            'status' => 'pending',
        ]);

        $this->assertTrue($admin->can('approve', $withdrawal));
    }

    public function test_seller_cannot_approve_withdrawal(): void
    {
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 500000]);

        $withdrawal = Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
            'status' => 'pending',
        ]);

        $this->assertFalse($seller->can('approve', $withdrawal));
    }

    public function test_admin_can_reject_withdrawal(): void
    {
        $admin = $this->createAdmin();
        $seller = $this->createSeller();
        $wallet = $seller->wallet;
        $wallet->update(['available_balance' => 500000]);

        $withdrawal = Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => 100000,
            'bank_name' => 'BCA',
            'account_name' => 'Test',
            'account_number' => '1234567890',
            'status' => 'pending',
        ]);

        $this->assertTrue($admin->can('reject', $withdrawal));
    }
}
