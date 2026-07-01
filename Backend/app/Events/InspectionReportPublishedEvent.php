<?php

namespace App\Events;

use App\Models\InspectionReport;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InspectionReportPublishedEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public InspectionReport $report) {}
}
