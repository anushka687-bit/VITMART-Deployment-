@extends('layouts.admin')
@section('title', 'User Details - VITMart Admin')
@section('page-title', 'User Details')

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span>
    <a href="{{ route('admin.users.index') }}">Users</a>
    <span class="sep">/</span>
    <span>{{ $user->name }}</span>
</div>

<div class="row g-3 mb-4">
    <div class="col-md-6">
        <div class="panel-card h-100">
            <div class="panel-card-header"><div class="panel-card-title">Profile Information</div></div>
            <div class="d-flex align-items-center justify-content-between gap-3 mb-4">
                <div class="d-flex align-items-center gap-3">
                    <div style="width:60px; height:60px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:700;">
                        {{ substr($user->name, 0, 1) }}
                    </div>
                    <div>
                        <div style="font-size:18px; font-weight:700;">{{ $user->name }}</div>
                        <div style="font-size:13px; color:var(--text-muted);">{{ $user->email }}</div>
                    </div>
                </div>
                @unless($user->isAdmin())
                <form method="POST" action="{{ route('admin.users.toggle-block', $user->id) }}" onsubmit="return confirm('{{ $user->is_blocked ? 'Unblock' : 'Block' }} this user?')">
                    @csrf @method('PATCH')
                    <button type="submit" class="btn-admin {{ $user->is_blocked ? 'btn-admin-secondary' : 'btn-admin-danger' }} btn-admin-sm">
                        {{ $user->is_blocked ? 'Unblock User' : 'Block User' }}
                    </button>
                </form>
                @endunless
            </div>
            <div class="row g-3">
                <div class="col-md-6"><div class="detail-label">Phone</div><div class="detail-value">{{ $user->phone ?: 'N/A' }}</div></div>
                <div class="col-md-6"><div class="detail-label">Hostel Block</div><div class="detail-value">{{ $user->block ?: 'N/A' }}</div></div>
                <div class="col-md-6"><div class="detail-label">Joined Date</div><div class="detail-value">{{ $user->created_at->format('d M Y') }}</div></div>
                <div class="col-md-6"><div class="detail-label">Role</div><div class="detail-value"><span class="badge-status {{ $user->role === 'admin' ? 'pending' : 'available' }}">{{ ucfirst($user->role) }}</span></div></div>
                <div class="col-md-6"><div class="detail-label">Status</div><div class="detail-value"><span class="badge-status {{ $user->is_blocked ? 'pending' : 'available' }}">{{ $user->is_blocked ? 'Blocked' : 'Active' }}</span></div></div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="panel-card h-100">
            <div class="panel-card-header"><div class="panel-card-title">Marketplace Statistics</div></div>
            <div class="row g-3">
                <div class="col-6">
                    <div class="stat-card p-3">
                        <div class="stat-icon-wrap green" style="width:40px;height:40px;font-size:18px;"><i class="bi bi-box" style="color:#16a34a;"></i></div>
                        <div><div class="stat-label">Total Listings</div><div class="stat-number" style="font-size:22px;">{{ $user->products_count }}</div></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-card p-3">
                        <div class="stat-icon-wrap blue" style="width:40px;height:40px;font-size:18px;"><i class="bi bi-check-circle" style="color:#2563eb;"></i></div>
                        <div><div class="stat-label">Available</div><div class="stat-number" style="font-size:22px;">{{ $user->available_count }}</div></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-card p-3">
                        <div class="stat-icon-wrap amber" style="width:40px;height:40px;font-size:18px;"><i class="bi bi-currency-rupee" style="color:#d97706;"></i></div>
                        <div><div class="stat-label">Sold</div><div class="stat-number" style="font-size:22px;">{{ $user->sold_count }}</div></div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="stat-card p-3">
                        <div class="stat-icon-wrap red" style="width:40px;height:40px;font-size:18px;"><i class="bi bi-flag" style="color:#dc2626;"></i></div>
                        <div><div class="stat-label">Reports Recv.</div><div class="stat-number" style="font-size:22px;">{{ $reportsReceived }}</div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="panel-card">
    <div class="panel-card-header">
        <div class="panel-card-title">All Listings</div>
    </div>
    <div class="table-responsive">
        <table class="admin-table">
            <thead>
                <tr><th>Image</th><th>Title</th><th>Category</th><th>Price</th><th>Status</th><th>Created</th><th>Action</th></tr>
            </thead>
            <tbody>
                @forelse($listings as $p)
                <tr>
                    <td>
                        @if($p->images->first())
                            <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" class="table-img" onerror="this.src='https://placehold.co/42?text=NA'">
                        @else
                            <div class="table-img d-flex align-items-center justify-content-center bg-light text-muted" style="font-size:10px;">N/A</div>
                        @endif
                    </td>
                    <td><strong>{{ $p->title }}</strong></td>
                    <td><span class="badge-cat">{{ $p->category->name ?? 'Others' }}</span></td>
                    <td class="price-cell">₹{{ number_format($p->price) }}</td>
                    <td><span class="badge-status {{ $p->status }}">{{ ucfirst($p->status) }}</span></td>
                    <td>{{ $p->created_at->format('d M Y') }}</td>
                    <td><a href="{{ route('admin.products.show', $p->id) }}" class="btn-admin btn-admin-primary btn-admin-sm">View</a></td>
                </tr>
                @empty
                <tr><td colspan="7" class="text-center py-4 text-muted">No listings found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-3">{{ $listings->links() }}</div>
</div>
@endsection
