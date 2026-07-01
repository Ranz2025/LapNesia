<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\InspectionRating;

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
        'schedule_date'            => 'datetime',
        'fee'                      => 'decimal:2',
        'scheduled_by_technician'  => 'boolean',
        'technician_schedule_date' => 'date',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function report()
    {
        return $this->hasOne(InspectionReport::class, 'job_id');
    }

    public function payment()
    {
        return $this->hasOne(InspectionPayment::class, 'inspection_job_id');
    }

    public function rating()
    {
        return $this->hasOne(InspectionRating::class, 'job_id');
    }

    public function walletTransactions()
    {
        return $this->morphMany(WalletTransaction::class, 'reference');
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status === 'accepted' && ! $this->payment?->snap_token;
    }
}
