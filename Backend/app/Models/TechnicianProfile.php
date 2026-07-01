<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TechnicianProfile extends Model
{

    protected $fillable = [
        'user_id',
        'bio',
        'skills',
        'certification_url',
        'inspection_fee',
        'rating_avg',
        'total_inspections',
    ];

    protected $casts = [
        'inspection_fee' => 'decimal:2',
        'rating_avg' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
