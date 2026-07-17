<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'seller_id',
        'brand_id',
        'category_id',
        'model',
        'slug',
        'cpu',
        'ram',
        'storage',
        'storage_type',
        'gpu',
        'screen_size',
        'price',
        'condition',
        'location',
        'description',
        'stock',
        'inspection_ready',
        'status',
        'is_spec_verified',
        'avg_rating',
    ];

    protected $casts = [
        'is_spec_verified' => 'boolean',
        'inspection_ready' => 'boolean',
        'price' => 'decimal:2',
        'avg_rating' => 'decimal:2',
        'stock' => 'integer',
    ];

    public function seller(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function brand(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function inspectionJobs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(InspectionJob::class);
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Order::class);
    }
}
