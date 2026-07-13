<?php

namespace App\Listeners;

use App\Events\PaymentSuccessEvent;
use App\Events\DashboardRevenueUpdated;
use App\Notifications\OrderPaidSellerNotification;
use App\Notifications\PaymentSuccessNotification;
use Carbon\Carbon;

class PaymentSuccessListener
{
    public function handle(PaymentSuccessEvent $event): void
    {
        $order = $event->payment->order;

        // Notify buyer
        $order->buyer->notify(new PaymentSuccessNotification($order));

        // Notify seller
        $order->seller->notify(new OrderPaidSellerNotification($order));

        // Broadcast real-time revenue update to dashboard
        DashboardRevenueUpdated::dispatch(
            revenue: (float) $order->platform_fee,
            orders: 1,
            date: Carbon::parse($order->paid_at)->format('Y-m-d'),
            period: 'realtime'
        );
    }
}
