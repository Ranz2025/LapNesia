<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        $start = microtime(true);

        $response = $next($request);

        $duration = microtime(true) - $start;
        $statusCode = $response->getStatusCode();

        // Log based on status code
        $logLevel = match (true) {
            $statusCode >= 500 => 'error',
            $statusCode >= 400 => 'warning',
            $statusCode >= 200 && $statusCode < 300 => 'info',
            default => 'notice',
        };

        Log::channel('api')->log($logLevel, 'API Request', [
            'method' => $request->getMethod(),
            'path' => $request->getPathInfo(),
            'status_code' => $statusCode,
            'duration_ms' => round($duration * 1000, 2),
            'user_id' => auth()->id(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $response;
    }
}
