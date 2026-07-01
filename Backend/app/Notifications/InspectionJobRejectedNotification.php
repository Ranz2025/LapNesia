<?php

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionJobRejectedNotification extends Notification
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
            'type' => 'inspection_job_rejected',
            'title' => 'Teknisi Menolak Inspeksi',
            'message' => 'Teknisi menolak permintaan inspeksi untuk produk ' . ($this->job->product?->model ?? 'laptop') . '.',
            'job_id' => $this->job->id,
            'product' => $this->job->product?->model,
            'schedule' => $this->job->schedule_date,
            'technician' => $this->job->technician?->name,
        ];
    }
}
