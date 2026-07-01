<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{

    protected $fillable = [
        'order_id',
        'payment_gateway',
        'payment_gateway_ref',
        'snap_token',
        'snap_redirect_url',
        'payment_type',
        'transaction_id',
        'gross_amount',
        'signature_key',
        'status',
        'webhook_payload',
        'paid_at',
    ];

    protected $casts = [
        'webhook_payload' => 'array',
        'paid_at'         => 'datetime',
        'gross_amount'    => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
