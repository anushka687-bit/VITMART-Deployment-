<?php

namespace App\Models;

use Illuminate\Database\Eloquent\{Factories\HasFactory, Model};

class Report extends Model
{
    use HasFactory;

    protected $fillable = ['product_id', 'reported_by', 'reason', 'description', 'status'];

    public function product()
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
