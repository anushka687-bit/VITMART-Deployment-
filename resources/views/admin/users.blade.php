@extends('layouts.admin')
@section('title', 'Users - VITMart Admin')
@section('page-title', 'Users')

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span><span>Users</span>
</div>

<div class="filter-bar">
    <input type="text" id="filter-search" placeholder="Search by name or email..." value="{{ request('search') }}">
    <select id="filter-joined">
        <option value="">All Time</option>
        <option value="today" {{ request('joined')=='today'?'selected':'' }}>Today</option>
        <option value="7days" {{ request('joined')=='7days'?'selected':'' }}>Last 7 Days</option>
        <option value="30days" {{ request('joined')=='30days'?'selected':'' }}>Last 30 Days</option>
        <option value="3months" {{ request('joined')=='3months'?'selected':'' }}>Last 3 Months</option>
        <option value="thisyear" {{ request('joined')=='thisyear'?'selected':'' }}>This Year</option>
    </select>
    <select id="filter-sort">
        <option value="">Newest First</option>
        <option value="oldest" {{ request('sort')=='oldest'?'selected':'' }}>Oldest First</option>
    </select>
    <button class="btn-admin btn-admin-secondary" id="btn-reset">Reset</button>
</div>

<div class="panel-card">
    <div class="panel-card-header">
        <div class="panel-card-title">All Users</div>
        <span style="font-size:13px; color:var(--text-muted);">{{ $users->total() }} users</span>
    </div>
    <div class="table-responsive">
        <table class="admin-table">
            <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Listings</th><th>Sold</th><th>Joined</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
                @forelse($users as $u)
                <tr>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div style="width:32px; height:32px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700;">
                                {{ substr($u->name, 0, 1) }}
                            </div>
                            <strong>{{ $u->name }}</strong>
                        </div>
                    </td>
                    <td>{{ $u->email }}</td>
                    <td>{{ $u->phone ?: '-' }}</td>
                    <td>{{ $u->products_count }}</td>
                    <td>{{ $u->sold_count }}</td>
                    <td>{{ $u->created_at->format('d M Y') }}</td>
                    <td><span class="badge-status {{ $u->is_blocked ? 'pending' : 'available' }}">{{ $u->is_blocked ? 'Blocked' : 'Active' }}</span></td>
                    <td>
                        <div class="d-flex gap-1 flex-wrap">
                            <a href="{{ route('admin.users.show', $u->id) }}" class="btn-admin btn-admin-primary btn-admin-sm">View</a>
                            <form method="POST" action="{{ route('admin.users.toggle-block', $u->id) }}" style="display:inline;" onsubmit="return confirm('{{ $u->is_blocked ? 'Unblock' : 'Block' }} this user?')">
                                @csrf @method('PATCH')
                                <button type="submit" class="btn-admin {{ $u->is_blocked ? 'btn-admin-secondary' : 'btn-admin-danger' }} btn-admin-sm">
                                    {{ $u->is_blocked ? 'Unblock' : 'Block' }}
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="8" class="text-center py-4 text-muted">No users found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-3">{{ $users->appends(request()->query())->links() }}</div>
</div>
@endsection

@push('scripts')
<script>
function applyFilters() {
    const p = new URLSearchParams();
    const s = document.getElementById('filter-search').value;
    const j = document.getElementById('filter-joined').value;
    const sort = document.getElementById('filter-sort').value;
    if (s) p.set('search', s);
    if (j) p.set('joined', j);
    if (sort) p.set('sort', sort);
    window.location = '{{ route("admin.users.index") }}?' + p.toString();
}
document.getElementById('filter-search').onkeyup = e => { if (e.key === 'Enter') applyFilters(); };
document.getElementById('filter-joined').onchange = applyFilters;
document.getElementById('filter-sort').onchange = applyFilters;
document.getElementById('btn-reset').onclick = () => window.location = '{{ route("admin.users.index") }}';
</script>
@endpush
