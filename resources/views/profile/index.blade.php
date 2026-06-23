@extends('layouts.app')
@section('title', 'My Profile - VITMart')

@section('content')
<div class="row g-4">
<div class="col-md-4">
    <div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:28px;text-align:center;">
        <div style="width:80px;height:80px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;margin:0 auto 14px;">{{ substr($user->name,0,1) }}</div>
        <h5 style="font-weight:800;margin-bottom:4px;">{{ $user->name }}</h5>
        <div style="font-size:13px;color:#6b7280;margin-bottom:12px;">{{ $user->email }}</div>
        <div style="font-size:12px;color:#9ca3af;">Member since {{ $user->created_at->format('M Y') }}</div>
    </div>
</div>

<div class="col-md-8">
    <div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:28px;">
        <h6 class="fw-bold mb-3">Edit Profile</h6>

        @if($errors->any())
        <div class="alert alert-danger">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('profile.update') }}" enctype="multipart/form-data">
            @csrf @method('PUT')
            <div class="mb-3">
                <label class="form-label fw-semibold">Full Name</label>
                <input type="text" name="name" class="form-control" value="{{ old('name', $user->name) }}" required>
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Phone Number</label>
                <input type="text" name="phone" class="form-control" value="{{ old('phone', $user->phone) }}" placeholder="9876543210">
            </div>
            <div class="mb-3">
                <label class="form-label fw-semibold">Hostel Block</label>
                <input type="text" name="block" class="form-control" value="{{ old('block', $user->block) }}" placeholder="e.g. A-block">
            </div>
            <div class="mb-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" name="show_phone" id="show_phone" value="1" {{ $user->show_phone ? 'checked' : '' }}>
                    <label class="form-check-label" for="show_phone">Show phone number to buyers</label>
                </div>
            </div>
            <div class="mb-4">
                <label class="form-label fw-semibold">Profile Photo</label>
                <input type="file" name="avatar" class="form-control" accept="image/*">
            </div>
            <button type="submit" class="btn btn-primary px-4" style="border-radius:9px;font-weight:600;">Save Changes</button>
        </form>
    </div>
</div>
</div>
@endsection
