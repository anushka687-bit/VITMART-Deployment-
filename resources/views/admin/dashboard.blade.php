@extends('layouts.admin')
@section('title', 'Dashboard - VITMart Admin')
@section('page-title', 'Dashboard')

@section('content')
<div class="breadcrumb-bar">
    <i class="bi bi-house-fill"></i>
    <span class="sep">/</span>
    <span>Dashboard</span>
</div>

<div style="margin-bottom:6px; font-size:22px; font-weight:700; color:var(--text-main);">Dashboard</div>
<div style="font-size:14px; color:var(--text-muted); margin-bottom:24px;">Welcome back, Admin!</div>

<div class="row g-3 mb-4">
    <div class="col-md-3 col-sm-6">
        <div class="stat-card">
            <div class="stat-icon-wrap green"><i class="bi bi-bag-check" style="color:#16a34a;"></i></div>
            <div>
                <div class="stat-label">Available Products</div>
                <div class="stat-number">{{ $stats['available_products'] }}</div>
                <div class="stat-sub">Active listings</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card">
            <div class="stat-icon-wrap blue"><i class="bi bi-bag-fill" style="color:#2563eb;"></i></div>
            <div>
                <div class="stat-label">Sold Products</div>
                <div class="stat-number">{{ $stats['sold_products'] }}</div>
                <div class="stat-sub">Total sold items</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card">
            <div class="stat-icon-wrap amber"><i class="bi bi-people-fill" style="color:#d97706;"></i></div>
            <div>
                <div class="stat-label">Users</div>
                <div class="stat-number">{{ $stats['users'] }}</div>
                <div class="stat-sub">Registered users</div>
            </div>
        </div>
    </div>
    <div class="col-md-3 col-sm-6">
        <div class="stat-card">
            <div class="stat-icon-wrap red"><i class="bi bi-flag-fill" style="color:#dc2626;"></i></div>
            <div>
                <div class="stat-label">Reported Listings</div>
                <div class="stat-number">{{ $stats['reported_listings'] }}</div>
                <div class="stat-sub">Pending actions</div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mb-4">
    <div class="col-md-7">
        <div class="panel-card">
            <div class="panel-card-header">
                <div class="panel-card-title">Listings Overview</div>
                <span style="font-size:12px; color:var(--text-muted);">Last 30 Days</span>
            </div>
            <div class="chart-container">
                <canvas id="listingsChart"></canvas>
            </div>
        </div>
    </div>
    <div class="col-md-5">
        <div class="panel-card">
            <div class="panel-card-header">
                <div class="panel-card-title">Listings by Category</div>
            </div>
            <div class="chart-container">
                <canvas id="categoryChart"></canvas>
            </div>
        </div>
    </div>
</div>

<div class="row g-3">
    <div class="col-12">
        <div class="panel-card">
            <div class="panel-card-header">
                <div class="panel-card-title">Recent Listings</div>
                <a href="{{ route('admin.products.index') }}" class="btn-admin btn-admin-secondary btn-admin-sm">View All Products</a>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th><th>Title</th><th>Brand</th><th>Category</th><th>Seller</th><th>Price</th><th>Created</th><th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentListings as $p)
                        <tr>
                            <td>
                                @if($p->images->first())
                                    <img src="{{ asset('storage/'.$p->images->first()->image_path) }}" class="table-img" onerror="this.src='https://placehold.co/42?text=NA'">
                                @else
                                    <div class="table-img d-flex align-items-center justify-content-center bg-light text-muted" style="font-size:10px;">N/A</div>
                                @endif
                            </td>
                            <td><strong>{{ $p->title }}</strong></td>
                            <td>{{ $p->brand_name ?: '-' }}</td>
                            <td><span class="badge-cat">{{ $p->category->name ?? 'Others' }}</span></td>
                            <td>{{ $p->user->name ?? 'Unknown' }}</td>
                            <td class="price-cell">₹{{ number_format($p->price) }}</td>
                            <td>{{ $p->created_at->format('d M Y') }}</td>
                            <td><a href="{{ route('admin.products.show', $p->id) }}" class="btn-admin btn-admin-primary btn-admin-sm">View</a></td>
                        </tr>
                        @empty
                        <tr><td colspan="8" class="text-center py-4 text-muted">No listings yet</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @if($recentReports->count() > 0)
    <div class="col-12">
        <div class="panel-card">
            <div class="panel-card-header">
                <div class="panel-card-title">Recent Reports</div>
                <a href="{{ route('admin.reports.index') }}" class="btn-admin btn-admin-secondary btn-admin-sm">View All Reports</a>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr><th>Product</th><th>Reason</th><th>Reporter</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        @foreach($recentReports as $r)
                        <tr class="row-reported">
                            <td><strong>{{ $r->product->title ?? 'Deleted' }}</strong></td>
                            <td><span class="report-badge">{{ $r->reason }}</span></td>
                            <td>{{ $r->reporter->name ?? 'Unknown' }}</td>
                            <td>{{ $r->created_at->format('d M Y') }}</td>
                            <td><span class="badge-status pending">Pending</span></td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endif
</div>
@endsection

@push('scripts')
<script>
const chartLabels = @json($chartLabels);
const chartData   = @json($chartData);
const catLabels   = @json($categories->pluck('name'));
const catCounts   = @json($categories->pluck('products_count'));

const isDark = () => document.body.classList.contains('dark-mode');
const gridColor = () => isDark() ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.06)';
const tickColor = () => isDark() ? '#94a3b8' : '#9ca3af';

const ctx1 = document.getElementById('listingsChart').getContext('2d');
const listChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: chartLabels,
        datasets: [{
            label: 'Listings',
            data: chartData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,.1)',
            fill: true, tension: 0.4, pointRadius: 3,
            pointBackgroundColor: '#6366f1',
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: gridColor() }, ticks: { color: tickColor(), maxTicksLimit: 8, font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: gridColor() }, ticks: { color: tickColor(), font: { size: 11 } } }
        }
    }
});

const ctx2 = document.getElementById('categoryChart').getContext('2d');
const total = catCounts.reduce((sum, value) => sum + value, 0);
const labelsWithPct = catLabels.map((label, i) => {
    const pct = total > 0 ? Math.round((catCounts[i] / total) * 100) : 0;
    return `${label} (${pct}%)`;
});
new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: labelsWithPct,
        datasets: [{ data: catCounts, backgroundColor: ['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#64748b'], borderWidth: 2, borderColor: isDark() ? '#1e293b' : '#fff' }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { font: { size: 11 }, color: tickColor(), boxWidth: 12, padding: 10 } } }
    }
});
</script>
@endpush
