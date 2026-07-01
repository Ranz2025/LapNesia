<?php

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionCompletedNotification extends Notification
{
    use Queueable;

    public function __construct(public InspectionJob $job) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'     => 'inspection_completed',
            'title'    => 'Inspeksi Selesai',
            'message'  => 'Inspeksi untuk pesanan Anda telah selesai.',
            'job_id'   => $this->job->id,
            'product'  => $this->job->product->model,
        ];
    }
}
