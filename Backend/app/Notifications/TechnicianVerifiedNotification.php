<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class TechnicianVerifiedNotification extends Notification
{
    public function __construct(
        private bool $approved,
        private ?string $reason = null
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'technician_verification',
            'message' => $this->approved
                ? 'Akun teknisi Anda telah diverifikasi. Anda dapat menerima pekerjaan inspeksi.'
                : "Pengajuan verifikasi teknisi Anda ditolak. Alasan: {$this->reason}",
            'approved' => $this->approved,
        ];
    }
}
