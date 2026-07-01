<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{

    protected $fillable = [
        'user_id',
        'available_balance',
        'held_balance',
        'frozen_balance',
    ];

    protected $casts = [
        'available_balance' => 'decimal:2',
        'held_balance'      => 'decimal:2',
        'frozen_balance'    => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}
