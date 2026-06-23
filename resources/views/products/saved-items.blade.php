@extends('layouts.app')
@section('title', 'Saved Items - VITMart')

@section('content')
<h4 class="fw-bold mb-4">Saved Items</h4>

@if($saved->isEmpty())
<div class="text-center py-5" style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;">
    <i class="bi bi-heart" style="font-size:56px;color:#d1d5db;"></i>
    <h5 class="mt-3 fw-bold">No saved items</h5>
    <p class="text-muted">Browse products and save the ones you like.</p>
    <a href="{{ route('browse') }}" class="btn btn-primary mt-2" style="border-radius:9px;">Browse Products</a>
</div>
@else
<div class="row g-3">
    @foreach($saved as $p)
    <div class="col-md-4 col-sm-6">
        <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
            <div style="height:180px;background:#f3f4f6;overflow:hidden;">
                @if($p->images->first())
                    <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">
                @else
                    <div class="d-flex align-items-center justify-content-center h-100 text-muted"><i class="bi bi-image" style="font-size:36px;"></i></div>
                @endif
            </div>
            <div class="p-3">
                <div style="font-size:11px;color:#6366f1;font-weight:600;margin-bottom:2px;">{{ $p->category->name ?? 'Others' }}</div>
                <div style="font-weight:700;margin-bottom:2px;">{{ Str::limit($p->title, 40) }}</div>
                <div style="font-size:13px;color:#6b7280;margin-bottom:8px;">by {{ $p->user->name }}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <span style="font-size:18px;font-weight:800;color:#6366f1;">₹{{ number_format($p->price) }}</span>
                    <div class="d-flex gap-1">
                        <a href="{{ route('products.show', $p->id) }}" class="btn btn-sm btn-outline-primary" style="border-radius:7px;">View</a>
                        <form method="POST" action="{{ route('favourites.toggle', $p->id) }}" style="display:inline;">
                            @csrf
                            <button type="submit" class="btn btn-sm btn-outline-danger" style="border-radius:7px;"><i class="bi bi-heart-fill"></i></button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @endforeach
</div>
@endif
@endsection
