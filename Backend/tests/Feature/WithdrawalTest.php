<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WithdrawalTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role, string $suffix = ''): User
    {
        $key = $role.$suffix;
        $user = User::create([
            'name' => ucfirst($role).$suffix,
            'email' => $key.'@withdraw-test.com',
            'phone' => '08'.rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);

        return $user;
    }

    private function createWithdrawal(User $user, int $amount = 1000000, string $status = 'pending'): Withdrawal
    {
        $wallet = Wallet::where('user_id', $user->id)->first();

        return Withdrawal::create([
            'wallet_id' => $wallet->id,
            'amount' => $amount,
            'bank_name' => 'BCA', // Default valid bank name
            'account_name' => 'Test User Account', // Default valid account name
            'account_number' => '1234567890', // Default valid account number
            'status' => $status,
        ]);
    }

    // ========== Create Withdrawal ==========

    public function test_seller_can_create_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $response = $this->actingAs($seller)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John Doe',
            'account_number' => '1234567890',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending'); // Should be pending by default

        $this->assertDatabaseHas('withdrawals', [
            'wallet_id' => $wallet->id,
            'amount' => 1000000,
            'status' => 'pending',
        ]);
    }

    public function test_technician_can_create_withdrawal(): void
    {
        $tech = $this->createUser('technician');
        $wallet = Wallet::where('user_id', $tech->id)->first();
        $wallet->update(['available_balance' => 2000000]);

        $response = $this->actingAs($tech)->postJson('/api/v1/withdrawals', [
            'amount' => 500000,
            'bank_name' => 'Mandiri',
            'account_name' => 'Jane Tech',
            'account_number' => '9876543210',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'pending'); // Should be pending by default
        $this->assertEquals(1500000, (float) $wallet->fresh()->available_balance);
    }

    // ========== Insufficient Balance ==========

    public function test_cannot_withdraw_more_than_available_balance(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 500000]);

        $response = $this->actingAs($seller)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ]);

        $response->assertStatus(422);
    }

    public function test_minimum_withdrawal_amount(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000]);

        $response = $this->actingAs($seller)->postJson('/api/v1/withdrawals', [
            'amount' => 5000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ]);

        $response->assertStatus(422);
    }

    // ========== Approve Withdrawal ==========

    public function test_admin_can_approve_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/approve");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.approved_by', $admin->id);

        $this->assertNotNull($withdrawal->fresh()->processed_at);
    }

    // ========== Reject Withdrawal ==========

    public function test_admin_can_reject_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000, 'frozen_balance' => 0]);

        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        // Manually freeze for this test (in real flow, create() does this)
        $wallet->decrement('available_balance', 1000000);
        $wallet->increment('frozen_balance', 1000000);

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/reject", [
            'rejection_reason' => 'Data tidak sesuai',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Data tidak sesuai');
    }

    // ========== Restore Balance After Reject ==========

    public function test_balance_restored_after_rejection(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $response = $this->actingAs($seller)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ]);

        $response->assertStatus(201); // Withdrawal created, balance frozen

        // Get withdrawal ID
        $withdrawal = Withdrawal::first();

        // Sebelum reject: available_balance sudah berkurang
        $this->assertEquals(4000000, (float) $wallet->fresh()->available_balance);

        $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/reject", [
            'rejection_reason' => 'Ditolak',
        ]);

        // Setelah reject: saldo dikembalikan
        $this->assertEquals(5000000, (float) $wallet->fresh()->available_balance);
    }

    // ========== Seller Cannot Approve ==========

    public function test_seller_cannot_approve_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin'); // Admin needed for proper approved_by
        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        $response = $this->actingAs($seller)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/approve")
            ->assertStatus(403);
    }

    public function test_seller_cannot_reject_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin'); // Admin needed for proper approved_by
        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        $response = $this->actingAs($seller)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/reject", [
            'rejection_reason' => 'Ditolak',
        ])->assertStatus(403);
    }

    // ========== Unauthorized Access ==========

    public function test_buyer_cannot_create_withdrawal(): void
    {
        $buyer = $this->createUser('buyer');
        $wallet = Wallet::where('user_id', $buyer->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $response = $this->actingAs($buyer)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ])->assertStatus(403);
    }

    public function test_unauthenticated_cannot_create_withdrawal(): void
    {
        $this->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ])->assertStatus(401);
    }

    public function test_seller_cannot_see_other_sellers_withdrawal(): void
    {
        $seller1 = $this->createUser('seller', '1');
        $seller2 = $this->createUser('seller', '2');
        $withdrawal = $this->createWithdrawal($seller1, 1000000, 'pending'); // Create for seller1

        $this->actingAs($seller2)->getJson("/api/v1/withdrawals/{$withdrawal->id}")
            ->assertStatus(403);
    }

    // ========== Audit Log ==========

    public function test_audit_log_created_on_withdrawal_create(): void
    {
        $seller = $this->createUser('seller');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $this->actingAs($seller)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $seller->id,
            'action' => 'withdrawal_created',
            'auditable_type' => Withdrawal::class,
        ]);
    }

    public function test_audit_log_created_on_approval(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000]);

        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/approve");

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'withdrawal_approved',
        ]);
    }

    // ========== Wallet Transaction ==========

    public function test_wallet_transaction_created_on_rejection(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $wallet = Wallet::where('user_id', $seller->id)->first();
        $wallet->update(['available_balance' => 5000000, 'frozen_balance' => 0]);

        $withdrawal = $this->createWithdrawal($seller, 1000000, 'pending');

        // Manually freeze for this test (in real flow, create() does this)
        $wallet->decrement('available_balance', 1000000);
        $wallet->increment('frozen_balance', 1000000);

        $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/reject", [
            'rejection_reason' => 'Ditolak',
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'reference_id' => $withdrawal->id,
            'reference_type' => Withdrawal::class,
            'type' => 'withdrawal_rejected',
        ]);
    }

    // ========== Duplicate Approval Prevention ==========

    public function test_cannot_approve_already_approved_withdrawal(): void
    {
        $seller = $this->createUser('seller');
        $admin = $this->createUser('admin');
        $withdrawal = $this->createWithdrawal($seller, 1000000, 'approved'); // Create as approved

        $response = $this->actingAs($admin)->putJson("/api/v1/admin/withdrawals/{$withdrawal->id}/approve");

        $response->assertStatus(422);
    }

    // ========== View Authorization ==========

    public function test_admin_can_view_all_withdrawals(): void
    {
        $admin = $this->createUser('admin');
        $seller1 = $this->createUser('seller', '1');
        $seller2 = $this->createUser('seller', '2');

        $wallet1 = Wallet::where('user_id', $seller1->id)->first();
        $wallet2 = Wallet::where('user_id', $seller2->id)->first();
        $wallet1->update(['available_balance' => 5000000]);
        $wallet2->update(['available_balance' => 5000000]);

        // Create withdrawals through the API
        $this->actingAs($seller1)->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'John',
            'account_number' => '123',
        ])->assertStatus(201); // Assert 201 here

        $this->actingAs($seller2)->postJson('/api/v1/withdrawals', [
            'amount' => 2000000,
            'bank_name' => 'Mandiri',
            'account_name' => 'Jane',
            'account_number' => '456',
        ])->assertStatus(201); // Assert 201 here

        // Admin should see both
        $this->assertCount(2, Withdrawal::all());

        $response = $this->actingAs($admin)->getJson('/api/v1/admin/withdrawals');
        $response->assertStatus(200);
    }
}
