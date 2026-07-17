<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionReportPublishedNotification extends Notification
{
    use Queueable;

    public function __construct(public InspectionReport $report) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'inspection_report_published',
            'title' => 'Laporan Inspeksi Diterbitkan',
            'message' => 'Laporan inspeksi untuk pesanan Anda telah diterbitkan.',
            'report_id' => $this->report->id,
            'product' => $this->report->job->product->model,
        ];
    }
}
