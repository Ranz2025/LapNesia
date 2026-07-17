<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionJob extends Model
{
    protected $fillable = [
        'product_id',
        'technician_id',
        'requested_by',
        'schedule_date',
        'fee',
        'status',
        'laptop_address',
        'scheduled_by_technician',
        'inspection_notes',
        'technician_schedule_date',
        'technician_schedule_time',
        'technician_schedule_notes',
    ];

    protected $casts = [
        'schedule_date' => 'datetime',
        'fee' => 'decimal:2',
        'scheduled_by_technician' => 'boolean',
        'technician_schedule_date' => 'date',
    ];

    public function product(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function technician(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function requester(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function report(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(InspectionReport::class, 'job_id');
    }

    public function payment(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(InspectionPayment::class, 'inspection_job_id');
    }

    public function rating(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(InspectionRating::class, 'job_id');
    }

    public function walletTransactions(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(WalletTransaction::class, 'reference');
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status === 'accepted' && ! $this->payment?->snap_token;
    }
}
