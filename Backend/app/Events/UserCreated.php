<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Carbon\Carbon;

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
