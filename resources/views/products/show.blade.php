@extends('layouts.app')
@section('title', '{{ $product->title }} - VITMart')

@section('content')
<div class="mb-3"><a href="{{ route('browse') }}" class="text-muted text-decoration-none" style="font-size:14px;"><i class="bi bi-arrow-left me-1"></i>Back to Browse</a></div>

<div class="row g-4">
    <div class="col-md-7">
        <div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">
            @if($product->images->count() > 0)
            <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                    @foreach($product->images as $i => $img)
                    <div class="carousel-item {{ $i === 0 ? 'active' : '' }}">
                        <img src="{{ asset('storage/'.$img->image_path) }}" class="d-block w-100" style="height:380px;object-fit:contain;background:#f8fafc;" onerror="this.src='https://placehold.co/600x380?text=No+Image'">
                    </div>
                    @endforeach
                </div>
                @if($product->images->count() > 1)
                <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
                <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
                @endif
            </div>
            @else
            <div class="d-flex align-items-center justify-content-center text-muted" style="height:300px;"><i class="bi bi-image" style="font-size:60px;"></i></div>
            @endif
        </div>
    </div>

    <div class="col-md-5">
        <div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:24px;margin-bottom:16px;">
            <div style="font-size:12px;color:#6366f1;font-weight:600;margin-bottom:6px;">{{ $product->category->name ?? 'Others' }}</div>
            <h4 style="font-weight:800;margin-bottom:6px;">{{ $product->title }}</h4>
            @if($product->brand_name)
            <div style="font-size:14px;color:#6b7280;margin-bottom:12px;">Brand: <strong>{{ $product->brand_name }}</strong></div>
            @endif
            <div style="font-size:30px;font-weight:800;color:#6366f1;margin-bottom:4px;">₹{{ number_format($product->price) }}</div>
            @if($product->negotiable)
            <div style="font-size:13px;color:#10b981;margin-bottom:16px;"><i class="bi bi-check-circle me-1"></i>Price Negotiable</div>
            @endif
            <div class="d-flex gap-2 mb-3">
                <span style="background:#f3f4f6;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;">{{ ucwords(str_replace('_',' ',$product->condition)) }}</span>
                <span style="background:{{ $product->status==='available' ? '#dcfce7' : '#fee2e2' }};color:{{ $product->status==='available' ? '#15803d' : '#b91c1c' }};padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;">{{ ucfirst($product->status) }}</span>
            </div>
            <hr>
            <div class="row g-2 mb-3">
                <div class="col-6"><div style="font-size:11px;color:#9ca3af;font-weight:600;">VIEWS</div><div style="font-size:14px;">{{ $product->views }}</div></div>
                <div class="col-6"><div style="font-size:11px;color:#9ca3af;font-weight:600;">LISTED ON</div><div style="font-size:14px;">{{ $product->created_at->format('d M Y') }}</div></div>
            </div>
            <p style="font-size:14px;color:#374151;line-height:1.6;">{{ $product->description }}</p>

            @auth
            @if($product->user_id !== auth()->id() && $product->status === 'available')
            <div class="d-flex gap-2">
                <form method="POST" action="{{ route('favourites.toggle', $product->id) }}" style="flex:0 0 auto;">
                    @csrf
                    <button type="submit" class="btn btn-outline-secondary" style="border-radius:9px;"><i class="bi bi-heart"></i></button>
                </form>
                <form method="POST" action="{{ route('report.store', $product->id) }}" style="flex:0 0 auto;">
                    @csrf
                    <input type="hidden" name="reason" value="Inappropriate listing">
                    <button type="submit" class="btn btn-outline-danger btn-sm" style="border-radius:9px;" onclick="return confirm('Report this listing?')"><i class="bi bi-flag"></i> Report</button>
                </form>
            </div>
            @endif
            @endauth
        </div>

        <div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:20px;">
            <h6 class="fw-bold mb-3">Seller Information</h6>
            <div class="d-flex align-items-center gap-3 mb-3">
                <div style="width:44px;height:44px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">{{ substr($product->user->name,0,1) }}</div>
                <div>
                    <div style="font-weight:700;">{{ $product->user->name }}</div>
                    <div style="font-size:12px;color:#9ca3af;">Member since {{ $product->user->created_at->format('M Y') }}</div>
                </div>
            </div>
            <div class="row g-2" style="font-size:13px;">
                @if($product->user->show_phone && $product->user->phone)
                <div class="col-12"><i class="bi bi-telephone me-2 text-muted"></i>{{ $product->user->phone }}</div>
                @endif
                @if($product->user->block)
                <div class="col-12"><i class="bi bi-building me-2 text-muted"></i>{{ $product->user->block }}</div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
