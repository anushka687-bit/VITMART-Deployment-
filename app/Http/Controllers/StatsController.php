<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    /**
     * Public marketplace stats shown on the landing page.
     * Cached for 60s so the landing page never hammers the DB.
     */
    public function index()
    {
        $stats = Cache::remember('public_stats', 60, function () {
            return [
                'active_students'   => User::where('role', 'user')->where('is_blocked', false)->count(),
                'total_listings'    => Product::count(),
                'successful_trades' => Product::sold()->count(),
            ];
        });

        return response()->json($stats);
    }
}
