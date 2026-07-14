<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'block',
        'avatar', 'show_phone', 'role', 'email_verified_at', 'is_blocked',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'show_phone'        => 'boolean',
        'is_blocked'        => 'boolean',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isBlocked(): bool
    {
        return $this->is_blocked;
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function favourites()
    {
        return $this->belongsToMany(Product::class, 'favourites');
    }

    public function buyConversations()
    {
        return $this->hasMany(Conversation::class, 'buyer_id');
    }

    public function sellConversations()
    {
        return $this->hasMany(Conversation::class, 'seller_id');
    }

    public function reportsMade()
    {
        return $this->hasMany(Report::class, 'reported_by');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewed_user_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'user_id');
    }
}
