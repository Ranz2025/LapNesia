<?php

namespace App\Services;

use App\Events\WithdrawalApprovedEvent;
use App\Events\WithdrawalRejectedEvent;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;

class WithdrawalService
{
    public function __construct(protected WalletService $walletService) {}

    /**
     * Rule A-C: Create withdrawal, freeze amount dari available_balance.
     */
    public function create(Wallet $wallet, array $data): Withdrawal
    {
        return DB::transaction(function () use ($wallet, $data) {
            if ((float) $wallet->available_balance < $data['amount']) {
                throw new \Exception('Saldo tidak mencukupi.');
            }

            $withdrawal = Withdrawal::create([
                'wallet_id'      => $wallet->id,
                'amount'         => $data['amount'],
                'bank_name'      => $data['bank_name'],
                'account_name'   => $data['account_name'],
                'account_number' => $data['account_number'],
                'status'         => 'pending',
            ]);

            // Freeze saldo dengan reference yang BENAR (withdrawal, bukan wallet)
            $this->walletService->freezeForWithdrawal(
                $wallet,
                $data['amount'],
                'withdraw',
                $withdrawal,  // CORRECT: withdrawal reference
                'Withdrawal freeze'
            );

            $this->auditLog($withdrawal->wallet->user, 'withdrawal_created', $withdrawal);

            return $withdrawal;
        });
    }

    /**
     * Rule D: Admin approve withdrawal.
     */
    public function approve(Withdrawal $withdrawal, User $admin): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin) {
            if ($withdrawal->status !== 'pending') {
                throw new \Exception('Withdrawal sudah diproses.');
            }

            $withdrawal->update([
                'status'       => 'approved',
                'approved_by'  => $admin->id,
                'processed_at' => now(),
            ]);

            // Dana sudah dibekukan, tidak perlu debit lagi
            $this->auditLog($admin, 'withdrawal_approved', $withdrawal);

            WithdrawalApprovedEvent::dispatch($withdrawal->fresh());

            return $withdrawal->fresh();
        });
    }

    /**
     * Rule E: Admin reject, kembalikan saldo ke available_balance.
     */
    public function reject(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin, $reason) {
            if ($withdrawal->status !== 'pending') {
                throw new \Exception('Withdrawal sudah diproses.');
            }

            $withdrawal->update([
                'status'           => 'rejected',
                'approved_by'      => $admin->id,
                'processed_at'     => now(),
                'rejection_reason' => $reason,
            ]);

            // Kembalikan saldo yang dibekukan menggunakan releaseFreeze
            $this->walletService->releaseFreeze(
                $withdrawal->wallet,
                (float) $withdrawal->amount,
                'withdraw',
                $withdrawal,
                'Withdrawal rejected - refund'
            );

            $this->auditLog($admin, 'withdrawal_rejected', $withdrawal, ['reason' => $reason]);

            WithdrawalRejectedEvent::dispatch($withdrawal->fresh());

            return $withdrawal->fresh();
        });
    }

    /**
     * Rule G: Audit log.
     */
    private function auditLog(User $user, string $action, Withdrawal $withdrawal, array $extra = []): void
    {
        AuditLog::create([
            'user_id'        => $user->id,
            'action'         => $action,
            'auditable_id'   => $withdrawal->id,
            'auditable_type' => Withdrawal::class,
            'old_values'     => [],
            'new_values'     => array_merge($withdrawal->toArray(), $extra),
            'ip_address'     => request()->ip(),
        ]);
    }
}