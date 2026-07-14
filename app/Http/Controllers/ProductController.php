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
        $product->incrementViews();
        if (!$product->user->show_phone) {
            $product->user->makeHidden('phone');
        }
        return response()->json($product);
    }

    public function store(Request $request)
    {
        $v = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'title'       => 'required|string|max:255',
            'brand_name'  => 'nullable|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|integer|min:0',
            'condition'   => 'required|in:new,like_new,good,fair',
            'negotiable'  => 'nullable|boolean',
            'images'      => 'required|array|min:1|max:6',
            'images.*'    => 'image|max:3072',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $product = $request->user()->products()->create([
            'category_id' => $request->category_id,
            'brand_name'  => $request->brand_name,
            'title'       => $request->title,
            'description' => $request->description,
            'price'       => $request->price,
            'condition'   => $request->condition,
            'negotiable'  => $request->boolean('negotiable'),
        ]);

        foreach ($request->file('images') as $img) {
            $path = $img->store('products', 'public');
            $product->images()->create(['image_path' => $path]);
        }

        return response()->json($product->load(['user', 'category', 'images']), 201);
    }

    public function destroy(Request $request, int $id)
    {
        $product = Product::with('images')->findOrFail($id);
        if ($product->user_id !== $request->user()->id) abort(403);
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }
        $product->delete();
        return response()->json(['message' => 'Listing deleted.']);
    }

    public function markSold(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== $request->user()->id) abort(403);
        $product->update(['status' => 'sold']);
        return response()->json($product->fresh());
    }

    public function markAvailable(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        if ($product->user_id !== $request->user()->id) abort(403);
        $product->update(['status' => 'available']);
        return response()->json($product->fresh());
    }
}
