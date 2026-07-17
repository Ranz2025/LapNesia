<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class OrderCompletedNotification extends Notification
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
            'type' => 'order_completed',
            'title' => 'Pesanan Selesai',
            'message' => 'Pembeli telah mengkonfirmasi penerimaan '.$this->order->order_number.'. Dana akan segera dicairkan.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'amount' => $this->order->total_amount,
            'action_url' => '/seller/orders',
        ];
    }
}
