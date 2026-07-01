<?php

namespace App\Notifications;

use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WithdrawalApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'            => 'withdrawal_approved',
            'title'           => 'Penarikan Disetujui',
            'message'         => 'Penarikan Anda telah disetujui.',
            'withdrawal_id'   => $this->withdrawal->id,
            'amount'          => $this->withdrawal->amount,
        ];
    }
}
