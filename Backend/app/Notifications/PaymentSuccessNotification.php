<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentSuccessNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'         => 'payment_success',
            'title'        => 'Pembayaran Berhasil',
            'message'      => 'Pembayaran pesanan ' . $this->order->order_number . ' sebesar Rp ' . number_format($this->order->total_amount, 0, ',', '.') . ' berhasil.',
            'order_id'     => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount'       => $this->order->total_amount,
            'action_url'   => '/orders/' . $this->order->id,
        ];
    }
}
