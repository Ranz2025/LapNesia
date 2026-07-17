<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Models\ProductReturn;
use App\Models\Wallet;
use App\Notifications\ReturnRequestedNotification;
use App\Notifications\ReturnStatusUpdatedNotification;
use Illuminate\Support\Facades\DB;

class ReturnService
{
    public function __construct(protected WalletService $walletService) {}

    /** Buyer mengajukan return */
    public function request(Order $order, int $buyerId, string $reason): ProductReturn
    {
        if ((int) $order->buyer_id !== (int) $buyerId) {
            throw new \Exception('Anda tidak memiliki akses ke order ini.');
        }

        if ($order->status !== 'completed') {
            throw new \Exception('Pengembalian hanya dapat diajukan untuk pesanan yang sudah selesai.');
        }

        $existing = ProductReturn::where('order_id', $order->id)->first();
        if ($existing) {
            throw new \Exception('Anda sudah mengajukan pengembalian untuk pesanan ini.');
        }

        $return = DB::transaction(function () use ($order, $buyerId, $reason) {
            return ProductReturn::create([
                'order_id' => $order->id,
                'buyer_id' => $buyerId,
                'seller_id' => $order->seller_id,
                'reason' => $reason,
                'status' => 'pending',
            ]);
        });

        // Notify seller
        $return->load('order');
        $order->seller->notify(new ReturnRequestedNotification($return));

        return $return;
    }

    /** Seller approve/reject return */
    public function updateStatus(ProductReturn $return, string $status, ?string $sellerNotes = null): ProductReturn
    {
        if (! in_array($status, ['approved', 'rejected'])) {
            throw new \Exception('Status tidak valid.');
        }

        if ($return->status !== 'pending') {
            throw new \Exception('Status pengembalian sudah diproses.');
        }

        $updates = [
            'status' => $status,
            'seller_notes' => $sellerNotes,
        ];

        if ($status === 'approved') {
            $updates['approved_at'] = now();
        } else {
            $updates['rejected_at'] = now();
        }

        $return->update($updates);
        $return->load('order');

        // Notify buyer
        $return->buyer->notify(new ReturnStatusUpdatedNotification($return));

        return $return->fresh('order', 'buyer', 'seller');
    }

    /** Buyer input resi return (kirim barang kembali) */
    public function submitResi(ProductReturn $return, int $buyerId, string $resi): ProductReturn
    {
        if ((int) $return->buyer_id !== (int) $buyerId) {
            throw new \Exception('Anda tidak memiliki akses.');
        }

        if ($return->status !== 'approved') {
            throw new \Exception('Pengembalian belum disetujui.');
        }

        $return->update(['return_resi' => $resi]);

        return $return->fresh();
    }

    /** Admin tandai return selesai (barang sudah diterima seller) */
    public function completeReturn(ProductReturn $return, ?string $adminNotes = null): ProductReturn
    {
        if (! in_array($return->status, ['approved'])) {
            throw new \Exception('Pengembalian belum disetujui atau sudah diproses.');
        }

        $return->load('order');
        $order = $return->order;

        DB::transaction(function () use ($return, $order, $adminNotes) {
            $return->update([
                'status' => 'completed',
                'admin_notes' => $adminNotes,
                'completed_at' => now(),
            ]);

            // Update status order menjadi refunded
            $order->update(['status' => 'refunded']);

            $refundAmount = (float) $order->product_price - (float) $order->platform_fee;

            // 1. Debit dari available_balance seller
            $sellerWallet = Wallet::firstOrCreate(
                ['user_id' => $return->seller_id],
                ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
            );
            $this->walletService->debit(
                $sellerWallet,
                $refundAmount,
                'refund',
                $return,
                "Potongan saldo return untuk order {$order->order_number}"
            );

            // 2. Credit ke available_balance buyer
            $buyerWallet = Wallet::firstOrCreate(
                ['user_id' => $return->buyer_id],
                ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
            );
            $this->walletService->credit(
                $buyerWallet,
                $refundAmount,
                'return_refund',
                $return,
                "Refund return untuk order {$order->order_number}"
            );

            // 3. Aktifkan kembali produk
            $order->product()->update(['status' => 'active', 'stock' => \DB::raw('stock + 1')]);
        });

        $return->load('order');

        // Notify buyer & seller
        $return->buyer->notify(new ReturnStatusUpdatedNotification($return->fresh()));
        $return->seller->notify(new ReturnStatusUpdatedNotification($return->fresh()));

        return $return->fresh('order', 'buyer', 'seller');
    }

    /** Admin get all returns */
    public function getAllReturns(int $perPage = 15)
    {
        return ProductReturn::with(['order.product', 'buyer', 'seller'])
            ->latest()
            ->paginate($perPage);
    }
}
