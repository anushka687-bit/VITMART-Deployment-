<?php

namespace App\Http\Controllers;

use App\Models\{Product, ProductImage};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Storage, Validator};

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['user', 'category', 'images'])->available();
        if ($s = $request->query('search')) {
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%$s%")
                  ->orWhere('description', 'like', "%$s%")
                  ->orWhereHas('category', fn($c) => $c->where('name', 'like', "%$s%"));
            });
        }
        if ($cat = $request->query('category')) {
            $query->where('category_id', $cat);
        }
        if ($min = $request->query('min_price')) $query->where('price', '>=', $min);
        if ($max = $request->query('max_price')) $query->where('price', '<=', $max);
        if ($cond = $request->query('condition')) $query->where('condition', $cond);
        match ($request->query('sort', 'newest')) {
            'oldest'     => $query->oldest(),
            'price_low'  => $query->orderBy('price'),
            'price_high' => $query->orderBy('price', 'desc'),
            default      => $query->latest(),
        };
        return response()->json($query->paginate(15));
    }

    public function show(int $id)
    {
        $product = Product::with(['user', 'category', 'images'])->findOrFail($id);
        if (!$product->user->show_phone) {
            $product->user->makeHidden('phone');
        }
        return response()->json($product);
    }

    // Session-based actions
    public function destroySession(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== auth()->id()) abort(403);
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }
        $product->delete();
        return back()->with('success', 'Listing deleted.');
    }

    public function markSoldSession(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== auth()->id()) abort(403);
        $product->update(['status' => 'sold']);
        return back()->with('success', 'Marked as sold.');
    }

    public function markAvailableSession(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== auth()->id()) abort(403);
        $product->update(['status' => 'available']);
        return back()->with('success', 'Marked as available.');
    }
}
