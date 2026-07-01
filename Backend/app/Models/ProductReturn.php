<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReturn extends Model
{

    protected $table = 'returns';

    protected $fillable = [
        'order_id',
        'buyer_id',
        'seller_id',
        'reason',
        'status',
        'seller_notes',
        'admin_notes',
        'return_resi',
        'approved_at',
        'rejected_at',
        'completed_at',
    ];

    protected $casts = [
        'approved_at'  => 'datetime',
        'rejected_at'  => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}
