<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserGrowthUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $count;
    public $date;

    public function __construct($count, $date)
    {
        $this->count = $count;
        $this->date = $date;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('dashboard-users'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'user-growth-updated';
    }

    public function broadcastWith(): array
    {
        return [
            'count' => $this->count,
            'date' => $this->date,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
