<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class EscrowService
{
    public function __construct(protected WalletService $walletService) {}

    /**
     * Rule A: Saat webhook SUCCESS.
     * Kreditkan (product_price - platform_fee) ke held_balance seller.
     */
    public function moveToEscrow(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $wallet = Wallet::where('user_id', $order->seller_id)->lockForUpdate()->firstOrFail();

            $escrowAmount = (float) $order->product_price - (float) $order->platform_fee;

            $this->walletService->hold(
                $wallet,
                $escrowAmount,
                'sale_income',
                $order,
                "Escrow untuk order {$order->order_number}",
                'escrow'
            );
        });
    }

    /**
     * Rule B: Saat buyer confirm received.
     * Pindahkan dari held_balance → available_balance seller.
     */
    public function releaseEscrow(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $wallet = Wallet::where('user_id', $order->seller_id)->lockForUpdate()->firstOrFail();

            // Idempotency: skip if already released for this order
            $alreadyReleased = WalletTransaction::where('wallet_id', $wallet->id)
                ->where('reference_id', $order->id)
                ->where('type', 'escrow_release')
                ->exists();

            if ($alreadyReleased) {
                return;
            }

            $escrowAmount = (float) $order->product_price - (float) $order->platform_fee;

            $this->walletService->release(
                $wallet,
                $escrowAmount,
                'escrow_release',
                $order,
                "Release escrow untuk order {$order->order_number}",
                'released'
            );
        });
    }

    /**
     * Rule C: Saat order refunded.
     * Hapus dari held_balance seller.
     */
    public function refundEscrow(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $wallet = Wallet::where('user_id', $order->seller_id)->lockForUpdate()->firstOrFail();

            // Only refund if there is an escrow hold for this order
            $hasEscrow = WalletTransaction::where('wallet_id', $wallet->id)
                ->where('reference_id', $order->id)
                ->where('type', 'sale_income')
                ->where('status', 'escrow')
                ->exists();

            if (! $hasEscrow) {
                return;
            }

            $escrowAmount = (float) $order->product_price - (float) $order->platform_fee;

            $this->walletService->refund(
                $wallet,
                $escrowAmount,
                'refund',
                $order,
                "Refund escrow untuk order {$order->order_number}",
                'refunded'
            );
        });
    }
}
