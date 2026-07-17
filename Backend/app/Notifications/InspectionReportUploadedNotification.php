<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionReportUploadedNotification extends Notification
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
            'type' => 'inspection_report_uploaded',
            'title' => 'Laporan Inspeksi Tersedia',
            'message' => 'Laporan inspeksi telah diupload. Silakan lihat hasilnya.',
            'job_id' => $this->job->id,
            'action_url' => '/inspection-orders/'.$this->job->id,
        ];
    }
}
