<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Factories\HasFactory, Model, SoftDeletes};

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'category_id', 'title', 'brand_name',
        'description', 'price', 'condition', 'negotiable',
        'status', 'views',
    ];

    protected $casts = [
        'negotiable' => 'boolean',
        'price'      => 'integer',
        'views'      => 'integer',
    ];

    // ── Scopes ────────────────────────────────────────────────
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeSold($query)
    {
        return $query->where('status', 'sold');
    }

    // ── Relationships ─────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function favouritedBy()
    {
        return $this->belongsToMany(User::class, 'favourites');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    // ── Helpers ───────────────────────────────────────────────
    public function incrementViews(): void
    {
        $this->increment('views');
    }
}
