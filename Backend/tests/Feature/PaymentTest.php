<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use App\Services\PaymentService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role, string $suffix = ''): User
    {
        $key = $role.$suffix;
        $user = User::create([
            'name' => ucfirst($role).$suffix,
            'email' => $key.'@pay-test.com',
            'phone' => '08'.rand(100000000, 999999999),
            'password' => bcrypt('password'),
            'role' => $role,
            'status' => 'active',
        ]);
        Wallet::create(['user_id' => $user->id, 'available_balance' => 0, 'held_balance' => 0]);

        return $user;
    }

    private function createProduct(User $seller, string $status = 'active'): Product
    {
        $brand = Brand::firstOrCreate(['name' => 'TestBrand'], ['slug' => 'testbrand']);
        $cat = Category::firstOrCreate(['name' => 'TestCat'], ['slug' => 'testcat']);

        return Product::create([
            'seller_id' => $seller->id, 'brand_id' => $brand->id, 'category_id' => $cat->id,
            'model' => 'TestLaptop', 'slug' => 'test-laptop-'.uniqid(),
            'cpu' => 'i5', 'ram' => 8, 'storage' => 256, 'storage_type' => 'SSD',
            'screen_size' => '14"', 'price' => 5000000, 'condition' => 'good',
            'location' => 'Jakarta', 'description' => 'desc', 'status' => $status,
        ]);
    }

    private function createOrder(User $buyer, User $seller, Product $product, string $status = 'waiting_payment'): Order
    {
        return Order::create([
            'order_number' => 'INV-20260619-'.rand(1000, 9999),
            'product_id' => $product->id,
            'buyer_id' => $buyer->id,
            'seller_id' => $seller->id,
            'product_price' => 5000000,
            'platform_fee' => 250000,
            'total_amount' => 5250000,
            'product_snapshot' => $product->toArray(),
            'booking_expires_at' => Carbon::now()->addDay(),
            'status' => $status,
        ]);
    }

    private function createPayment(Order $order, string $status = 'pending'): Payment
    {
        return Payment::create([
            'order_id' => $order->id,
            'snap_token' => 'snap-token-test',
            'gross_amount' => 5250000,
            'status' => $status,
        ]);
    }

    private function webhookPayload(Order $order, string $transactionStatus, string $fraudStatus = 'accept'): array
    {
        $serverKey = config('services.midtrans.server_key');
        $grossAmount = '5250000.00';
        $statusCode = $transactionStatus === 'settlement' ? '200' : '201';

        return [
            'transaction_id' => 'txn-'.uniqid(),
            'order_id' => $order->order_number,
            'transaction_status' => $transactionStatus,
            'fraud_status' => $fraudStatus,
            'payment_type' => 'bank_transfer',
            'gross_amount' => $grossAmount,
            'status_code' => $statusCode,
            'signature_key' => hash('sha512', $order->order_number.$statusCode.$grossAmount.$serverKey),
        ];
    }

    // ========== Create Payment ==========

    public function test_buyer_can_create_payment(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);

        // Mock Midtrans Snap
        $mock = Mockery::mock('overload:Midtrans\Snap');
        $mock->shouldReceive('createTransaction')
            ->once()
            ->andReturn((object) ['token' => 'snap-abc', 'redirect_url' => 'https://app.sandbox.midtrans.com/snap/abc']);

        $response = $this->actingAs($buyer)->postJson("/api/v1/orders/{$order->id}/pay");

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.snap_token', 'snap-abc')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('payments', [
            'order_id' => $order->id,
            'snap_token' => 'snap-abc',
            'status' => 'pending',
        ]);
    }

    public function test_cannot_pay_non_waiting_payment_order(): void
    {
        $buyer = $this->createUser('buyer');
        $seller = $this->createUser('seller');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product, 'paid');

        $response = $this->actingAs($buyer)->postJson("/api/v1/orders/{$order->id}/pay");

        // The logic might be updated to throw 422 if order is not waiting payment
        $response->assertStatus(422);
    }

    public function test_other_buyer_cannot_pay_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer1 = $this->createUser('buyer', '1');
        $buyer2 = $this->createUser('buyer', '2');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer1, $seller, $product);

        $this->actingAs($buyer2)->postJson("/api/v1/orders/{$order->id}/pay")
            ->assertStatus(403);
    }

    // ========== Webhook Success ==========

    public function test_webhook_settlement_marks_payment_success_and_order_paid(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $payload = $this->webhookPayload($order, 'settlement');

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);

        $this->assertEquals('success', $payment->fresh()->status);
        $this->assertNotNull($payment->fresh()->paid_at);
        $this->assertEquals('paid', $order->fresh()->status);
        $this->assertNotNull($order->fresh()->paid_at);
    }

    public function test_webhook_capture_with_accept_marks_success(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $payload = $this->webhookPayload($order, 'capture', 'accept');

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);

        $this->assertEquals('success', $payment->fresh()->status);
        $this->assertEquals('paid', $order->fresh()->status);
    }

    // ========== Webhook Expire ==========

    public function test_webhook_expire_marks_payment_expired_and_restores_product(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $payload = $this->webhookPayload($order, 'expire');

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);

        $this->assertEquals('expired', $payment->fresh()->status);
        $this->assertEquals('expired', $order->fresh()->status);
        $this->assertEquals('active', $product->fresh()->status);
    }

    // ========== PHASE 12 CRITICAL FIX TESTS ==========

    public function test_webhook_rejects_non_waiting_payment_order(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'paid');
        $order = $this->createOrder($buyer, $seller, $product, 'paid'); // already paid
        $payment = $this->createPayment($order, 'success');

        $payload = $this->webhookPayload($order, 'settlement');

        $response = $this->postJson('/api/v1/payments/webhook', $payload);

        // Should reject with error
        $response->assertStatus(400);
        $response->assertJson(['status' => 'error']);

        // Order should remain paid
        $this->assertEquals('paid', $order->fresh()->status);
    }

    public function test_webhook_with_different_transaction_id_is_rejected(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $payload = $this->webhookPayload($order, 'settlement');
        $txn_id_1 = $payload['transaction_id'];

        // First webhook with transaction_id_1
        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);
        $this->assertEquals('success', $payment->fresh()->status);
        $this->assertEquals($txn_id_1, $payment->fresh()->transaction_id);

        // Second webhook with different transaction_id_2 should be rejected
        $payload['transaction_id'] = 'txn-different-'.uniqid();
        $payload['signature_key'] = hash('sha512',
            $order->order_number.'200'.'5250000.00'.config('services.midtrans.server_key')
        );

        $response = $this->postJson('/api/v1/payments/webhook', $payload);
        $response->assertStatus(400);

        // Payment should not be updated
        $this->assertEquals($txn_id_1, $payment->fresh()->transaction_id);
    }

    // ========== Webhook Idempotency ==========

    public function test_duplicate_webhook_is_ignored(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order, 'success'); // already success

        $payload = $this->webhookPayload($order, 'settlement');

        // Second webhook should be ignored, order stays paid
        $order->update(['status' => 'paid', 'paid_at' => now()]);

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(200);

        // Status unchanged
        $this->assertEquals('success', $payment->fresh()->status);
        $this->assertEquals('paid', $order->fresh()->status);
    }

    // ========== Unauthorized Webhook ==========

    public function test_webhook_with_invalid_signature_is_rejected(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $this->createPayment($order);

        $payload = $this->webhookPayload($order, 'settlement');
        $payload['signature_key'] = 'invalid-signature';

        $this->postJson('/api/v1/payments/webhook', $payload)->assertStatus(400);
    }

    // ========== Payment Detail ==========

    public function test_buyer_can_view_own_payment(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $this->actingAs($buyer)->getJson("/api/v1/payments/{$payment->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $payment->id);
    }

    public function test_seller_can_view_payment_for_own_product(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $this->actingAs($seller)->getJson("/api/v1/payments/{$payment->id}")
            ->assertStatus(200);
    }

    public function test_other_user_cannot_view_payment(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $stranger = $this->createUser('buyer', 'stranger');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $this->actingAs($stranger)->getJson("/api/v1/payments/{$payment->id}")
            ->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_view_payment(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        $this->getJson("/api/v1/payments/{$payment->id}")
            ->assertStatus(401);
    }

    // ========== expirePayment ==========

    public function test_expire_payment_updates_payment_order_and_product(): void
    {
        $seller = $this->createUser('seller');
        $buyer = $this->createUser('buyer');
        $product = $this->createProduct($seller, 'booked');
        $order = $this->createOrder($buyer, $seller, $product);
        $payment = $this->createPayment($order);

        app(PaymentService::class)->expirePayment($payment);

        $this->assertEquals('expired', $payment->fresh()->status);
        $this->assertEquals('expired', $order->fresh()->status);
        $this->assertEquals('active', $product->fresh()->status);
    }
}
