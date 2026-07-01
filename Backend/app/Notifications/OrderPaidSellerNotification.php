<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderPaidSellerNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'         => 'order_paid_seller',
            'title'        => 'Pembayaran Diterima',
            'message'      => 'Pembeli telah melakukan pembayaran untuk pesanan ' . $this->order->order_number . '. Segera proses pengiriman.',
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount'       => $this->order->total_amount,
            'action_url'   => '/seller/orders',
        ];
    }
}
