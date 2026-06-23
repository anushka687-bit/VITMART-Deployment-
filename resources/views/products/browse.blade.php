@extends('layouts.app')
@section('title', 'Browse Products - VITMart')

@section('content')
<h4 class="fw-bold mb-4">Browse Products</h4>

<form method="GET" action="{{ route('browse') }}" class="mb-4">
    <div class="d-flex gap-2 flex-wrap align-items-center p-3" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <select name="category" class="form-select" style="width:auto;min-width:150px;border-radius:8px;font-size:14px;">
            <option value="">All Categories</option>
            @foreach($categories as $cat)
                <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
            @endforeach
        </select>
        <input type="text" name="search" class="form-control" style="flex:1;min-width:200px;border-radius:8px;font-size:14px;" placeholder="Search products..." value="{{ request('search') }}">
        <select name="condition" class="form-select" style="width:auto;min-width:140px;border-radius:8px;font-size:14px;">
            <option value="">All Conditions</option>
            <option value="new" {{ request('condition')=='new' ? 'selected' : '' }}>New</option>
            <option value="like_new" {{ request('condition')=='like_new' ? 'selected' : '' }}>Like New</option>
            <option value="good" {{ request('condition')=='good' ? 'selected' : '' }}>Good</option>
            <option value="fair" {{ request('condition')=='fair' ? 'selected' : '' }}>Fair</option>
        </select>
        <select name="sort" class="form-select" style="width:auto;min-width:150px;border-radius:8px;font-size:14px;">
            <option value="newest">Newest First</option>
            <option value="oldest" {{ request('sort')=='oldest' ? 'selected' : '' }}>Oldest First</option>
            <option value="price_low" {{ request('sort')=='price_low' ? 'selected' : '' }}>Price: Low to High</option>
            <option value="price_high" {{ request('sort')=='price_high' ? 'selected' : '' }}>Price: High to Low</option>
        </select>
        <button type="submit" class="btn btn-primary px-4" style="border-radius:8px;">Search</button>
        <a href="{{ route('browse') }}" class="btn btn-outline-secondary" style="border-radius:8px;">Reset</a>
    </div>
</form>

<div class="row g-3">
    @forelse($products as $p)
    <div class="col-md-4 col-sm-6">
        <a href="{{ route('products.show', $p->id) }}" class="text-decoration-none">
            <div class="h-100" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;transition:box-shadow .2s;" onmouseover="this.style.boxShadow='0 4px 20px rgba(0,0,0,.12)'" onmouseout="this.style.boxShadow='none'">
                <div style="height:200px;overflow:hidden;background:#f3f4f6;">
                    @if($p->images->first())
                        <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
                    @else
                        <div class="d-flex align-items-center justify-content-center h-100 text-muted"><i class="bi bi-image" style="font-size:40px;"></i></div>
                    @endif
                </div>
                <div class="p-3">
                    <div style="font-size:11px;font-weight:600;color:#6366f1;margin-bottom:4px;">{{ $p->category->name ?? 'Others' }}</div>
                    <div style="font-weight:700;font-size:15px;margin-bottom:4px;">{{ Str::limit($p->title, 45) }}</div>
                    <div style="font-size:13px;color:#6b7280;margin-bottom:8px;">by {{ $p->user->name }}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span style="font-size:18px;font-weight:800;color:#6366f1;">₹{{ number_format($p->price) }}</span>
                        <span style="font-size:11px;background:#f3f4f6;padding:3px 8px;border-radius:20px;color:#374151;">{{ ucwords(str_replace('_',' ',$p->condition)) }}</span>
                    </div>
                </div>
            </div>
        </a>
    </div>
    @empty
    <div class="col-12 text-center py-5">
        <i class="bi bi-search" style="font-size:48px;color:#d1d5db;"></i>
        <p class="mt-3 text-muted">No products found. Try adjusting your filters.</p>
    </div>
    @endforelse
</div>

<div class="mt-4">{{ $products->appends(request()->query())->links() }}</div>
@endsection
