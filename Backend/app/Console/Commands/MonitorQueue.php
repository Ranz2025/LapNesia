<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MonitorQueue extends Command
{
    protected $signature = 'queue:monitor {--interval=60 : Monitoring interval in seconds}';

    protected $description = 'Monitor queue health and log metrics';

    public function handle(): int
    {
        $interval = (int) $this->option('interval');

        $this->info('Starting queue monitoring (interval: '.$interval.'s)');

        while (true) {
            try {
                $this->checkQueue();
                sleep($interval);
            } catch (\Exception $e) {
                Log::error('Queue monitoring error: '.$e->getMessage());
                sleep($interval);
            }
        }
    }

    private function checkQueue(): void
    {
        $queuedJobs = DB::table('jobs')->count();
        $failedJobs = DB::table('failed_jobs')->count();
        $processingJobs = DB::table('jobs')->where('reserved_at', '!=', null)->count();

        $metrics = [
            'queued_jobs' => $queuedJobs,
            'processing_jobs' => $processingJobs,
            'failed_jobs' => $failedJobs,
            'timestamp' => now()->toIso8601String(),
        ];

        // Alert if too many failed jobs
        if ($failedJobs > 100) {
            Log::warning('High number of failed jobs detected', $metrics);
        }

        // Alert if queue is backing up
        if ($queuedJobs > 1000) {
            Log::warning('Queue backlog detected', $metrics);
        }

        // Log metrics
        Log::channel('queue')->info('Queue metrics', $metrics);

        // Report to monitoring service (if configured)
        $this->reportMetrics($metrics);
    }

    private function reportMetrics(array $metrics): void
    {
        // Report to Sentry/DataDog/New Relic if configured
        if (function_exists('sentry_captureMessage')) {
            sentry_captureMessage('Queue metrics: '.json_encode($metrics), 'info');
        }
    }
}
