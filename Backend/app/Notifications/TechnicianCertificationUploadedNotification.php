<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\TechnicianProfile;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TechnicianCertificationUploadedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private User $technician,
        private TechnicianProfile $profile
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'technician_certification_uploaded',
            'message' => 'Teknisi '.$this->technician->name.' mengunggah sertifikat baru.',
            'technician_id' => $this->technician->id,
            'technician_name' => $this->technician->name,
            'certification_url' => $this->profile->certification_url,
        ];
    }
}
