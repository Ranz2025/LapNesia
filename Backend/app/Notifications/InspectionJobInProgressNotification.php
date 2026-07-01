<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\InspectionJob;

class InspectionJobInProgressNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly InspectionJob $job) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type'       => 'inspection_in_progress',
            'title'      => 'Pembayaran Berhasil',
            'message'    => 'Pembayaran inspeksi berhasil. Teknisi sedang melakukan inspeksi.',
            'job_id'     => $this->job->id,
            'action_url' => '/inspection-orders/' . $this->job->id,
        ];
    }
}
