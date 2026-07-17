<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExpireOrders extends Command
{
    protected $signature = 'orders:expire';

    protected $description = 'Expire unpaid orders past booking_expires_at (BR-07)';

    public function handle(): int
    {
        $orders = Order::where('status', 'waiting_payment')
            ->where('booking_expires_at', '<', now())
            ->get();

        foreach ($orders as $order) {
            DB::transaction(function () use ($order) {
                $order->update(['status' => 'expired']);
                $order->product()->update(['status' => 'active']);
            });
        }

        $this->info("Expired {$orders->count()} orders.");

        return 0;
    }
}
