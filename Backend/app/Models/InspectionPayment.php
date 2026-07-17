<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionPayment extends Model
{
    protected $fillable = [
        'inspection_job_id',
        'buyer_id',
        'technician_id',
        'payment_gateway',
        'payment_gateway_ref',
        'transaction_id',
        'snap_token',
        'snap_redirect_url',
        'gross_amount',
        'payment_type',
        'signature_key',
        'status',
        'webhook_payload',
        'paid_at',
    ];

    protected $casts = [
        'webhook_payload' => 'array',
        'paid_at' => 'datetime',
        'gross_amount' => 'decimal:2',
    ];

    public function job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(InspectionJob::class, 'inspection_job_id');
    }

    public function buyer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function technician(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
