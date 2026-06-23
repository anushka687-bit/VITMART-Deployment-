@extends('layouts.app')
@section('title', 'VITMart - Campus Marketplace')

@section('content')
<div class="text-center py-5 mb-4" style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);border-radius:16px;color:#fff;padding:60px 20px!important;">
    <h1 style="font-weight:800;font-size:2.4rem;">Buy &amp; Sell on Campus</h1>
    <p style="font-size:1.1rem;opacity:.9;max-width:500px;margin:10px auto 24px;">VITMart is the trusted marketplace exclusively for VIT students.</p>
    <div class="d-flex gap-3 justify-content-center flex-wrap">
        <a href="{{ route('browse') }}" class="btn btn-light btn-lg px-4" style="font-weight:600;border-radius:10px;">Browse Products</a>
        @auth
        <a href="{{ route('create-listing') }}" class="btn btn-outline-light btn-lg px-4" style="border-radius:10px;font-weight:600;">+ Sell Item</a>
        @else
        <a href="{{ route('register') }}" class="btn btn-outline-light btn-lg px-4" style="border-radius:10px;font-weight:600;">Get Started</a>
        @endauth
    </div>
</div>

<div class="row g-3 mb-4 text-center">
    @foreach([['bi-shield-check','Verified Students','Only VIT email verified users'],['bi-lightning-charge','Fast &amp; Easy','List your item in minutes'],['bi-chat-dots','Direct Messaging','Chat directly with buyers/sellers']] as [$icon, $title, $desc])
    <div class="col-md-4">
        <div class="p-4" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
            <i class="bi {{ $icon }}" style="font-size:32px;color:#6366f1;"></i>
            <h5 class="mt-2 mb-1" style="font-weight:700;">{!! $title !!}</h5>
            <p class="text-muted mb-0" style="font-size:13px;">{{ $desc }}</p>
        </div>
    </div>
    @endforeach
</div>

<div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-bold mb-0">Recent Listings</h5>
    <a href="{{ route('browse') }}" class="btn btn-sm btn-outline-primary" style="border-radius:8px;">Browse All</a>
</div>
<p class="text-muted" style="font-size:13px;">Sign in to browse and buy products.</p>
@endsection
