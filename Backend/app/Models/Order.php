<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{

    protected $fillable = [
        'order_number',
        'product_id',
        'buyer_id',
        'seller_id',
        'product_price',
        'platform_fee',
        'total_amount',
        'product_snapshot',
        'booking_expires_at',
        'paid_at',
        'shipped_at',
        'completed_at',
        'status',
        'is_disputed',
        'dispute_reason',
        'notes',
        'resi_number',
        'shipping_address',
    ];

    protected $casts = [
        'product_snapshot' => 'array',
        'booking_expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'completed_at' => 'datetime',
        'is_disputed' => 'boolean',
        'product_price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function rating()
    {
        return $this->hasOne(Rating::class);
    }

    public function walletTransactions()
    {
        return $this->morphMany(WalletTransaction::class, 'reference');
    }

    public function productReturn()
    {
        return $this->hasOne(ProductReturn::class);
    }
}
