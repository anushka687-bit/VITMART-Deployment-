@extends('layouts.admin')
@section('title', 'Settings - VITMart Admin')
@section('page-title', 'Settings')

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span><span>Settings</span>
</div>

<div class="row g-3">
    <div class="col-md-7">
        <div class="panel-card">
            <div class="panel-card-header"><div class="panel-card-title">Marketplace Settings</div></div>
            <form method="POST" action="{{ route('admin.settings.update') }}" enctype="multipart/form-data" class="settings-form">
                @csrf
                <div class="form-group">
                    <label>Marketplace Name</label>
                    <input type="text" name="marketplace_name" value="{{ old('marketplace_name', $settings['marketplace_name']) }}" required>
                    @error('marketplace_name')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Admin Email</label>
                    <input type="email" name="admin_email" value="{{ old('admin_email', $settings['admin_email']) }}" required>
                    @error('admin_email')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Marketplace Logo</label>
                    @if($settings['logo_path'])
                        <div class="mb-2">
                            <img src="{{ asset('storage/'.$settings['logo_path']) }}" style="height:60px; border-radius:8px; border:1px solid var(--border-color);">
                        </div>
                    @endif
                    <input type="file" name="logo" accept="image/*">
                    <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">JPG, PNG, SVG — max 2MB</div>
                    @error('logo')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <button type="submit" class="btn-admin btn-admin-primary"><i class="bi bi-check-circle me-1"></i>Save Settings</button>
            </form>
        </div>
    </div>
    <div class="col-md-5">
        <div class="panel-card">
            <div class="panel-card-header"><div class="panel-card-title">Admin Credentials</div></div>
            <div class="detail-label">Current Admin</div>
            <div class="detail-value fw-bold mb-2">{{ auth()->user()->name }}</div>
            <div class="detail-label">Email</div>
            <div class="detail-value mb-2">{{ auth()->user()->email }}</div>
            <div style="font-size:12px; color:var(--text-muted);">Admin accounts are managed via database. To add admins, set role='admin' in the users table.</div>
        </div>
    </div>
</div>
@endsection
