<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\InspectionJob;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InspectionCompletedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public InspectionJob $job) {}
}
