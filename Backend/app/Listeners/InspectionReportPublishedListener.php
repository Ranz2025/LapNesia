<?php

namespace App\Listeners;

use App\Events\InspectionReportPublishedEvent;
use App\Notifications\InspectionReportPublishedNotification;

class InspectionReportPublishedListener
{
    public function handle(InspectionReportPublishedEvent $event): void
    {
        $event->report->job->requester->notify(new InspectionReportPublishedNotification($event->report));
    }
}
