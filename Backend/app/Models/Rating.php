<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{

    protected $fillable = [
        'order_id',
        'seller_rating',
        'seller_review',
        'product_rating',
        'product_review',
        'technician_rating',
        'technician_review',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
