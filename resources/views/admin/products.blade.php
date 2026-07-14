@extends('layouts.admin')
@section('title', 'Products - VITMart Admin')
@section('page-title', 'Products')

@php use Illuminate\Support\Str; @endphp

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span><span>Products</span>
</div>

<div class="filter-bar">
    <select id="filter-category">
        <option value="">All Categories</option>
        @foreach($categories as $cat)
            <option value="{{ $cat->id }}" {{ request('category') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
        @endforeach
    </select>
    <input type="text" id="filter-search" placeholder="Search title, brand, seller..." value="{{ request('search') }}">
    <select id="filter-created">
        <option value="">All Time</option>
        <option value="today" {{ request('created')=='today'?'selected':'' }}>Today</option>
        <option value="yesterday" {{ request('created')=='yesterday'?'selected':'' }}>Yesterday</option>
        <option value="7days" {{ request('created')=='7days'?'selected':'' }}>Last 7 Days</option>
        <option value="30days" {{ request('created')=='30days'?'selected':'' }}>Last 30 Days</option>
        <option value="3months" {{ request('created')=='3months'?'selected':'' }}>Last 3 Months</option>
        <option value="thisyear" {{ request('created')=='thisyear'?'selected':'' }}>This Year</option>
    </select>
    <select id="filter-sort">
        <option value="">Newest First</option>
        <option value="oldest" {{ request('sort')=='oldest'?'selected':'' }}>Oldest First</option>
        <option value="price_asc" {{ request('sort')=='price_asc'?'selected':'' }}>Price Low to High</option>
        <option value="price_desc" {{ request('sort')=='price_desc'?'selected':'' }}>Price High to Low</option>
    </select>
    <button class="btn-admin btn-admin-secondary" id="btn-reset">Reset</button>
</div>

<div class="panel-card">
    <div class="panel-card-header">
        <div class="panel-card-title">All Products</div>
        <span style="font-size:13px; color:var(--text-muted);">{{ $products->total() }} results</span>
    </div>
    <div class="table-responsive">
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Image</th><th>Title</th><th>Brand</th><th>Category</th><th>Seller</th><th>Price</th><th>Created</th><th>Action</th>
                </tr>
            </thead>
            <tbody>
                @forelse($products as $p)
                <tr class="{{ $p->reports_count > 0 ? 'row-reported' : '' }}">
                    <td>
                        @if($p->images->first())
                            <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" class="table-img" onerror="this.src='https://placehold.co/42?text=NA'">
                        @else
                            <div class="table-img d-flex align-items-center justify-content-center bg-light text-muted" style="font-size:10px;">N/A</div>
                        @endif
                    </td>
                    <td><strong>{{ Str::limit($p->title, 40) }}</strong></td>
                    <td>{{ $p->brand_name ?: '-' }}</td>
                    <td><span class="badge-cat">{{ $p->category->name ?? 'Others' }}</span></td>
                    <td>{{ $p->user->name ?? 'Unknown' }}</td>
                    <td class="price-cell">₹{{ number_format($p->price) }}</td>
                    <td>{{ $p->created_at->format('d M Y') }}</td>
                    <td>
                        <a href="{{ route('admin.products.show', $p->id) }}" class="btn-admin btn-admin-primary btn-admin-sm">View</a>
                        <form action="{{ route('admin.products.destroy', $p->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Are you sure you want to delete this product?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn-admin btn-admin-danger btn-admin-sm ms-1">Delete</button>
                        </form>
                        @if($p->reports_count > 0)
                            <span class="report-badge ms-1">{{ $p->reports_count }}</span>
                        @endif
                    </td>
                </tr>
                @empty
                <tr><td colspan="8" class="text-center py-4 text-muted">No products found</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    <div class="mt-3">
        {{ $products->appends(request()->query())->links() }}
    </div>
</div>
@endsection

@push('scripts')
<script>
function applyFilters() {
    const p = new URLSearchParams();
    const cat = document.getElementById('filter-category').value;
    const s = document.getElementById('filter-search').value;
    const c = document.getElementById('filter-created').value;
    const sort = document.getElementById('filter-sort').value;
    if (cat) p.set('category', cat);
    if (s) p.set('search', s);
    if (c) p.set('created', c);
    if (sort) p.set('sort', sort);
    window.location = @json(route('admin.products.index')) + '?' + p.toString();
}
document.getElementById('filter-category').onchange = applyFilters;
document.getElementById('filter-created').onchange = applyFilters;
document.getElementById('filter-sort').onchange = applyFilters;
document.getElementById('filter-search').onkeyup = e => { if (e.key === 'Enter') applyFilters(); };
document.getElementById('btn-reset').onclick = () => window.location = '{{ route("admin.products.index") }}';
</script>
@endpush
