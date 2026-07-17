<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderShippedNotification extends Notification
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
            'type' => 'order_shipped',
            'title' => 'Pesanan Dikirim',
            'message' => 'Pesanan '.$this->order->order_number.' telah dikirim. Resi: '.$this->order->resi_number,
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'resi_number' => $this->order->resi_number,
            'action_url' => '/orders/'.$this->order->id,
        ];
    }
}
