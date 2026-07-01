<?php

namespace App\Services;

use App\Models\InspectionJob;
use App\Models\InspectionPayment;
use App\Services\WalletService;
use Illuminate\Support\Facades\DB;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;

class InspectionPaymentService
{
    public function __construct()
    {
        MidtransConfig::$serverKey = config('services.midtrans.server_key');
        MidtransConfig::$isProduction = config('services.midtrans.is_production');
        MidtransConfig::$isSanitized = config('services.midtrans.is_sanitized');
        MidtransConfig::$is3ds = config('services.midtrans.is_3ds');
    }

    public function create(InspectionJob $job): InspectionPayment
    {
        if ($job->status !== 'accepted') {
            throw new \Exception('Inspeksi baru bisa dibayar setelah teknisi menerima permintaan.');
        }

        $existing = InspectionPayment::where('inspection_job_id', $job->id)
            ->where('status', 'pending')
            ->whereNotNull('snap_token')
            ->latest()
            ->first();

        if ($existing) {
            return $existing;
        }

        $grossAmount = (float) $job->fee;
        if ($grossAmount < 0.01) {
            $grossAmount = 150000.00;
        }

        $snapResult = Snap::createTransaction([
            'transaction_details' => [
                'order_id' => 'INSPECTION-' . $job->id,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $job->requester->name,
                'email' => $job->requester->email,
                'phone' => $job->requester->phone,
            ],
        ]);

        return InspectionPayment::create([
            'inspection_job_id' => $job->id,
            'buyer_id' => $job->requested_by,
            'technician_id' => $job->technician_id,
            'payment_gateway' => 'midtrans',
            'snap_token' => $snapResult->token,
            'snap_redirect_url' => $snapResult->redirect_url,
            'gross_amount' => $grossAmount,
            'status' => 'pending',
        ]);
    }

    public function handleWebhook(array $payload): void
    {
        $transactionId    = $payload['transaction_id'] ?? null;
        $orderId          = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;
        $fraudStatus      = $payload['fraud_status'] ?? null;
        $paymentType      = $payload['payment_type'] ?? null;
        $serverKey        = config('services.midtrans.server_key');

        if (!str_starts_with((string) $orderId, 'INSPECTION-')) {
            return;
        }

        if (!isset($payload['signature_key'])) {
            throw new \Exception('Missing webhook signature - possible tamper attempt');
        }

        $signatureKey = hash('sha512', $orderId . $payload['status_code'] . $payload['gross_amount'] . $serverKey);
        if (!hash_equals($signatureKey, $payload['signature_key'])) {
            throw new \Exception('Invalid webhook signature.');
        }

        $jobId = str_replace('INSPECTION-', '', $orderId);

        // Idempotency check di luar transaksi: jika transaction_id ini sudah di-terminal state, skip langsung
        if ($transactionId) {
            $alreadyDone = InspectionPayment::where('transaction_id', $transactionId)
                ->whereIn('status', ['success', 'expired', 'failed', 'cancelled'])
                ->exists();

            if ($alreadyDone) {
                \Illuminate\Support\Facades\Log::info('InspectionPayment webhook duplicate - already processed', [
                    'transaction_id' => $transactionId,
                    'order_id'       => $orderId,
                ]);
                return;
            }
        }

        try {
            DB::transaction(function () use ($payload, $transactionId, $transactionStatus, $fraudStatus, $paymentType, $jobId) {
                $job = InspectionJob::with('requester')->where('id', $jobId)->lockForUpdate()->firstOrFail();

                $payment = InspectionPayment::where('inspection_job_id', $job->id)
                    ->lockForUpdate()
                    ->latest()
                    ->firstOrFail();

                // Double-check idempotency di dalam lock
                if (in_array($payment->status, ['success', 'expired', 'failed', 'cancelled'])) {
                    return;
                }

                $updates = [
                    'payment_type'   => $paymentType,
                    'signature_key'  => $payload['signature_key'],
                    'webhook_payload' => $payload,
                ];

                // Hanya set transaction_id jika belum ada (hindari conflict jika duplikat)
                if (!$payment->transaction_id) {
                    $updates['transaction_id'] = $transactionId;
                }

                if (($transactionStatus === 'capture' && $fraudStatus === 'accept') || $transactionStatus === 'settlement') {
                    $updates['status']  = 'success';
                    $updates['paid_at'] = now();
                    $payment->update($updates);

                    // Ubah status job ke in_progress (bukan 'accepted') agar UI tahu sudah dibayar
                    if (in_array($job->status, ['accepted', 'assigned'])) {
                        $job->update(['status' => 'in_progress']);
                        // Notifikasi ke buyer bahwa pembayaran sukses & inspeksi sedang berlangsung
                        $job->load('requester');
                        $job->requester?->notify(new \App\Notifications\InspectionJobInProgressNotification($job));
                    }

                    // Hold dana ke held_balance teknisi (escrow masuk)
                    $wallet = \App\Models\Wallet::firstOrCreate(
                        ['user_id' => $job->technician_id],
                        ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
                    );

                    // Cek apakah wallet transaction untuk job ini sudah ada (hindari double hold)
                    $walletTxExists = \App\Models\WalletTransaction::where('reference_id', $job->id)
                        ->where('type', 'inspection_income')
                        ->exists();

                    if (!$walletTxExists) {
                        app(WalletService::class)->hold(
                            $wallet,
                            (float) $payment->gross_amount,
                            'inspection_income',
                            $job,
                            'Biaya jasa inspeksi laptop (Escrow)'
                        );
                    }

                    \Illuminate\Support\Facades\Log::info('InspectionPayment settlement processed', [
                        'job_id'     => $job->id,
                        'payment_id' => $payment->id,
                        'amount'     => $payment->gross_amount,
                    ]);

                } elseif (in_array($transactionStatus, ['expire', 'expired'])) {
                    $updates['status'] = 'expired';
                    $payment->update($updates);
                } elseif (in_array($transactionStatus, ['deny', 'cancel', 'failure'])) {
                    $updates['status'] = 'failed';
                    $payment->update($updates);
                } else {
                    $payment->update($updates);
                }
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('InspectionPayment webhook error', [
                'order_id'          => $orderId,
                'transaction_id'    => $transactionId,
                'transaction_status' => $transactionStatus,
                'error'             => $e->getMessage(),
                'trace'             => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
