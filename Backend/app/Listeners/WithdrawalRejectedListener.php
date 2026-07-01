<?php

namespace App\Listeners;

use App\Events\WithdrawalRejectedEvent;
use App\Notifications\WithdrawalRejectedNotification;

class WithdrawalRejectedListener
{
    public function handle(WithdrawalRejectedEvent $event): void
    {
        $event->withdrawal->wallet->user->notify(new WithdrawalRejectedNotification($event->withdrawal));
    }
}
