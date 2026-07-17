<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\InspectionReport;
use App\Services\InspectionPdfService;
use Illuminate\Console\Command;

class RegeneratePdfs extends Command
{
    protected $signature = 'inspections:regenerate-pdfs';

    protected $description = 'Re-generate semua PDF laporan inspeksi dengan template terbaru';

    public function handle(InspectionPdfService $pdfService): int
    {
        $reports = InspectionReport::with(['job.product.brand', 'technician'])->get();

        if ($reports->isEmpty()) {
            $this->info('Tidak ada laporan inspeksi yang ditemukan.');

            return 0;
        }

        $this->info("Ditemukan {$reports->count()} laporan. Mulai re-generate...");
        $bar = $this->output->createProgressBar($reports->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($reports as $report) {
            try {
                $pdfService->generate($report);
                $success++;
            } catch (\Throwable $e) {
                $this->newLine();
                $this->warn("Gagal untuk laporan ID {$report->id}: {$e->getMessage()}");
                $failed++;
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("Selesai. Berhasil: {$success} | Gagal: {$failed}");

        return 0;
    }
}
