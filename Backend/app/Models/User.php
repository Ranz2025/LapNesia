<?php

declare(strict_types=1);

namespace App\Models;

use App\Events\UserCreated;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property \App\Models\TechnicianProfile $technicianProfile
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $dispatchesEvents = [
        'created' => UserCreated::class,
    ];

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

    public function wallet(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function products(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Product::class, 'seller_id');
    }

    public function ordersAsBuyer(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function ordersAsSeller(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class, 'seller_id');
    }

    public function technicianProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(TechnicianProfile::class);
    }

    public function technicianAvailabilities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TechnicianAvailability::class);
    }

    public function wishlists(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function auditLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function carts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function sendPasswordResetNotification($token)
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $url = $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($this->email);

        $this->notify(new ResetPasswordNotification($url));
    }
}
