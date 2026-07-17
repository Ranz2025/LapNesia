<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\InspectionJob;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InspectionPaymentPaidNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly InspectionJob $job) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        $buyerName = $this->job->requester->name ?? 'Buyer';
        // Product tidak punya field 'name', gunakan model (+ brand jika ada)
        $brand = optional($this->job->product->brand)->name;
        $productName = $brand
            ? "{$brand} {$this->job->product->model}"
            : ($this->job->product->model ?? 'Laptop');
        $amount = number_format((float) $this->job->fee, 0, ',', '.');

        return [
            'type' => 'inspection_payment_paid',
            'title' => 'Pembayaran Inspeksi Diterima',
            'message' => "{$buyerName} telah membayar biaya inspeksi Rp{$amount} untuk {$productName}. Silakan mulai proses inspeksi.",
            'job_id' => $this->job->id,
            'action_url' => '/technician/jobs',
        ];
    }
}
