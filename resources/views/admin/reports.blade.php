@extends('layouts.admin')
@section('title', 'Reports - VITMart Admin')
@section('page-title', 'Reports')

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span><span>Reports</span>
</div>

<div class="filter-bar">
    <input type="text" id="filter-search" placeholder="Search by product title..." value="{{ request('search') }}">
    <button class="btn-admin btn-admin-secondary" id="btn-reset">Reset</button>
</div>

<div class="panel-card">
    <div class="panel-card-header">
        <div class="panel-card-title">Pending Reports</div>
        <span style="font-size:13px; color:var(--text-muted);">{{ $reports->total() }} reports</span>
    </div>
    <div class="table-responsive">
        <table class="admin-table">
            <thead>
                <tr><th>Product</th><th>Seller</th><th>Reason</th><th>Reporter</th><th>Report Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
                @forelse($reports as $r)
                <tr class="row-reported">
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            @if($r->product && $r->product->images->first())
                                <img src="{{ asset('storage/'.$r->product->images->first()->image_path) }}" class="table-img" onerror="this.src='https://placehold.co/42?text=NA'">
                            @else
                                <div class="table-img d-flex align-items-center justify-content-center bg-light text-muted" style="font-size:10px;">N/A</div>
                            @endif
                            <div>
                                <div class="fw-bold">{{ $r->product->title ?? 'Deleted Product' }}</div>
                                @if($r->description)
                                <div style="font-size:11px; color:var(--text-muted);">{{ Str::limit($r->description, 40) }}</div>
                                @endif
                            </div>
                        </div>
                    </td>
                    <td>{{ $r->product->user->name ?? 'Unknown' }}</td>
                    <td><span class="report-badge">{{ $r->reason }}</span></td>
                    <td>{{ $r->reporter->name ?? 'Unknown' }}</td>
                    <td>{{ $r->created_at->format('d M Y') }}</td>
                    <td>
                        <div class="d-flex gap-1 flex-wrap">
                            @if($r->product)
                            <a href="{{ route('admin.products.show', $r->product->id) }}" class="btn-admin btn-admin-secondary btn-admin-sm">
                                <i class="bi bi-eye"></i> View
                            </a>
                            @endif

                            <form method="POST" action="{{ route('admin.reports.dismiss', $r->id) }}" style="display:inline;">
                                @csrf @method('PATCH')
                                <button type="submit" class="btn-admin btn-admin-secondary btn-admin-sm">
                                    <i class="bi bi-x-circle"></i> Dismiss
                                </button>
                            </form>

                            @if($r->product)
                            <form method="POST" action="{{ route('admin.products.destroy', $r->product->id) }}" style="display:inline;" onsubmit="return confirm('Delete this listing?')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn-admin btn-admin-danger btn-admin-sm">
                                    <i class="bi bi-trash"></i> Delete
                                </button>
                            </form>
                            @endif
                        </div>
                    </td>
                </tr>
                @empty
                <tr><td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-shield-check" style="font-size:32px; display:block; margin-bottom:8px; color:#10b981;"></i>
                    No pending reports
                </td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-3">{{ $reports->appends(request()->query())->links() }}</div>
</div>
@endsection

@push('scripts')
<script>
document.getElementById('filter-search').onkeyup = function(e) {
    if (e.key === 'Enter') {
        const p = new URLSearchParams();
        const s = this.value;
        if (s) p.set('search', s);
        window.location = '{{ route("admin.reports.index") }}?' + p.toString();
    }
};
document.getElementById('btn-reset').onclick = () => window.location = '{{ route("admin.reports.index") }}';
</script>
@endpush
