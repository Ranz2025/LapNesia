<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatRoom extends Model
{

    protected $fillable = ['user_one_id', 'user_two_id', 'product_id', 'last_message_at'];

    protected $casts = ['last_message_at' => 'datetime'];

    public function userOne()
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo()
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function latestMessage()
    {
        return $this->hasOne(ChatMessage::class)->latestOfMany();
    }
}
