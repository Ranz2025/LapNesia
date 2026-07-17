<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionJobCancelledNotification extends Notification
{
    use Queueable;

    public function __construct(
        public InspectionJob $job,
        public string $cancelledBy = 'buyer' // 'buyer' atau 'technician'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $product = $this->job->product?->model ?? 'laptop';
        $by = $this->cancelledBy === 'buyer' ? 'Buyer' : 'Teknisi';

        return [
            'type' => 'inspection_job_cancelled',
            'title' => 'Inspeksi Dibatalkan',
            'message' => "{$by} membatalkan permintaan inspeksi untuk produk {$product}.",
            'job_id' => $this->job->id,
            'product' => $product,
            'cancelled_by' => $this->cancelledBy,
        ];
    }
}
