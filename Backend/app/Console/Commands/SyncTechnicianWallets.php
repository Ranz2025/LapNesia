<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Console\Command;

class SyncTechnicianWallets extends Command
{
    protected $signature = 'wallets:sync-technicians';
    protected $description = 'Create missing wallets for all existing technician users';

    public function handle(): int
    {
        $technicians = User::where('role', 'technician')->get();
        $created = 0;

        foreach ($technicians as $technician) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $technician->id],
                ['available_balance' => 0, 'held_balance' => 0, 'frozen_balance' => 0]
            );

            if ($wallet->wasRecentlyCreated) {
                $created++;
            }
        }

        $this->info("Wallet teknisi disinkronkan. Wallet baru dibuat: {$created}");

        return self::SUCCESS;
    }
}
