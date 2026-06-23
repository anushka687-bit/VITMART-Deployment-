@extends('layouts.app')
@section('title', 'My Listings - VITMart')

@section('content')
<div class="d-flex justify-content-between align-items-center mb-4">
    <div><h4 class="fw-bold mb-0">My Listings</h4><p class="text-muted mb-0" style="font-size:13px;">{{ $listings->count() }} total listing(s)</p></div>
    <a href="{{ route('create-listing') }}" class="btn btn-primary" style="border-radius:9px;font-weight:600;"><i class="bi bi-plus-lg me-1"></i>New Listing</a>
</div>

@if($listings->isEmpty())
<div class="text-center py-5" style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;">
    <i class="bi bi-box-seam" style="font-size:56px;color:#d1d5db;"></i>
    <h5 class="mt-3 fw-bold">No listings yet</h5>
    <p class="text-muted">Start selling by creating your first listing.</p>
    <a href="{{ route('create-listing') }}" class="btn btn-primary mt-2" style="border-radius:9px;">+ Post Listing</a>
</div>
@else
<div class="row g-3">
    @foreach($listings as $p)
    <div class="col-md-4 col-sm-6">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;height:100%;">
            <div style="height:180px;background:#f3f4f6;position:relative;overflow:hidden;">
                @if($p->images->first())
                    <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
                @else
                    <div class="d-flex align-items-center justify-content-center h-100 text-muted"><i class="bi bi-image" style="font-size:36px;"></i></div>
                @endif
                <div style="position:absolute;top:8px;right:8px;">
                    <span class="badge {{ $p->status === 'available' ? 'bg-success' : 'bg-secondary' }}">{{ ucfirst($p->status) }}</span>
                </div>
            </div>
            <div class="p-3">
                <div style="font-size:11px;color:#6366f1;font-weight:600;margin-bottom:2px;">{{ $p->category->name ?? 'Others' }}</div>
                <div style="font-weight:700;margin-bottom:4px;">{{ Str::limit($p->title, 40) }}</div>
                <div style="font-size:18px;font-weight:800;color:#6366f1;margin-bottom:12px;">₹{{ number_format($p->price) }}</div>
                <div class="d-flex gap-2 flex-wrap">
                    <a href="{{ route('products.show', $p->id) }}" class="btn btn-sm btn-outline-primary" style="border-radius:7px;">View</a>
                    @if($p->status === 'available')
                    <form method="POST" action="{{ route('products.sold', $p->id) }}" style="display:inline;">
                        @csrf @method('PATCH')
                        <button type="submit" class="btn btn-sm btn-outline-secondary" style="border-radius:7px;">Mark Sold</button>
                    </form>
                    @else
                    <form method="POST" action="{{ route('products.available', $p->id) }}" style="display:inline;">
                        @csrf @method('PATCH')
                        <button type="submit" class="btn btn-sm btn-outline-success" style="border-radius:7px;">Mark Available</button>
                    </form>
                    @endif
                    <form method="POST" action="{{ route('products.destroy', $p->id) }}" style="display:inline;" onsubmit="return confirm('Delete this listing?')">
                        @csrf @method('DELETE')
                        <button type="submit" class="btn btn-sm btn-outline-danger" style="border-radius:7px;"><i class="bi bi-trash"></i></button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @endforeach
</div>
@endif
@endsection
