<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionReport extends Model
{

    protected $fillable = [
        'job_id',
        'technician_id',
        'battery_status',
        'screen_status',
        'keyboard_status',
        'touchpad_status',
        'port_status',
        'storage_status',
        'ram_status',
        'cpu_status',
        'physical_status',
        'overall_score',
        'notes',
        'recommendation',
        'published_at',
        'expires_at',
        'pdf_url',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'expires_at' => 'datetime',
        'overall_score' => 'integer',
    ];

    public function job()
    {
        return $this->belongsTo(InspectionJob::class, 'job_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }
}
