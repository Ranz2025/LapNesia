<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification
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
            'type'      => 'order_created',
            'title'     => 'Pesanan Baru Dibuat',
            'message'   => 'Pesanan Anda telah dibuat.',
            'order_id'  => $this->order->id,
            'product'   => $this->order->product->model,
        ];
    }
}
