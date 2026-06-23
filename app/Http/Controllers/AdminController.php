<?php

namespace App\Http\Controllers;

use App\Models\{Category, Product, Report, User, Setting};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Storage, Validator};

class AdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'available_products' => Product::available()->count(),
            'sold_products'      => Product::sold()->count(),
            'users'              => User::where('role', 'user')->count(),
            'reported_listings'  => Report::where('status', 'pending')->distinct('product_id')->count('product_id'),
        ];

        // Chart data (last 30 days)
        $chartLabels = [];
        $chartData   = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $chartLabels[] = $date->format('M d');
            $chartData[]   = Product::whereDate('created_at', $date->toDateString())->count();
        }

        // Category distribution
        $categories = Category::withCount('products')->get();

        // Recent listings (5)
        $recentListings = Product::with(['user', 'category', 'images'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Recent reports (5)
        $recentReports = Report::with(['product', 'reporter'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return view('admin.dashboard', compact(
            'stats', 'chartLabels', 'chartData', 'categories',
            'recentListings', 'recentReports'
        ));
    }

    // ── Products Index ─────────────────────────────────────────
    public function productsIndex(Request $request)
    {
        $categories = Category::orderBy('name')->get();
        $query = Product::with(['user', 'category', 'images'])
            ->withCount(['reports' => fn($q) => $q->where('status', 'pending')]);

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('brand_name', 'like', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('created')) {
            $from = match($request->created) {
                'today'    => now()->startOfDay(),
                'yesterday'=> now()->subDay()->startOfDay(),
                '7days'    => now()->subDays(7),
                '30days'   => now()->subDays(30),
                '3months'  => now()->subMonths(3),
                'thisyear' => now()->startOfYear(),
                default    => null,
            };
            if ($from) $query->where('created_at', '>=', $from);
        }
        match($request->sort) {
            'oldest'     => $query->orderBy('created_at'),
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default      => $query->orderByDesc('created_at'),
        };

        $products = $query->paginate(20)->appends($request->query());
        return view('admin.products', compact('products', 'categories'));
    }

    // ── Sold Products ──────────────────────────────────────────
    public function soldProducts(Request $request)
    {
        $categories = Category::orderBy('name')->get();
        $query = Product::with(['user', 'category', 'images'])->where('status', 'sold');

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('brand_name', 'like', "%{$s}%")
                  ->orWhereHas('user', fn($q2) => $q2->where('name', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('sold_date')) {
            $from = match($request->sold_date) {
                'today'    => now()->startOfDay(),
                '7days'    => now()->subDays(7),
                '30days'   => now()->subDays(30),
                '3months'  => now()->subMonths(3),
                'thisyear' => now()->startOfYear(),
                default    => null,
            };
            if ($from) $query->where('updated_at', '>=', $from);
        }
        match($request->sort) {
            'oldest'     => $query->orderBy('updated_at'),
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default      => $query->orderByDesc('updated_at'),
        };

        $products = $query->paginate(20)->appends($request->query());
        return view('admin.sold-products', compact('products', 'categories'));
    }

    // ── Users Index ────────────────────────────────────────────
    public function usersIndex(Request $request)
    {
        $query = User::where('role', 'user')->withCount([
            'products',
            'products as sold_count' => fn($q) => $q->where('status', 'sold'),
        ]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }
        if ($request->filled('joined')) {
            $from = match($request->joined) {
                'today'    => now()->startOfDay(),
                '7days'    => now()->subDays(7),
                '30days'   => now()->subDays(30),
                '3months'  => now()->subMonths(3),
                'thisyear' => now()->startOfYear(),
                default    => null,
            };
            if ($from) $query->where('created_at', '>=', $from);
        }
        match($request->sort) {
            'oldest' => $query->orderBy('created_at'),
            default  => $query->orderByDesc('created_at'),
        };

        $users = $query->paginate(20)->appends($request->query());
        return view('admin.users', compact('users'));
    }

    // ── User Detail ────────────────────────────────────────────
    public function userShow(int $id)
    {
        $user = User::withCount([
            'products',
            'products as available_count' => fn($q) => $q->where('status', 'available'),
            'products as sold_count'       => fn($q) => $q->where('status', 'sold'),
        ])->findOrFail($id);

        $reportsReceived = Report::whereHas('product', fn($q) => $q->where('user_id', $id))->count();

        $listings = Product::with(['category', 'images'])
            ->where('user_id', $id)
            ->orderByDesc('created_at')
            ->paginate(10);

        return view('admin.user-detail', compact('user', 'listings', 'reportsReceived'));
    }

    // ── Product Detail ─────────────────────────────────────────
    public function productShow(int $id)
    {
        $product = Product::with(['user', 'category', 'images', 'reports.reporter'])
            ->withCount(['reports as pending_reports_count' => fn($q) => $q->where('status', 'pending')])
            ->findOrFail($id);

        return view('admin.product-detail', compact('product'));
    }

    // ── Reports Index ──────────────────────────────────────────
    public function reportsIndex(Request $request)
    {
        // Group by product, show count
        $query = Report::with(['product.images', 'product.user', 'reporter'])
            ->where('status', 'pending');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('product', fn($q) => $q->where('title', 'like', "%{$s}%"));
        }

        $reports = $query->orderByDesc('created_at')->paginate(20)->appends($request->query());

        return view('admin.reports', compact('reports'));
    }

    // ── Actions ────────────────────────────────────────────────
    public function dismissReport(int $id)
    {
        $report = Report::findOrFail($id);
        $report->update(['status' => 'ignored']);
        return back()->with('success', 'Report dismissed.');
    }

    public function dismissAllReports(int $id)
    {
        $product = Product::findOrFail($id);
        $product->reports()->where('status', 'pending')->update(['status' => 'ignored']);
        return back()->with('success', 'All reports dismissed for this product.');
    }

    public function deleteProductSoft(int $id)
    {
        $product = Product::with('images')->findOrFail($id);
        foreach ($product->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }
        $product->reports()->update(['status' => 'resolved']);
        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }

    public function markSold(int $id)
    {
        $product = Product::findOrFail($id);
        $product->update(['status' => 'sold']);
        return back()->with('success', 'Product marked as sold.');
    }

    // ── Settings ───────────────────────────────────────────────
    public function settings()
    {
        $settings = [
            'marketplace_name' => Setting::get('marketplace_name', 'VITMart'),
            'admin_email'      => Setting::get('admin_email', auth()->user()->email),
            'logo_path'        => Setting::get('logo_path', ''),
        ];
        return view('admin.settings', compact('settings'));
    }

    public function updateSettings(Request $request)
    {
        $v = Validator::make($request->all(), [
            'marketplace_name' => 'required|string|max:100',
            'admin_email'      => 'required|email|max:255',
            'logo'             => 'nullable|image|mimes:jpg,jpeg,png,svg|max:2048',
        ]);
        if ($v->fails()) return back()->withErrors($v)->withInput();

        Setting::set('marketplace_name', $request->marketplace_name);
        Setting::set('admin_email', $request->admin_email);

        if ($request->hasFile('logo')) {
            $old = Setting::get('logo_path', '');
            if ($old) Storage::disk('public')->delete($old);
            $path = $request->file('logo')->store('settings', 'public');
            Setting::set('logo_path', $path);
        }

        return back()->with('success', 'Settings saved successfully.');
    }
}
