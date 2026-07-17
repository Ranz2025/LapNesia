<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DashboardRevenueUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $revenue;

    public $orders;

    public $date;

    public $period;

    public function __construct($revenue, $orders, $date, $period = 'daily')
    {
        $this->revenue = $revenue;
        $this->orders = $orders;
        $this->date = $date;
        $this->period = $period;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('dashboard-revenue'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'revenue-updated';
    }

    public function broadcastWith(): array
    {
        return [
            'revenue' => $this->revenue,
            'orders' => $this->orders,
            'date' => $this->date,
            'period' => $this->period,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
