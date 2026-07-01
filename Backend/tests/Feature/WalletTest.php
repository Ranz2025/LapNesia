<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\EscrowService;
use App\Services\WalletService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role, string $suffix = ''): User
    {
        $key = $role . $suffix;
        $user = User::create([
            'name'     => ucfirst($role) . $suffix,
            'email'    => $key . '@wallet-test.com',
            'phone'    => '08' . rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role'     => $role,
            'status'   => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);
        return $user;
    }

    private function createProduct(User $seller, string $status = 'booked'): Product
    {
        $brand = Brand::firstOrCreate(['name' => 'WBrand'], ['slug' => 'wbrand']);
        $cat   = Category::firstOrCreate(['name' => 'WCat'], ['slug' => 'wcat']);
        return Product::create([
            'seller_id' => $seller->id, 'brand_id' => $brand->id, 'category_id' => $cat->id,
            'model' => 'W-Laptop', 'slug' => 'w-laptop-' . uniqid(),
            'cpu' => 'i5', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD',
            'screen_size' => '14"', 'price' => 5000000, 'condition' => 'good',
            'location' => 'Jakarta', 'description' => 'desc', 'status' => $status,
        ]);
    }

    private function createOrder(User $buyer, User $seller, Product $product, string $status = 'paid'): Order
    {
        return Order::create([
            'order_number'       => 'INV-20260619-W' . rand(1000, 9999),
            'product_id'         => $product->id,
            'buyer_id'           => $buyer->id,
            'seller_id'          => $seller->id,
            'product_price'      => 5000000,
            'platform_fee'       => 250000,
            'total_amount'       => 5250000,
            'product_snapshot'   => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status'             => $status,
            'paid_at'            => $status === 'paid' ? now() : null,
        ]);
    }

    private function sellerWallet(User $seller): Wallet
    {
        return Wallet::where('user_id', $seller->id)->first();
    }

    // ========== Wallet auto-created ==========

    public function test_wallet_created_when_user_registered(): void
    {
        $seller = $this->createUser('seller');
        $this->assertDatabaseHas('wallets', ['user_id' => $seller->id]);
    }

    // ========== WalletService Unit-style ==========

    public function test_credit_increases_available_balance(): void
    {
        $seller = $this->createUser('seller');
        $wallet = $this->sellerWallet($seller);
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($this->createUser('buyer'), $seller, $product);

        app(WalletService::class)->credit($wallet, 1000000, 'sale_income', $order, 'test credit');

        $this->assertEquals(1000000, (float) $wallet->fresh()->available_balance);
    }

    public function test_debit_decreases_available_balance(): void
    {
        $seller = $this->createUser('seller');
        $wallet = $this->sellerWallet($seller);
        $wallet->update(['available_balance' => 2000000]);
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($this->createUser('buyer'), $seller, $product);

        app(WalletService::class)->debit($wallet, 500000, 'withdraw', $order, 'test debit');

        $this->assertEquals(1500000, (float) $wallet->fresh()->available_balance);
    }

    public function test_debit_throws_when_insufficient_balance(): void
    {
        $seller = $this->createUser('seller');
        $wallet = $this->sellerWallet($seller);
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($this->createUser('buyer'), $seller, $product);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Saldo tidak mencukupi.');

        app(WalletService::class)->debit($wallet, 9999999, 'withdraw', $order);
    }

    // ========== EscrowService ==========

    public function test_move_to_escrow_increases_held_balance(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);

        $wallet = $this->sellerWallet($seller);
        // product_price - platform_fee = 5000000 - 250000 = 4750000
        $this->assertEquals(4750000, (float) $wallet->fresh()->held_balance);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'type'      => 'sale_income',
            'status'    => 'escrow',
        ]);
    }

    public function test_release_escrow_moves_held_to_available(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);

        // Now release
        app(EscrowService::class)->releaseEscrow($order);

        $wallet = $this->sellerWallet($seller)->fresh();
        $this->assertEquals(4750000, (float) $wallet->available_balance);
        $this->assertEquals(0, (float) $wallet->held_balance);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'type'      => 'escrow_release',
            'status'    => 'released',
        ]);
    }

    public function test_refund_escrow_decreases_held_balance(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);
        app(EscrowService::class)->refundEscrow($order);

        $wallet = $this->sellerWallet($seller)->fresh();
        $this->assertEquals(0, (float) $wallet->held_balance);
        $this->assertEquals(0, (float) $wallet->available_balance);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $wallet->id,
            'type'      => 'refund',
            'status'    => 'refunded',
        ]);
    }

    // ========== Duplicate release prevention (idempotency) ==========

    public function test_duplicate_release_is_prevented(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);
        app(EscrowService::class)->releaseEscrow($order);
        app(EscrowService::class)->releaseEscrow($order); // second call must be ignored

        $releaseCount = WalletTransaction::where('type', 'escrow_release')
            ->where('reference_id', $order->id)
            ->count();

        $this->assertEquals(1, $releaseCount);

        // Balance should be 4750000, not double
        $wallet = $this->sellerWallet($seller)->fresh();
        $this->assertEquals(4750000, (float) $wallet->available_balance);
        $this->assertEquals(0, (float) $wallet->held_balance);
    }

    public function test_refund_without_prior_escrow_is_skipped(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        // No moveToEscrow called first
        app(EscrowService::class)->refundEscrow($order);

        $wallet = $this->sellerWallet($seller)->fresh();
        $this->assertEquals(0, (float) $wallet->held_balance);
        $this->assertEquals(0, (float) $wallet->available_balance);
    }

    // ========== Audit Trail ==========

    public function test_wallet_transactions_store_audit_trail(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);

        $txn = WalletTransaction::where('reference_id', $order->id)->first();

        $this->assertNotNull($txn->balance_before);
        $this->assertNotNull($txn->balance_after);
        $this->assertEquals($order->id, $txn->reference_id);
        $this->assertEquals(\App\Models\Order::class, $txn->reference_type);
    }

    // ========== Webhook integration ==========

    public function test_webhook_success_triggers_escrow_hold(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product, 'waiting_payment');
        \App\Models\Payment::create([
            'order_id' => $order->id, 'snap_token' => 'tok', 'gross_amount' => 5250000, 'status' => 'pending',
        ]);

        $serverKey   = config('services.midtrans.server_key');
        $grossAmount = '5250000.00';
        $statusCode  = '200';
        $payload = [
            'transaction_id'     => 'txn-webhook-escrow',
            'order_id'           => $order->order_number,
            'transaction_status' => 'settlement',
            'fraud_status'       => 'accept',
            'payment_type'       => 'bank_transfer',
            'gross_amount'       => $grossAmount,
            'status_code'        => $statusCode,
            'signature_key'      => hash('sha512', $order->order_number . $statusCode . $grossAmount . $serverKey),
        ];

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);

        $this->assertEquals('paid', $order->fresh()->status);
        $this->assertEquals(4750000, (float) $this->sellerWallet($seller)->fresh()->held_balance);
    }

    // ========== confirmReceived integration ==========

    public function test_confirm_received_releases_escrow_to_seller(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product, 'shipped');

        // Pre-populate escrow
        app(EscrowService::class)->moveToEscrow($order);

        $this->actingAs($buyer)->putJson("/api/v1/orders/{$order->id}/confirm-received")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        $wallet = $this->sellerWallet($seller)->fresh();
        $this->assertEquals(4750000, (float) $wallet->available_balance);
        $this->assertEquals(0, (float) $wallet->held_balance);
    }

    // ========== API Endpoints ==========

    public function test_user_can_view_own_wallet(): void
    {
        $user = $this->createUser('seller');

        $this->actingAs($user)->getJson('/api/v1/wallet')
            ->assertStatus(200)
            ->assertJsonPath('data.user_id', $user->id);
    }

    public function test_unauthenticated_user_cannot_view_wallet(): void
    {
        $this->getJson('/api/v1/wallet')->assertStatus(401);
    }

    public function test_user_can_view_wallet_transactions(): void
    {
        $seller  = $this->createUser('seller');
        $buyer   = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order   = $this->createOrder($buyer, $seller, $product);

        app(EscrowService::class)->moveToEscrow($order);

        $this->actingAs($seller)->getJson('/api/v1/wallet/transactions')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_withdraw_fails_when_insufficient_balance(): void
    {
        $seller = $this->createUser('seller');

        $this->actingAs($seller)->postJson('/api/v1/wallet/withdraw', ['amount' => 9999999])
            ->assertStatus(422);
    }

    public function test_withdraw_succeeds_with_sufficient_balance(): void
    {
        $seller = $this->createUser('seller');
        $wallet = $this->sellerWallet($seller);
        $wallet->update(['available_balance' => 2000000]);

        $this->actingAs($seller)->postJson('/api/v1/wallet/withdraw', ['amount' => 500000])
            ->assertStatus(200);

        $this->assertEquals(1500000, (float) $wallet->fresh()->available_balance);
    }
}
