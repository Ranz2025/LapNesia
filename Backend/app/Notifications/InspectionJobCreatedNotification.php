<?php

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionJobCreatedNotification extends Notification
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
            'type'       => 'inspection_job_created',
            'title'      => 'Permintaan Inspeksi Baru',
            'message'    => 'Buyer meminta inspeksi untuk produk ' . ($this->job->product?->model ?? 'laptop') . '. Segera konfirmasi.',
            'job_id'     => $this->job->id,
            'action_url' => '/technician/jobs',
        ];
    }
}
