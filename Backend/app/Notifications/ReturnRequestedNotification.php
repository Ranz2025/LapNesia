<?php

namespace App\Notifications;

use App\Models\ProductReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReturnRequestedNotification extends Notification
{
    use Queueable;

    public function __construct(public ProductReturn $return) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'         => 'return_requested',
            'title'        => 'Permintaan Pengembalian Barang',
            'message'      => 'Pembeli mengajukan pengembalian barang untuk pesanan ' . $this->return->order?->order_number . '.',
            'return_id'    => $this->return->id,
            'order_id'     => $this->return->order_id,
            'order_number' => $this->return->order?->order_number,
            'reason'       => $this->return->reason,
            'action_url'   => '/seller/orders',
        ];
    }
}
