<?php

namespace App\Http\Controllers;

use App\Models\{Category, Product};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Storage, Validator};

class PageController extends Controller
{
    public function home()
    {
        if (auth()->check() && auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return view('home');
    }

    public function login()
    {
        if (auth()->check()) {
            return auth()->user()->isAdmin()
                ? redirect()->route('admin.dashboard')
                : redirect()->route('home');
        }
        return view('auth.login');
    }

    public function register()
    {
        if (auth()->check()) return redirect()->route('home');
        return view('auth.register');
    }

    public function browse(Request $request)
    {
        $categories = Category::orderBy('name')->get();
        $query = Product::with(['user', 'category', 'images'])->available();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('brand_name', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }
        match($request->get('sort', 'newest')) {
            'oldest'     => $query->orderBy('created_at'),
            'price_low'  => $query->orderBy('price'),
            'price_high' => $query->orderByDesc('price'),
            default      => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate(15)->appends($request->query());
        return view('products.browse', compact('products', 'categories'));
    }

    public function createListing()
    {
        $categories = Category::orderBy('name')->get();
        return view('products.create', compact('categories'));
    }

    public function storeListing(Request $request)
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
        if ($v->fails()) return back()->withErrors($v)->withInput();

        $product = auth()->user()->products()->create([
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

        return redirect()->route('my-listings')->with('success', 'Listing created successfully!');
    }

    public function myListings()
    {
        $listings = auth()->user()->products()
            ->with(['category', 'images'])
            ->orderByDesc('created_at')
            ->get();
        return view('products.my-listings', compact('listings'));
    }

    public function savedItems()
    {
        $saved = auth()->user()->favourites()->with(['category', 'images', 'user'])->get();
        return view('products.saved-items', compact('saved'));
    }

    public function messages()
    {
        $conversations = auth()->user()->buyConversations()
            ->orWhere('seller_id', auth()->id())
            ->with(['product', 'buyer', 'seller', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->orderByDesc('updated_at')
            ->get();
        return view('messages.index', compact('conversations'));
    }

    public function showProduct(Request $request, int $id)
    {
        if ($request->expectsJson()) {
            return app(ProductController::class)->show($id);
        }
        $product = Product::with(['user', 'category', 'images'])->findOrFail($id);
        $product->incrementViews();
        return view('products.show', compact('product'));
    }

    public function profile()
    {
        return view('profile.index', ['user' => auth()->user()]);
    }
}
