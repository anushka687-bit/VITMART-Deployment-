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

        <div class="panel-card mt-3">
            <div class="panel-card-header"><div class="panel-card-title">Change Password</div></div>
            <form method="POST" action="{{ route('admin.settings.password') }}" class="settings-form">
                @csrf
                <div class="form-group">
                    <label>Current Password</label>
                    <input type="password" name="current_password" required autocomplete="current-password">
                    @error('current_password')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" name="password" required minlength="8" autocomplete="new-password">
                    @error('password')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" name="password_confirmation" required minlength="8" autocomplete="new-password">
                </div>
                <button type="submit" class="btn-admin btn-admin-primary"><i class="bi bi-key me-1"></i>Change Password</button>
            </form>
            <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">
                Forgot your password? Use “Forgot password?” on the admin sign-in page — a reset code will be emailed to you.
            </div>
        </div>
    </div>

    <div class="col-md-5">
        <div class="panel-card">
            <div class="panel-card-header"><div class="panel-card-title">Admin Accounts</div></div>
            @foreach($admins as $admin)
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid var(--border-color);">
                    <div>
                        <div class="detail-value fw-bold">{{ $admin->name }} @if($admin->id === auth()->id())<span style="font-size:11px; color:var(--text-muted);">(you)</span>@endif</div>
                        <div style="font-size:12px; color:var(--text-muted);">{{ $admin->email }}</div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="panel-card mt-3">
            <div class="panel-card-header"><div class="panel-card-title">Add New Admin</div></div>
            <form method="POST" action="{{ route('admin.settings.admins.store') }}" class="settings-form">
                @csrf
                <div class="form-group">
                    <label>Name</label>
                    <input type="text" name="admin_name" value="{{ old('admin_name') }}" required>
                    @error('admin_name')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="new_admin_email" value="{{ old('new_admin_email') }}" required>
                    @error('new_admin_email')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="admin_password" required minlength="8" autocomplete="new-password">
                    @error('admin_password')<div class="alert-error mt-1">{{ $message }}</div>@enderror
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="admin_password_confirmation" required minlength="8" autocomplete="new-password">
                </div>
                <button type="submit" class="btn-admin btn-admin-primary"><i class="bi bi-person-plus me-1"></i>Add Admin</button>
            </form>
            <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">
                The new admin can sign in immediately from the admin sign-in page and change their password from this screen.
            </div>
        </div>
    </div>
</div>
@endsection
