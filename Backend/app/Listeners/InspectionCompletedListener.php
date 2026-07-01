<?php

namespace App\Listeners;

use App\Events\InspectionCompletedEvent;
use App\Models\TechnicianProfile;
use App\Notifications\InspectionCompletedNotification;

class InspectionCompletedListener
{
    public function handle(InspectionCompletedEvent $event): void
    {
        $job = $event->job;

        // Notifikasi ke buyer
        $job->requester->notify(new InspectionCompletedNotification($job));

        // Update total_inspections di TechnicianProfile
        TechnicianProfile::where('user_id', $job->technician_id)
            ->increment('total_inspections');
    }
}
