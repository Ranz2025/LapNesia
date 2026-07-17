<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionReport extends Model
{
    protected $fillable = [
        'job_id',
        'technician_id',
        'battery_status',
        'battery_notes',
        'screen_status',
        'screen_notes',
        'keyboard_status',
        'keyboard_notes',
        'touchpad_status',
        'touchpad_notes',
        'port_status',
        'port_notes',
        'storage_status',
        'storage_notes',
        'ram_status',
        'ram_notes',
        'cpu_status',
        'cpu_notes',
        'physical_status',
        'physical_notes',
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

    public function job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(InspectionJob::class, 'job_id');
    }

    public function technician(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function photos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InspectionReportPhoto::class, 'inspection_report_id')
            ->orderBy('sort_order')
            ->orderBy('id');
    }
}
