<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:expire')->everyFiveMinutes();
Schedule::command('escrow:auto-release')->hourly();
