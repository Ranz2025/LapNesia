<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\EscrowService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AutoReleaseEscrow extends Command
{
    protected $signature   = 'escrow:auto-release';
    protected $description = 'Auto-complete orders where resi input and 3 business days passed (BR-18)';

    public function __construct(protected EscrowService $escrow) {
        parent::__construct();
    }

    public function handle(): int
    {
        $cutoff = $this->subtractBusinessDays(Carbon::now(), 3);

        $orders = Order::where('status', 'paid')
            ->where('is_disputed', false)
            ->whereNotNull('shipped_at')
            ->where('shipped_at', '<=', $cutoff)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('No orders to auto-complete.');
            return 0;
        }

        $released = 0;
        foreach ($orders as $order) {
            try {
                DB::transaction(function () use ($order) {
                    $order->update(['status' => 'completed', 'completed_at' => now()]);
                    $order->product()->update(['status' => 'sold']);
                    $this->escrow->releaseEscrow($order);
                });
                $released++;
                $this->info("Released: {$order->order_number}");
            } catch (\Throwable $e) {
                Log::error("Escrow auto-release failed for {$order->order_number}: {$e->getMessage()}");
                $this->error("Failed: {$order->order_number}");
            }
        }

        $this->info("Auto-released {$released} orders.");
        return 0;
    }

    private function subtractBusinessDays(Carbon $date, int $days): Carbon
    {
        $d = $date->copy();
        $subtracted = 0;
        while ($subtracted < $days) {
            $d->subDay();
            if (!$d->isWeekend()) $subtracted++;
        }
        return $d;
    }
}
