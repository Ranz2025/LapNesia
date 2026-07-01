<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;

class WalletService
{
    /**
     * Freeze amount for withdrawal (available → frozen).
     */
    public function freezeForWithdrawal(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'completed'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        
        if ((float) $wallet->available_balance < $amount) {
            throw new \Exception('Saldo tidak mencukupi.');
        }

        $before = (float) $wallet->available_balance;
        $wallet->decrement('available_balance', $amount);
        $wallet->increment('frozen_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before - $amount, $reference, $description, $status);
    }

    /**
     * Release frozen amount (frozen → available).
     */
    public function releaseFreeze(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'completed'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        
        if ((float) $wallet->frozen_balance < $amount) {
            throw new \Exception('Frozen balance tidak mencukupi.');
        }

        $before = (float) $wallet->available_balance;
        $wallet->decrement('frozen_balance', $amount);
        $wallet->increment('available_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before + $amount, $reference, $description, $status);
    }

    /**
     * Add to available_balance.
     */
    public function credit(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'completed'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        $before = (float) $wallet->available_balance;
        $wallet->increment('available_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before + $amount, $reference, $description, $status);
    }

    /**
     * Subtract from available_balance.
     */
    public function debit(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'completed'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        
        if ((float) $wallet->available_balance < $amount) {
            throw new \Exception('Saldo tidak mencukupi.');
        }

        $before = (float) $wallet->available_balance;
        $wallet->decrement('available_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before - $amount, $reference, $description, $status);
    }

    /**
     * Move amount from available_balance → held_balance (escrow in).
     */
    public function hold(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'escrow'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        $before = (float) $wallet->available_balance;
        $wallet->increment('held_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before, $reference, $description, $status);
    }

    /**
     * Move amount from held_balance → available_balance (escrow release).
     */
    public function release(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'released'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        
        if ((float) $wallet->held_balance < $amount) {
            throw new \Exception('Held balance tidak mencukupi.');
        }

        $before = (float) $wallet->available_balance;
        $wallet->decrement('held_balance', $amount);
        $wallet->increment('available_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before + $amount, $reference, $description, $status);
    }

    /**
     * Remove from held_balance (refund — funds go back to buyer externally).
     */
    public function refund(Wallet $wallet, float $amount, string $type, Model $reference, string $description = '', string $status = 'refunded'): WalletTransaction
    {
        $wallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();
        
        if ((float) $wallet->held_balance < $amount) {
            throw new \Exception('Held balance tidak mencukupi untuk refund.');
        }

        $before = (float) $wallet->available_balance;
        $wallet->decrement('held_balance', $amount);

        return $this->record($wallet, $type, $amount, $before, $before, $reference, $description, $status);
    }

    private function record(Wallet $wallet, string $type, float $amount, float $before, float $after, Model $reference, string $description, string $status): WalletTransaction
    {
        return WalletTransaction::create([
            'wallet_id'      => $wallet->id,
            'reference_id'   => $reference->id,
            'reference_type' => get_class($reference),
            'type'           => $type,
            'status'         => $status,
            'amount'         => $amount,
            'balance_before' => $before,
            'balance_after'  => $after,
            'description'    => $description,
        ]);
    }
}
