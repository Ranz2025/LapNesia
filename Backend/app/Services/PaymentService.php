<?php

namespace App\Services;

use App\Events\PaymentSuccessEvent;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class PaymentService
{
    public function __construct(protected EscrowService $escrow)
    {
        MidtransConfig::$serverKey    = config('services.midtrans.server_key');
        MidtransConfig::$isProduction = config('services.midtrans.is_production');
        MidtransConfig::$isSanitized  = config('services.midtrans.is_sanitized');
        MidtransConfig::$is3ds        = config('services.midtrans.is_3ds');
    }

    public function createPayment(Order $order): Payment
    {
        if ($order->status !== 'waiting_payment') {
            throw new \Exception('Order tidak dalam status waiting_payment.');
        }

        $snapResult = Snap::createTransaction([
            'transaction_details' => [
                'order_id'     => $order->order_number,
                'gross_amount' => (int) $order->total_amount,
            ],
            'customer_details' => [
                'first_name' => $order->buyer->name,
                'email'      => $order->buyer->email,
                'phone'      => $order->buyer->phone,
            ],
        ]);

        return Payment::create([
            'order_id'          => $order->id,
            'payment_gateway'   => 'midtrans',
            'snap_token'        => $snapResult->token,
            'snap_redirect_url' => $snapResult->redirect_url,
            'gross_amount'      => $order->total_amount,
            'status'            => 'pending',
        ]);
    }

    public function handleWebhook(array $payload): void
    {
        $transactionId     = $payload['transaction_id'] ?? null;
        $orderId           = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus       = $payload['fraud_status'] ?? null;
        $paymentType       = $payload['payment_type'] ?? null;
        $serverKey         = config('services.midtrans.server_key');

        // Idempotency: Check if transaction is already settled/completed (terminal states)
        if ($transactionId) {
            $existing = Payment::where('transaction_id', $transactionId)
                ->whereIn('status', ['success', 'expired', 'failed', 'cancelled'])
                ->first();
            if ($existing) {
                return; // Already processed to terminal state
            }
        }

        // Signature validation - MUST exist, no default
        if (!isset($payload['signature_key'])) {
            throw new \Exception('Missing webhook signature - possible tamper attempt');
        }

        $signatureKey = hash('sha512',
            $orderId . $payload['status_code'] . $payload['gross_amount'] . $serverKey
        );

        if (!hash_equals($signatureKey, $payload['signature_key'])) {
            throw new \Exception('Invalid webhook signature.');
        }

        DB::transaction(function () use ($payload, $transactionId, $orderId, $transactionStatus, $fraudStatus, $paymentType) {
            $order = Order::with('seller')
                ->where('order_number', $orderId)
                ->lockForUpdate()
                ->firstOrFail();

            // MUST be waiting_payment - prevent processing cancelled/expired/paid orders
            if ($order->status !== 'waiting_payment') {
                // If order is already paid, this is a duplicate webhook - ignore gracefully
                if (in_array($order->status, ['paid', 'completed', 'shipped'])) {
                    $existingPayment = Payment::where('order_id', $order->id)
                        ->where('status', 'success')
                        ->first();
                    if ($existingPayment) {
                        if ($existingPayment->transaction_id === $transactionId || 
                            ($existingPayment->transaction_id === null && $order->product && $order->product->status !== 'paid')) {
                            return; // idempotent - already processed
                        }
                    }
                }
                throw new \Exception("Order not in waiting_payment status: {$order->status}");
            }

            $payment = Payment::where('order_id', $order->id)
                ->lockForUpdate()
                ->latest()
                ->firstOrFail();

            // IDEMPOTENCY: Prevent reprocessing if payment already has transaction_id
            if ($payment->transaction_id !== null && $payment->transaction_id !== $transactionId) {
                throw new \Exception("Payment already processed with different transaction_id");
            }

            // Prevent reprocessing
            if (in_array($payment->status, ['success', 'expired', 'failed', 'cancelled'])) {
                return;
            }

            // VALIDATE amount matches expected
            if ((float)$payload['gross_amount'] !== (float)$order->total_amount) {
                throw new \Exception(
                    "Amount mismatch: expected {$order->total_amount}, got {$payload['gross_amount']}"
                );
            }

            $updates = [
                'transaction_id'  => $transactionId,
                'payment_type'    => $paymentType,
                'signature_key'   => $payload['signature_key'],
                'webhook_payload' => $payload,
            ];

            if (
                ($transactionStatus === 'capture' && $fraudStatus === 'accept') ||
                $transactionStatus === 'settlement'
            ) {
                $updates['status']  = 'success';
                $updates['paid_at'] = now();
                $payment->update($updates);

                $order->update(['status' => 'paid', 'paid_at' => now()]);

                // Move to escrow
                $this->escrow->moveToEscrow($order);

                // Notify buyer
                PaymentSuccessEvent::dispatch($payment);

            } elseif (in_array($transactionStatus, ['expire', 'expired'])) {
                $updates['status'] = 'expired';
                $payment->update($updates);
                $order->update(['status' => 'expired']);
                $order->product()->update(['status' => 'active']);
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'failure'])) {
                $updates['status'] = 'failed';
                $payment->update($updates);
            } else {
                $payment->update($updates);
            }
        });
    }

    public function expirePayment(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'expired']);
            $payment->order->update(['status' => 'expired']);
            $payment->order->product()->update(['status' => 'active']);
        });
    }
}
