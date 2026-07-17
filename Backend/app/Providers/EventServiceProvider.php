<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\InspectionCompletedEvent;
use App\Events\InspectionReportPublishedEvent;
use App\Events\OrderCreatedEvent;
use App\Events\PaymentSuccessEvent;
use App\Events\UserCreated;
use App\Events\WithdrawalApprovedEvent;
use App\Events\WithdrawalRejectedEvent;
use App\Listeners\InspectionCompletedListener;
use App\Listeners\InspectionReportPublishedListener;
use App\Listeners\OrderCreatedListener;
use App\Listeners\PaymentSuccessListener;
use App\Listeners\UserCreatedListener;
use App\Listeners\WithdrawalApprovedListener;
use App\Listeners\WithdrawalRejectedListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        OrderCreatedEvent::class => [OrderCreatedListener::class],
        PaymentSuccessEvent::class => [PaymentSuccessListener::class],
        InspectionCompletedEvent::class => [InspectionCompletedListener::class],
        InspectionReportPublishedEvent::class => [InspectionReportPublishedListener::class],
        WithdrawalApprovedEvent::class => [WithdrawalApprovedListener::class],
        WithdrawalRejectedEvent::class => [WithdrawalRejectedListener::class],
        UserCreated::class => [UserCreatedListener::class],
    ];
}
