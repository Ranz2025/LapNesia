<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianAvailability extends Model
{

    protected $fillable = [
        'user_id',
        'available_date',
        'start_time',
        'end_time',
        'is_booked',
    ];

    protected $casts = [
        'available_date' => 'date',
        'is_booked' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
