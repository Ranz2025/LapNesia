<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class InspectionReportPhoto extends Model
{
    protected $fillable = [
        'inspection_report_id',
        'path',
        'caption',
        'sort_order',
    ];

    protected $appends = ['url'];

    public function report()
    {
        return $this->belongsTo(InspectionReport::class, 'inspection_report_id');
    }

    /** Full public URL untuk ditampilkan di frontend. */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
