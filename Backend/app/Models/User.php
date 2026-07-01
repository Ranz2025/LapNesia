<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'address',
        'profile_photo_url',
        'role',
        'status',
        'avg_rating',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_login_at' => 'datetime',
    ];

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function ordersAsBuyer()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function ordersAsSeller()
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function technicianProfile()
    {
        return $this->hasOne(TechnicianProfile::class);
    }

    public function technicianAvailabilities()
    {
        return $this->hasMany(TechnicianAvailability::class);
    }

    public function wishlists()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function carts()
    {
        return $this->hasMany(Cart::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $url = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($this->email);

        $this->notify(new \App\Notifications\ResetPasswordNotification($url));
    }
}
