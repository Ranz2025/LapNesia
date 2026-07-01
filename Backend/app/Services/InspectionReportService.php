<?php

namespace App\Services;

use App\Events\InspectionReportPublishedEvent;
use App\Models\InspectionJob;
use App\Models\InspectionReport;
use App\Notifications\InspectionReportUploadedNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InspectionReportService
{
    public function create(array $data, string $technicianId): InspectionReport
    {
        return DB::transaction(function () use ($data, $technicianId) {
            $job = InspectionJob::with(['product', 'requester'])->find($data['job_id']);

            if (!$job || (int) $job->technician_id !== (int) $technicianId) {
                throw ValidationException::withMessages([
                    'job_id' => ['Job tidak ditemukan atau Anda bukan teknisi yang ditugaskan.'],
                ]);
            }

            if ($job->status !== 'completed') {
                throw ValidationException::withMessages([
                    'job_id' => ['Job harus diselesaikan terlebih dahulu.'],
                ]);
            }

            if ($job->report()->exists()) {
                throw ValidationException::withMessages([
                    'job_id' => ['Laporan sudah dibuat untuk job ini.'],
                ]);
            }

            $publishedAt = now();
            $report = InspectionReport::create(array_merge($data, [
                'technician_id' => $technicianId,
                'published_at'  => $publishedAt,
                'expires_at'    => $publishedAt->copy()->addDays(14),
            ]));

            // Mark product as spec verified
            $job->product()->update(['is_spec_verified' => true]);

            // Kirim notifikasi ke buyer
            $job->requester?->notify(new InspectionReportUploadedNotification($job));

            InspectionReportPublishedEvent::dispatch($report);

            return $report->load(['job', 'technician']);
        });
    }

    public function find(string $id): ?InspectionReport
    {
        return InspectionReport::with(['job.product', 'technician'])->find($id);
    }
}
