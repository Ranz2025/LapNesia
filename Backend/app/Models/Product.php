<?php

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
        'is_spec_verified'  => 'boolean',
        'inspection_ready'  => 'boolean',
        'price'             => 'decimal:2',
        'avg_rating'        => 'decimal:2',
        'stock'             => 'integer',
    ];

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function inspectionJobs()
    {
        return $this->hasMany(InspectionJob::class);
    }

    public function order()
    {
        return $this->hasOne(Order::class);
    }
}
