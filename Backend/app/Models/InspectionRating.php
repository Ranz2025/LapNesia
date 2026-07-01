<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionRating extends Model
{

    protected $fillable = [
        'job_id',
        'technician_id',
        'buyer_id',
        'rating',
        'review',
    ];

    public function job()
    {
        return $this->belongsTo(InspectionJob::class, 'job_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
}
