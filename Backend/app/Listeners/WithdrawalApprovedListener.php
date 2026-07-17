<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\WithdrawalApprovedEvent;
use App\Notifications\WithdrawalApprovedNotification;

class WithdrawalApprovedListener
{
    public function handle(WithdrawalApprovedEvent $event): void
    {
        $event->withdrawal->wallet->user->notify(new WithdrawalApprovedNotification($event->withdrawal));
    }
}
