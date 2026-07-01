<?php

namespace App\Listeners;

use App\Events\PaymentSuccessEvent;
use App\Notifications\OrderPaidSellerNotification;
use App\Notifications\PaymentSuccessNotification;

class PaymentSuccessListener
{
    public function handle(PaymentSuccessEvent $event): void
    {
        $order = $event->payment->order;

        // Notify buyer
        $order->buyer->notify(new PaymentSuccessNotification($order));

        // Notify seller
        $order->seller->notify(new OrderPaidSellerNotification($order));
    }
}
