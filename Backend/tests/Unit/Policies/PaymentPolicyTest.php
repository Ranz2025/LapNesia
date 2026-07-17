<?php

declare(strict_types=1);

namespace Tests\Unit\Policies;

use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\CreatesTestData;
use Tests\TestCase;

class PaymentPolicyTest extends TestCase
{
    use CreatesTestData, RefreshDatabase;

    public function test_buyer_can_view_own_payment(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $payment = Payment::create([
            'order_id' => $order->id,
            'gross_amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        $this->assertTrue($buyer->can('view', $payment));
    }

    public function test_seller_can_view_payment_for_own_product(): void
    {
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $payment = Payment::create([
            'order_id' => $order->id,
            'gross_amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        $this->assertTrue($seller->can('view', $payment));
    }

    public function test_other_user_cannot_view_payment(): void
    {
        $buyer1 = $this->createBuyer();
        $buyer2 = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer1, $seller, $product);

        $payment = Payment::create([
            'order_id' => $order->id,
            'gross_amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        $this->assertFalse($buyer2->can('view', $payment));
    }

    public function test_admin_can_view_any_payment(): void
    {
        $admin = $this->createAdmin();
        $buyer = $this->createBuyer();
        $seller = $this->createSeller();
        $product = $this->createProduct($seller);
        $order = $this->createOrder($buyer, $seller, $product);

        $payment = Payment::create([
            'order_id' => $order->id,
            'gross_amount' => $order->total_amount,
            'status' => 'pending',
        ]);

        $this->assertTrue($admin->can('view', $payment));
    }
}
