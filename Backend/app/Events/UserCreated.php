<?php

declare(strict_types=1);

namespace App\Events;

use Carbon\Carbon;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserCreated
{
    use Dispatchable, SerializesModels;

    public function __construct()
    {
        // Dispatch broadcast event
        UserGrowthUpdated::dispatch(
            count: 1,
            date: Carbon::now()->format('Y-m-d')
        );
    }
}
