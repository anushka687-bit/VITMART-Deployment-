<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Favourite extends Pivot
{
    protected $table = 'favourites';

    protected $fillable = ['user_id', 'product_id'];

    public $timestamps = true;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}