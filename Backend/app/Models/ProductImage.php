<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{

    protected $fillable = [
        'product_id',
        'image_url',
        'is_primary',
        'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    /**
     * Kembalikan full URL jika image_url adalah path relatif (bukan http/https).
     * Ini memastikan foto lokal di storage/app/public/products/ bisa diakses frontend.
     */
    public function getImageUrlAttribute(string $value): string
    {
        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://')) {
            return $value;
        }

        return url('storage/' . $value);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
