<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class FavouriteController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->favourites()->with(['category', 'images'])->get());
    }

    public function add(Request $request, int $id)
    {
        $request->user()->favourites()->syncWithoutDetaching([$id]);
        return response()->json(['message' => 'Added to favourites.']);
    }

    public function remove(Request $request, int $id)
    {
        $request->user()->favourites()->detach($id);
        return response()->json(['message' => 'Removed from favourites.']);
    }
}
