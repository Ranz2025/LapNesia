<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class E2EFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_full_application_flow()
    {
        Storage::fake('public');

        // Mock Midtrans for payments
        $midtransMock = \Mockery::mock('alias:Midtrans\Snap');
        $midtransMock->shouldReceive('createTransaction')->andReturn((object) [
            'token' => 'mock-snap-token-123',
            'redirect_url' => 'https://mock.midtrans.com/pay',
        ]);

        // 1. REGISTRATION AND LOGIN
        // Register Seller
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Seller E2E',
            'email' => 'seller@e2e.test',
            'phone' => '081234567890',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'seller',
        ]);
        $response->assertStatus(201);
        $sellerToken = $response->json('data.access_token');
        $sellerId = $response->json('data.user.id');

        // Register Buyer
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Buyer E2E',
            'email' => 'buyer@e2e.test',
            'phone' => '081234567891',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'buyer',
        ]);
        $response->assertStatus(201);
        $buyerToken = $response->json('data.access_token');
        $buyerId = $response->json('data.user.id');

        // Register Technician
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Tech E2E',
            'email' => 'tech@e2e.test',
            'phone' => '081234567892',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'technician',
        ]);
        $response->assertStatus(201);
        $techId = $response->json('data.user.id');

        // Admin approve Technician (Bypass HTTP to avoid Sanctum guard pollution in testing)
        User::find($techId)->update(['is_verified_technician' => true]);

        // Tech Login
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'tech@e2e.test',
            'password' => 'password123',
        ]);
        $response->assertStatus(200);
        $techToken = $response->json('data.access_token');

        // 2. SELLER UPLOAD PRODUCT
        \Auth::guard('sanctum')->forgetUser();
        $brand = Brand::create(['name' => 'Lenovo', 'slug' => 'lenovo']);
        $category = Category::create(['name' => 'Laptop', 'slug' => 'laptop']);

        $response = $this->postJson('/api/v1/seller/products', [
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'ThinkPad T14 E2E',
            'description' => 'Test',
            'price' => 15000000,
            'condition' => 'good',
            'status' => 'active',
            'stock' => 1,
            'location' => 'Jakarta',
            'cpu' => 'Intel i7',
            'ram' => 16,
            'storage' => 512,
            'storage_type' => 'SSD',
            'gpu' => 'Intel Iris',
            'screen_size' => '14 inch',
            'resolution' => 'FHD',
        ], ['Authorization' => "Bearer $sellerToken"]);
        $response->assertStatus(201);
        $productId = $response->json('data.id');
        $productSlug = $response->json('data.slug');

        // 3. BUYER SEARCH PRODUCT
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->getJson('/api/v1/products?search=ThinkPad T14 E2E');
        $response->assertStatus(200);
        $this->assertGreaterThan(0, count($response->json('data.data')));

        // Tech Add Availability
        \Auth::guard('sanctum')->forgetUser();
        $res = $this->postJson('/api/v1/technician/availability', [
            'available_date' => now()->addDays(2)->format('Y-m-d'),
            'start_time' => '09:00',
            'end_time' => '17:00',
        ], ['Authorization' => "Bearer $techToken"]);
        $res->assertStatus(201);

        // 4. BOOKING INSPECTION
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/inspection-jobs', [
            'product_id' => $productId,
            'technician_id' => $techId,
            'scheduled_at' => now()->addDays(2)->format('Y-m-d 09:00:00'),
            'laptop_address' => 'Jakarta',
        ], ['Authorization' => "Bearer $buyerToken"]);
        // dump("JOB RES:", $response->json());
        $response->assertStatus(201);
        $jobId = $response->json('data.id');

        // 5. TECHNICIAN ACCEPTS JOB
        \Auth::guard('sanctum')->forgetUser();
        $this->putJson("/api/v1/inspection-jobs/{$jobId}/accept", [], ['Authorization' => "Bearer $techToken"])
            ->assertStatus(200);

        // Buyer pays for the inspection
        \Auth::guard('sanctum')->forgetUser();
        $payRes = $this->postJson("/api/v1/inspection-jobs/{$jobId}/pay", [], ['Authorization' => "Bearer $buyerToken"]);
        $payRes->assertStatus(201);
        $inspectionPaymentId = $payRes->json('data.payment_id');

        // Simulate Midtrans Webhook for Inspection
        \Auth::guard('sanctum')->forgetUser();
        $inspectionOrderId = 'INSPECTION-'.$jobId;
        $response = $this->postJson('/api/v1/payments/webhook', [
            'order_id' => $inspectionOrderId,
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-insp-123',
            'gross_amount' => 150000,
            'status_code' => '200',
            'payment_type' => 'bank_transfer',
            'signature_key' => hash('sha512', $inspectionOrderId.'200'.'150000'.config('services.midtrans.server_key')),
        ]);
        $response->assertStatus(200);

        // Complete Job so it can be reported
        \Auth::guard('sanctum')->forgetUser();
        $this->putJson("/api/v1/inspection-jobs/{$jobId}/complete", [], ['Authorization' => "Bearer $techToken"])
            ->assertStatus(200);

        // 6. UPLOAD INSPECTION REPORT
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/inspection-reports', [
            'job_id' => $jobId,
            'battery_status' => 'good',
            'screen_status' => 'good',
            'keyboard_status' => 'good',
            'storage_status' => 'good',
            'ram_status' => 'good',
            'cpu_status' => 'good',
            'gpu_status' => 'good',
            'motherboard_status' => 'good',
            'cooling_status' => 'good',
            'physical_status' => 'good',
            'touchpad_status' => 'good',
            'port_status' => 'good',
            'overall_score' => 95,
            'recommendation' => 'recommended',
            'summary' => 'Laptop in excellent condition',
        ], ['Authorization' => "Bearer $techToken"]);
        $response->assertStatus(201);

        // 7. CHECKOUT
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/orders', [
            'product_id' => $productId,
            'shipping_address' => 'Jl. Test Buyer',
            'shipping_courier' => 'JNE',
            'shipping_service' => 'REG',
            'shipping_cost' => 50000,
        ], ['Authorization' => "Bearer $buyerToken"]);
        $response->assertStatus(201);
        $orderId = $response->json('data.id');
        $orderNumber = $response->json('data.order_number');

        // 8. PAYMENT AND ESCROW
        \Auth::guard('sanctum')->forgetUser();

        // Buyer creates payment for Order
        $payOrderRes = $this->postJson("/api/v1/orders/{$orderId}/pay", [], ['Authorization' => "Bearer $buyerToken"]);
        $payOrderRes->assertStatus(201);

        \Auth::guard('sanctum')->forgetUser();
        // Call midtrans webhook to simulate payment
        $response = $this->postJson('/api/v1/payments/webhook', [
            'order_id' => $orderNumber,
            'status_code' => '200',
            'transaction_status' => 'settlement',
            'transaction_id' => 'midtrans-123',
            'gross_amount' => 15450000,
            'payment_type' => 'bank_transfer',
            'signature_key' => hash('sha512', $orderNumber.'200'.'15450000'.config('services.midtrans.server_key')),
        ]);
        // dump("WEBHOOK RES:", $response->json(), "ORDER NO:", $orderNumber);
        $response->assertStatus(200);

        // Check if escrow is held
        $wallet = Wallet::where('user_id', $sellerId)->first();
        $this->assertEquals(14550000, $wallet->held_balance);

        // 9. SHIPPING
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->putJson("/api/v1/orders/{$orderId}/ship", [
            'resi_number' => 'RESI123456789',
        ], ['Authorization' => "Bearer $sellerToken"]);
        $response->assertStatus(200);

        // 10. CONFIRM RECEIVED
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->putJson("/api/v1/orders/{$orderId}/confirm-received", [], ['Authorization' => "Bearer $buyerToken"]);
        $response->assertStatus(200);

        // Escrow released
        $wallet->refresh();
        $this->assertEquals(0, $wallet->held_balance);
        $this->assertEquals(14550000, $wallet->available_balance);

        // 11. WITHDRAWAL
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/withdrawals', [
            'amount' => 1000000,
            'bank_name' => 'BCA',
            'account_name' => 'Seller E2E',
            'account_number' => '1234567890',
        ], ['Authorization' => "Bearer $sellerToken"]);
        $response->assertStatus(201);

        // 12. CHAT
        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson('/api/v1/chat/start', [
            'user_id' => $sellerId,
        ], ['Authorization' => "Bearer $buyerToken"]);
        $response->assertStatus(201);
        $roomId = $response->json('data.id');

        \Auth::guard('sanctum')->forgetUser();
        $response = $this->postJson("/api/v1/chat/{$roomId}/messages", [
            'body' => 'Halo min!',
        ], ['Authorization' => "Bearer $buyerToken"]);
        $response->assertStatus(201);

        // 13. RETURN (using a second product/order)
        \Auth::guard('sanctum')->forgetUser();
        $product2 = Product::create([
            'seller_id' => $sellerId,
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'model' => 'ThinkPad T14 Return',
            'slug' => 'thinkpad-t14-return',
            'cpu' => 'Intel i7',
            'ram' => 16,
            'storage' => 512,
            'storage_type' => 'SSD',
            'screen_size' => '14',
            'description' => 'Test Return',
            'location' => 'Jakarta',
            'price' => 15000000,
            'condition' => 'good',
            'stock' => 1,
            'status' => 'active',
        ]);

        \Auth::guard('sanctum')->forgetUser();
        $checkoutRes = $this->postJson('/api/v1/orders', [
            'product_id' => $product2->id,
            'shipping_address' => 'Jl. Return Buyer',
            'shipping_courier' => 'JNE',
            'shipping_cost' => 150000,
        ], ['Authorization' => "Bearer $buyerToken"]);
        $orderId2 = $checkoutRes->json('data.id');

        // Pay Order 2
        \Auth::guard('sanctum')->forgetUser();
        $this->postJson("/api/v1/orders/{$orderId2}/pay", [], ['Authorization' => "Bearer $buyerToken"]);

        $order2 = Order::find($orderId2);
        $order2->update([
            'status' => 'completed',
            'platform_fee' => 0,
            'total_amount' => 2050000,
            'product_snapshot' => ['name' => 'Test'],
            'booking_expires_at' => now()->addHours(24),
        ]);

        \Auth::guard('sanctum')->forgetUser();
        $this->postJson('/api/v1/returns', [
            'order_id' => $order2->id,
            'reason' => 'Barang rusak',
        ], ['Authorization' => "Bearer $buyerToken"])->assertStatus(201);

        // 14. NOTIFICATIONS
        \Auth::guard('sanctum')->forgetUser();
        $this->getJson('/api/v1/notifications', ['Authorization' => "Bearer $sellerToken"])
            ->assertStatus(200);

        $this->assertTrue(true);
    }
}
