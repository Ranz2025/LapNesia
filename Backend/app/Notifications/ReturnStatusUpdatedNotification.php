<?php

namespace App\Notifications;

use App\Models\ProductReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReturnStatusUpdatedNotification extends Notification
{
    use Queueable;

    public function __construct(public ProductReturn $return) {}

    public function via(object $notifiable): array { return ['database']; }

    public function toDatabase(object $notifiable): array
    {
        $isApproved = $this->return->status === 'approved';
        $isRejected = $this->return->status === 'rejected';

        if ($isApproved) {
            $title   = 'Pengembalian Disetujui';
            $message = 'Penjual menyetujui pengembalian barang pesanan ' . $this->return->order?->order_number . '. Silakan kirim barang kembali.';
        } elseif ($isRejected) {
            $title   = 'Pengembalian Ditolak';
            $message = 'Penjual menolak pengembalian barang pesanan ' . $this->return->order?->order_number . ($this->return->seller_notes ? ': ' . $this->return->seller_notes : '.');
        } else {
            $title   = 'Status Pengembalian Diperbarui';
            $message = 'Status pengembalian barang pesanan ' . $this->return->order?->order_number . ' diperbarui menjadi ' . $this->return->status . '.';
        }

        return [
            'type'         => 'return_status_updated',
            'title'        => $title,
            'message'      => $message,
            'return_id'    => $this->return->id,
            'order_id'     => $this->return->order_id,
            'order_number' => $this->return->order?->order_number,
            'status'       => $this->return->status,
            'action_url'   => '/orders/' . $this->return->order_id,
        ];
    }
}
