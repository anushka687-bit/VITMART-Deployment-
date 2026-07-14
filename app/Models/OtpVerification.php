<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $fillable = ['email', 'purpose', 'otp', 'expires_at', 'attempts'];

    protected $casts = ['expires_at' => 'datetime'];

    public function isExpired(): bool
    {
        return Carbon::now()->isAfter($this->expires_at);
    }
}
