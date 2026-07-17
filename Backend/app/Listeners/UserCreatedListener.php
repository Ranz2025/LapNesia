<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\UserGrowthUpdated;
use App\Models\User;
use Carbon\Carbon;

class UserCreatedListener
{
    public function handle($event): void
    {
        // Broadcast real-time user growth update to dashboard
        UserGrowthUpdated::dispatch(
            count: 1,
            date: Carbon::now()->format('Y-m-d')
        );
    }
}
