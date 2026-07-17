<?php

declare(strict_types=1);

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Queue monitoring — every 5 minutes
        $schedule->command('queue:monitor --interval=1')
            ->everyFiveMinutes()
            ->runInBackground()
            ->withoutOverlapping();

        // Clear expired tokens — daily at 1 AM
        $schedule->command('sanctum:prune-expired --hours=24')
            ->dailyAt('01:00')
            ->runInBackground();

        // Database backup — daily at 2 AM
        $schedule->exec('bash /app/backup.sh')
            ->dailyAt('02:00')
            ->runInBackground()
            ->emailOutputTo(env('ADMIN_EMAIL'))
            ->appendOutputTo(storage_path('logs/backup.log'));

        // Clear old log files — weekly on Sunday
        $schedule->call(function () {
            $logPath = storage_path('logs');
            $files = glob($logPath.'/laravel-*.log');
            $threshold = now()->subDays(30)->timestamp;

            foreach ($files as $file) {
                if (filemtime($file) < $threshold) {
                    unlink($file);
                }
            }
        })->weekly()->sundays()->at('03:00');

        // Clear failed jobs older than 7 days — daily at 4 AM
        $schedule->command('queue:prune-failed --hours=168')
            ->dailyAt('04:00');

        // Cache cleanup — daily at 5 AM
        $schedule->command('cache:prune-stale-tags')
            ->dailyAt('05:00');

        // Horizon snapshot (if using Horizon)
        // $schedule->command('horizon:snapshot')->everyFiveMinutes();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
