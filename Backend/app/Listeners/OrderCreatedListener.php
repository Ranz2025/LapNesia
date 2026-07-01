<?php

namespace App\Listeners;

use App\Events\OrderCreatedEvent;
use App\Notifications\OrderCreatedNotification;

class OrderCreatedListener
{
    public function handle(OrderCreatedEvent $event): void
    {
        $event->order->buyer->notify(new OrderCreatedNotification($event->order));
    }
}
