<?php

namespace App\Services;

use App\Events\OrderCreatedEvent;
use App\Models\Order;
use App\Models\Product;
use App\Notifications\OrderCompletedNotification;
use App\Notifications\OrderCreatedSellerNotification;
use App\Notifications\OrderShippedNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(protected EscrowService $escrow) {}

    public function create(array $data, string $buyerId): Order
    {
        return DB::transaction(function () use ($data, $buyerId) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);

            if ((int) $product->seller_id === (int) $buyerId) {
                throw new \Exception('Anda tidak dapat membeli produk sendiri.');
            }

            if ($product->status !== 'active') {
                throw new \Exception('Produk tidak tersedia untuk dibeli.');
            }

            if ($product->stock <= 0) {
                throw new \Exception('Stok produk sudah habis.');
            }

            // Kurangi stok; jika stok habis (0) set status 'sold', selain itu tetap 'active'
            $newStock = $product->stock - 1;
            $newStatus = $newStock <= 0 ? 'sold' : 'active';
            $product->update(['stock' => $newStock, 'status' => $newStatus]);

            $platformFee = $product->price * 0.03;
            $totalAmount = $product->price + $platformFee;

            $order = Order::create([
                'order_number'       => $this->generateOrderNumber(),
                'product_id'         => $product->id,
                'buyer_id'           => $buyerId,
                'seller_id'          => $product->seller_id,
                'product_price'      => $product->price,
                'platform_fee'       => $platformFee,
                'total_amount'       => $totalAmount,
                'product_snapshot'   => $product->toArray(),
                'booking_expires_at' => Carbon::now()->addHours(24),
                'status'             => 'waiting_payment',
                'notes'              => $data['notes'] ?? null,
                'shipping_address'   => $data['shipping_address'],
            ]);

            OrderCreatedEvent::dispatch($order);

            // Notify seller
            $order->seller->notify(new OrderCreatedSellerNotification($order));

            return $order;
        });
    }

    public function cancel(Order $order): Order
    {
        DB::transaction(function () use ($order) {
            $product = $order->product()->lockForUpdate()->first();

            $order->update(['status' => 'expired']);

            if ($product) {
                // Kembalikan stok dan aktifkan kembali produk
                $restoredStock = $product->stock + 1;
                $product->update([
                    'stock'  => $restoredStock,
                    'status' => 'active',
                ]);
            }
        });

        return $order->fresh();
    }

    public function ship(Order $order, string $resiNumber): Order
    {
        DB::transaction(function () use ($order, $resiNumber) {
            $order->update([
                'status'      => 'shipped',
                'resi_number' => $resiNumber,
                'shipped_at'  => Carbon::now(),
            ]);
        });

        // Notify buyer
        $order->fresh()->buyer->notify(new OrderShippedNotification($order->fresh()));

        return $order->fresh();
    }

    public function confirmReceived(Order $order): Order
    {
        DB::transaction(function () use ($order) {
            $order->update(['status' => 'completed', 'completed_at' => Carbon::now()]);
            $order->product()->update(['status' => 'sold']);
            $this->escrow->releaseEscrow($order);
        });

        // Notify seller
        $order->fresh()->seller->notify(new OrderCompletedNotification($order->fresh()));

        return $order->fresh();
    }

    public function expireOrder(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $product = $order->product()->lockForUpdate()->first();

            $order->update(['status' => 'expired']);

            if ($product) {
                // Kembalikan stok dan aktifkan kembali produk
                $restoredStock = $product->stock + 1;
                $product->update([
                    'stock'  => $restoredStock,
                    'status' => 'active',
                ]);
            }
        });
    }

    protected function generateOrderNumber(): string
    {
        $date      = Carbon::now()->format('Ymd');
        $lastOrder = Order::whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'desc')
            ->first();

        $sequence = $lastOrder ? intval(substr($lastOrder->order_number, -4)) + 1 : 1;

        return sprintf('INV-%s-%04d', $date, $sequence);
    }
}
