<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCreatedSellerNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'         => 'order_created_seller',
            'title'        => 'Pesanan Baru Masuk',
            'message'      => 'Pembeli memesan ' . ($this->order->product_snapshot['model'] ?? $this->order->product?->model ?? 'produk Anda') . '.',
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'product'      => $this->order->product_snapshot['model'] ?? null,
            'total_amount' => $this->order->total_amount,
        ];
    }
}
