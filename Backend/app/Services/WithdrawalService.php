<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\WithdrawalApprovedEvent;
use App\Events\WithdrawalCreatedEvent;
use App\Events\WithdrawalRejectedEvent;
use App\Models\AuditLog;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal; // Import WalletTransaction
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request; // Import Request facade

class WithdrawalService
{
    public function __construct(protected WalletService $walletService) {}

    /**
     * Buat withdrawal baru dan *freeze* saldo secara atomik.
     * Status awal adalah PENDING, menunggu persetujuan admin.
     */
    public function create(Wallet $wallet, array $data): Withdrawal
    {
        return DB::transaction(function () use ($wallet, $data) {
            // 1. Validasi saldo
            if ((float) $wallet->available_balance < (float) $data['amount']) {
                throw new \InvalidArgumentException('Saldo tidak mencukupi.');
            }

            // 2. Simpan withdrawal dengan status PENDING
            $withdrawal = Withdrawal::create([
                'wallet_id' => $wallet->id,
                'amount' => $data['amount'],
                'bank_name' => $data['bank_name'],
                'account_name' => $data['account_name'],
                'account_number' => $data['account_number'],
                'status' => Withdrawal::STATUS_PENDING, // PENDING status
                // 'processed_at' tidak diisi karena masih pending
            ]);

            // 3. Freeze saldo. Type transaksi adalah WithdrawalCreated
            $this->walletService->freezeForWithdrawal(
                $wallet,
                (float) $data['amount'],
                WalletTransaction::TYPE_FREEZE_FOR_WITHDRAWAL, // Gunakan konstanta
                $withdrawal,
                'Withdrawal requested - awaiting approval'
            );

            // 4. Catat audit log
            $this->auditLog($wallet->user, 'withdrawal_created', $withdrawal);

            // 5. Dispatch event
            WithdrawalCreatedEvent::dispatch($withdrawal->fresh());

            return $withdrawal;
        });
    }

    /**
     * Admin approve withdrawal.
     */
    public function approve(Withdrawal $withdrawal, User $admin): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin) {
            if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
                throw new \Exception('Withdrawal sudah diproses.');
            }

            $withdrawal->update([
                'status' => Withdrawal::STATUS_APPROVED,
                'approved_by' => $admin->id,
                'processed_at' => now(),
            ]);

            $this->auditLog($admin, 'withdrawal_approved', $withdrawal);

            WithdrawalApprovedEvent::dispatch($withdrawal->fresh());

            return $withdrawal->fresh();
        });
    }

    /**
     * Admin reject, kembalikan saldo ke available_balance.
     */
    public function reject(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin, $reason) {
            if ($withdrawal->status !== Withdrawal::STATUS_PENDING) {
                throw new \Exception('Withdrawal sudah diproses.');
            }

            $withdrawal->update([
                'status' => Withdrawal::STATUS_REJECTED,
                'approved_by' => $admin->id, // Menggunakan approved_by sebagai rejected_by untuk saat ini
                'processed_at' => now(),
                'rejection_reason' => $reason,
            ]);

            // Kembalikan saldo yang dibekukan menggunakan releaseFreeze
            // Type transaksi adalah withdrawal_rejected
            $this->walletService->releaseFreeze(
                $withdrawal->wallet,
                (float) $withdrawal->amount,
                'withdrawal_rejected',
                $withdrawal,
                'Withdrawal rejected - refund to available balance'
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
            'user_id' => $user->id,
            'action' => $action,
            'auditable_id' => $withdrawal->id,
            'auditable_type' => Withdrawal::class,
            'old_values' => [],
            'new_values' => array_merge($withdrawal->toArray(), $extra),
            'ip_address' => Request::ip() ?? '127.0.0.1', // Tangani null IP di CLI
        ]);
    }
}
