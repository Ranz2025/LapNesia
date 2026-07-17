<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionScheduledNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly InspectionJob $job) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $date = $this->job->technician_schedule_date?->format('d M Y') ?? '-';
        $time = $this->job->technician_schedule_time ?? '-';

        return [
            'type' => 'inspection_scheduled',
            'title' => 'Jadwal Inspeksi Ditentukan',
            'message' => "Teknisi telah menjadwalkan inspeksi pada {$date} pukul {$time}.",
            'job_id' => $this->job->id,
            'action_url' => '/inspection-orders/'.$this->job->id,
        ];
    }
}
