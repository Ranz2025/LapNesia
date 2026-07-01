<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('orders:expire')->everyFiveMinutes();
Schedule::command('escrow:auto-release')->hourly();
