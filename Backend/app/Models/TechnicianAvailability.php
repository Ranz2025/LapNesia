<?php

declare(strict_types=1);

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

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
