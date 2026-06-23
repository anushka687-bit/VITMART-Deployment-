@extends('layouts.app')
@section('title', 'Messages - VITMart')

@section('content')
<h4 class="fw-bold mb-4">Messages</h4>

@if($conversations->isEmpty())
<div class="text-center py-5" style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;">
    <i class="bi bi-chat-dots" style="font-size:56px;color:#d1d5db;"></i>
    <h5 class="mt-3 fw-bold">No conversations yet</h5>
    <p class="text-muted">Browse products and message sellers to start chatting.</p>
    <a href="{{ route('browse') }}" class="btn btn-primary mt-2" style="border-radius:9px;">Browse Products</a>
</div>
@else
<div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">
    @foreach($conversations as $conv)
    @php $other = $conv->buyer_id === auth()->id() ? $conv->seller : $conv->buyer; @endphp
    <div class="d-flex align-items-center gap-3 p-3" style="border-bottom:1px solid #e5e7eb;cursor:pointer;" onclick="" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='#fff'">
        <div style="width:44px;height:44px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;">{{ substr($other->name,0,1) }}</div>
        <div style="flex:1;min-width:0;">
            <div class="d-flex justify-content-between">
                <strong style="font-size:14px;">{{ $other->name }}</strong>
                <span style="font-size:11px;color:#9ca3af;">{{ $conv->updated_at->diffForHumans() }}</span>
            </div>
            <div style="font-size:13px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Re: {{ $conv->product->title ?? 'Deleted product' }}</div>
        </div>
    </div>
    @endforeach
</div>
@endif
@endsection
