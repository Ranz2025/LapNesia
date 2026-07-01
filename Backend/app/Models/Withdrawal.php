<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{

    protected $fillable = [
        'wallet_id',
        'amount',
        'bank_name',
        'account_name',
        'account_number',
        'status',
        'approved_by',
        'processed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'processed_at' => 'datetime',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function walletTransactions()
    {
        return $this->morphMany(WalletTransaction::class, 'reference');
    }
}
