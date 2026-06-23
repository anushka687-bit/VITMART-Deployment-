<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Factories\HasFactory, Model};
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($cat) {
            if (empty($cat->slug)) {
                $cat->slug = Str::slug($cat->name);
            }
        });
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
