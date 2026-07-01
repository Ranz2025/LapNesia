<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{

    protected $fillable = [
        'wallet_id',
        'reference_id',
        'reference_type',
        'type',
        'status',
        'amount',
        'balance_before',
        'balance_after',
        'description',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'balance_before' => 'decimal:2',
        'balance_after'  => 'decimal:2',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }
}
