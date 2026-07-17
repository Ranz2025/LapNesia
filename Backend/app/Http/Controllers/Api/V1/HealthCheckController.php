<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthCheckController extends Controller
{
    public function check(): JsonResponse
    {
        $health = [
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => [],
        ];

        // Database check
        try {
            DB::connection()->getPdo();
            $health['checks']['database'] = ['status' => 'ok'];
        } catch (\Exception $e) {
            $health['checks']['database'] = ['status' => 'failed', 'error' => $e->getMessage()];
            $health['status'] = 'degraded';
        }

        // Redis check
        try {
            Redis::ping();
            $health['checks']['redis'] = ['status' => 'ok'];
        } catch (\Exception $e) {
            $health['checks']['redis'] = ['status' => 'failed', 'error' => $e->getMessage()];
            $health['status'] = 'degraded';
        }

        // Memory check
        $memory = memory_get_usage(true) / (1024 * 1024);
        $memoryLimit = (int) ini_get('memory_limit');
        $memoryUsagePercent = ($memory / $memoryLimit) * 100;

        $health['checks']['memory'] = [
            'status' => $memoryUsagePercent < 80 ? 'ok' : 'warning',
            'usage_mb' => round($memory, 2),
            'limit_mb' => $memoryLimit,
            'usage_percent' => round($memoryUsagePercent, 2),
        ];

        if ($memoryUsagePercent >= 90) {
            $health['status'] = 'degraded';
        }

        // Queue check
        try {
            $failedJobs = \DB::table('failed_jobs')->count();
            $queuedJobs = \DB::table('jobs')->count();

            $health['checks']['queue'] = [
                'status' => $failedJobs < 100 ? 'ok' : 'warning',
                'queued_jobs' => $queuedJobs,
                'failed_jobs' => $failedJobs,
            ];

            if ($failedJobs >= 100) {
                $health['status'] = 'degraded';
            }
        } catch (\Exception $e) {
            $health['checks']['queue'] = ['status' => 'unknown'];
        }

        $statusCode = $health['status'] === 'healthy' ? 200 : 503;

        return response()->json($health, $statusCode);
    }

    public function live(): JsonResponse
    {
        return response()->json(['status' => 'alive'], 200);
    }

    public function ready(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            Redis::ping();

            return response()->json(['status' => 'ready'], 200);
        } catch (\Exception $e) {
            return response()->json(['status' => 'not_ready', 'error' => $e->getMessage()], 503);
        }
    }
}
