<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionJobAcceptedNotification extends Notification
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
            'type' => 'inspection_job_accepted',
            'title' => 'Teknisi Menerima Inspeksi',
            'message' => 'Teknisi menerima permintaan inspeksi untuk produk '.($this->job->product?->model ?? 'laptop').'. Silakan lakukan pembayaran.',
            'job_id' => $this->job->id,
            'product' => $this->job->product?->model,
            'schedule' => $this->job->schedule_date,
            'technician' => $this->job->technician?->name,
            'action_url' => '/inspection-orders/'.$this->job->id,
        ];
    }
}
