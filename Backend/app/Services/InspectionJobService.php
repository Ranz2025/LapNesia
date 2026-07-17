<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\InspectionCompletedEvent;
use App\Models\InspectionJob;
use App\Models\TechnicianAvailability;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Notifications\InspectionJobAcceptedNotification;
use App\Notifications\InspectionJobCancelledNotification;
use App\Notifications\InspectionJobCreatedNotification;
use App\Notifications\InspectionJobRejectedNotification;
use App\Notifications\InspectionScheduledNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InspectionJobService
{
    /**
     * Cek apakah teknisi bisa menerima job baru.
     * Teknisi tidak boleh punya job aktif (assigned/accepted/in_progress).
     */
    public function canAcceptNewJob(int $technicianId): bool
    {
        return ! InspectionJob::where('technician_id', $technicianId)
            ->whereIn('status', ['assigned', 'accepted', 'in_progress'])
            ->exists();
    }

    /**
     * Buat inspection job baru oleh buyer.
     * Buyer hanya perlu memilih teknisi — jadwal diinput nanti oleh teknisi.
     */
    public function create(array $data, int $requestedBy): InspectionJob
    {
        return DB::transaction(function () use ($data, $requestedBy) {
            $technicianId = $data['technician_id'];

            // Ambil fee dari TechnicianProfile
            $technicianProfile = TechnicianProfile::where('user_id', $technicianId)->first();
            $fee = $technicianProfile?->inspection_fee ?? 0;

            // Cek teknisi tidak punya active job
            if (! $this->canAcceptNewJob($technicianId)) {
                throw ValidationException::withMessages([
                    'technician_id' => ['Teknisi sedang menangani job lain.'],
                ]);
            }

            // schedule_date placeholder: sekarang + 3 hari
            $scheduleDatePlaceholder = now()->addDays(3)->toDateString();

            $job = InspectionJob::create([
                'product_id' => $data['product_id'],
                'technician_id' => $technicianId,
                'requested_by' => $requestedBy,
                'schedule_date' => $scheduleDatePlaceholder,
                'fee' => $fee,
                'status' => 'assigned',
                'laptop_address' => $data['laptop_address'],
                'inspection_notes' => $data['inspection_notes'] ?? null,
            ]);

            $slot = TechnicianAvailability::find($data['availability_id'] ?? null);
            if ($slot) {
                $slot->update(['is_booked' => true]);
            }

            $job->load(['product', 'requester']);
            User::find($technicianId)?->notify(new InspectionJobCreatedNotification($job));

            return $job;
        });
    }

    public function find(int $id): ?InspectionJob
    {
        return InspectionJob::with(['product', 'technician', 'requester', 'report.photos', 'payment', 'rating'])->find($id);
    }

    public function accept(InspectionJob $job, int $technicianId): InspectionJob
    {
        if ((int) $job->technician_id !== (int) $technicianId) {
            throw ValidationException::withMessages([
                'job' => ['Anda bukan teknisi untuk job ini.'],
            ]);
        }

        if ($job->status !== 'assigned') {
            throw ValidationException::withMessages([
                'status' => ['Job tidak dalam status assigned.'],
            ]);
        }

        $job->update(['status' => 'accepted']);
        $job->load(['product', 'technician', 'requester']);
        $job->requester?->notify(new InspectionJobAcceptedNotification($job));

        return $job->fresh();
    }

    public function reject(InspectionJob $job, int $technicianId): InspectionJob
    {
        if ((int) $job->technician_id !== (int) $technicianId) {
            throw ValidationException::withMessages([
                'job' => ['Anda bukan teknisi untuk job ini.'],
            ]);
        }

        if ($job->status !== 'assigned') {
            throw ValidationException::withMessages([
                'status' => ['Job tidak dalam status assigned.'],
            ]);
        }

        $job->update(['status' => 'rejected']);
        $job->load(['product', 'technician', 'requester']);
        $job->requester?->notify(new InspectionJobRejectedNotification($job));

        return $job->fresh();
    }

    /**
     * Batalkan inspection job — bisa dilakukan buyer (status assigned)
     * atau teknisi (status assigned/accepted).
     */
    public function cancel(InspectionJob $job, int $userId): InspectionJob
    {
        $isBuyer = (int) $job->requested_by === $userId;
        $isTechnician = (int) $job->technician_id === $userId;

        if (! $isBuyer && ! $isTechnician) {
            throw ValidationException::withMessages([
                'job' => ['Anda tidak memiliki akses untuk membatalkan job ini.'],
            ]);
        }

        // Buyer hanya bisa batalkan saat status assigned (belum diterima teknisi)
        if ($isBuyer && $job->status !== 'assigned') {
            throw ValidationException::withMessages([
                'status' => ['Buyer hanya dapat membatalkan inspeksi yang belum diterima teknisi.'],
            ]);
        }

        // Teknisi bisa batalkan saat assigned atau accepted (belum dibayar)
        if ($isTechnician && ! in_array($job->status, ['assigned', 'accepted'])) {
            throw ValidationException::withMessages([
                'status' => ['Teknisi hanya dapat membatalkan inspeksi yang belum dibayar.'],
            ]);
        }

        $cancelledBy = $isBuyer ? 'buyer' : 'technician';
        $job->update(['status' => 'cancelled']);
        $job->load(['product', 'technician', 'requester']);

        // Notifikasi ke pihak lain
        if ($isBuyer) {
            $job->technician?->notify(new InspectionJobCancelledNotification($job, 'buyer'));
        } else {
            $job->requester?->notify(new InspectionJobCancelledNotification($job, 'technician'));
        }

        return $job->fresh();
    }

    /**
     * Teknisi menginput jadwal inspeksi setelah menerima job.
     */
    public function setSchedule(InspectionJob $job, int $technicianId, array $data): InspectionJob
    {
        if ((int) $job->technician_id !== (int) $technicianId) {
            throw ValidationException::withMessages([
                'job' => ['Anda bukan teknisi untuk job ini.'],
            ]);
        }

        if (! in_array($job->status, ['assigned', 'accepted', 'in_progress'])) {
            throw ValidationException::withMessages([
                'status' => ['Job tidak dalam status yang valid untuk mengatur jadwal.'],
            ]);
        }

        $job->update([
            'technician_schedule_date' => $data['technician_schedule_date'],
            'technician_schedule_time' => $data['technician_schedule_time'],
            'technician_schedule_notes' => $data['technician_schedule_notes'] ?? null,
            'scheduled_by_technician' => true,
        ]);

        $job->load(['product.brand', 'requester', 'product']);

        // Notifikasi ke buyer
        $job->requester?->notify(new InspectionScheduledNotification($job));

        // Notifikasi ke seller (product->user_id)
        $sellerId = $job->product->user_id ?? $job->product->seller_id ?? null;
        if ($sellerId && $sellerId !== $job->requested_by) {
            User::find($sellerId)?->notify(new InspectionScheduledNotification($job));
        }

        return $job->fresh();
    }

    public function complete(InspectionJob $job): InspectionJob
    {
        if ($job->status !== 'in_progress') {
            throw ValidationException::withMessages([
                'status' => ['Job harus dalam status in_progress (sudah dibayar) sebelum dapat diselesaikan.'],
            ]);
        }

        $job->update(['status' => 'completed']);

        $payment = $job->payment()->where('status', 'success')->latest()->first();
        if ($payment) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $job->technician_id],
                ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
            );
            app(WalletService::class)->release(
                $wallet,
                (float) $payment->gross_amount,
                'inspection_income_release',
                $job,
                'Pelepasan saldo jasa inspeksi'
            );
        }

        InspectionCompletedEvent::dispatch($job->fresh());

        return $job->fresh();
    }
}
