@extends('layouts.admin')
@section('title', 'Product Details - VITMart Admin')
@section('page-title', 'Product Details')

@section('content')
<div class="breadcrumb-bar mb-3">
    <a href="{{ route('admin.dashboard') }}"><i class="bi bi-house-fill"></i></a>
    <span class="sep">/</span>
    <a href="{{ route('admin.products.index') }}">Products</a>
    <span class="sep">/</span>
    <span>{{ Str::limit($product->title, 40) }}</span>
</div>

<div class="row g-3">
    <div class="col-lg-7">
        <div class="panel-card mb-3">
            <div class="panel-card-header"><div class="panel-card-title">Product Information</div></div>

            @if($product->images->count() > 0)
            <div class="d-flex gap-2 flex-wrap mb-4">
                @foreach($product->images as $img)
                    <img src="{{ asset('storage/'.$img->image_path) }}" style="width:110px; height:110px; object-fit:cover; border-radius:10px; border:1px solid var(--border-color);" onerror="this.src='https://placehold.co/110?text=NA'">
                @endforeach
            </div>
            @else
            <div class="mb-4 text-muted" style="font-size:13px;">No images uploaded</div>
            @endif

            <div class="row g-3">
                <div class="col-md-6"><div class="detail-label">Title</div><div class="detail-value fw-bold">{{ $product->title }}</div></div>
                <div class="col-md-6"><div class="detail-label">Brand</div><div class="detail-value">{{ $product->brand_name ?: 'N/A' }}</div></div>
                <div class="col-md-6"><div class="detail-label">Category</div><div class="detail-value"><span class="badge-cat">{{ $product->category->name ?? 'Others' }}</span></div></div>
                <div class="col-md-6"><div class="detail-label">Price</div><div class="detail-value price-cell" style="font-size:18px;">₹{{ number_format($product->price) }}</div></div>
                <div class="col-md-6"><div class="detail-label">Condition</div><div class="detail-value">{{ ucwords(str_replace('_', ' ', $product->condition)) }}</div></div>
                <div class="col-md-6"><div class="detail-label">Negotiable</div><div class="detail-value">{{ $product->negotiable ? '✅ Yes' : '❌ No' }}</div></div>
                <div class="col-md-6"><div class="detail-label">Status</div><div class="detail-value"><span class="badge-status {{ $product->status }}">{{ ucfirst($product->status) }}</span></div></div>
                <div class="col-md-6"><div class="detail-label">Views</div><div class="detail-value">{{ number_format($product->views) }}</div></div>
                <div class="col-md-6"><div class="detail-label">Created At</div><div class="detail-value">{{ $product->created_at->format('d M Y, h:i A') }}</div></div>
                <div class="col-md-6"><div class="detail-label">Updated At</div><div class="detail-value">{{ $product->updated_at->format('d M Y, h:i A') }}</div></div>
                <div class="col-12"><div class="detail-label">Description</div><div class="detail-value" style="line-height:1.6; white-space:pre-wrap;">{{ $product->description }}</div></div>
            </div>
        </div>
    </div>

    <div class="col-lg-5">
        <div class="panel-card mb-3">
            <div class="panel-card-header"><div class="panel-card-title">Seller Information</div></div>
            <div class="row g-3">
                <div class="col-12"><div class="detail-label">Name</div><div class="detail-value">{{ $product->user->name }}</div></div>
                <div class="col-12"><div class="detail-label">Email</div><div class="detail-value">{{ $product->user->email }}</div></div>
                <div class="col-md-6"><div class="detail-label">Phone</div><div class="detail-value">{{ $product->user->phone ?: 'N/A' }}</div></div>
                <div class="col-md-6"><div class="detail-label">Block</div><div class="detail-value">{{ $product->user->block ?: 'N/A' }}</div></div>
                <div class="col-12"><div class="detail-label">Joined</div><div class="detail-value">{{ $product->user->created_at->format('d M Y') }}</div></div>
            </div>
            <div class="mt-3">
                <a href="{{ route('admin.users.show', $product->user->id) }}" class="btn-admin btn-admin-secondary btn-admin-sm">View Seller Profile</a>
            </div>
        </div>

        <div class="panel-card mb-3">
            <div class="panel-card-header"><div class="panel-card-title">Admin Actions</div></div>
            <div class="d-flex gap-2 flex-wrap">
                @if($product->status === 'available')
                <form method="POST" action="{{ route('admin.products.mark-sold', $product->id) }}">
                    @csrf @method('PATCH')
                    <button type="submit" class="btn-admin btn-admin-secondary"><i class="bi bi-check-circle me-1"></i>Mark Sold</button>
                </form>
                @endif

                @if($product->pending_reports_count > 0)
                <form method="POST" action="{{ route('admin.reports.dismiss-all', $product->id) }}" onsubmit="return confirm('Dismiss all reports?')">
                    @csrf @method('PATCH')
                    <button type="submit" class="btn-admin btn-admin-warning"><i class="bi bi-x-circle me-1"></i>Dismiss Reports</button>
                </form>
                @endif

                <form method="POST" action="{{ route('admin.products.destroy', $product->id) }}" onsubmit="return confirm('Delete this listing permanently?')">
                    @csrf @method('DELETE')
                    <button type="submit" class="btn-admin btn-admin-danger"><i class="bi bi-trash me-1"></i>Delete Listing</button>
                </form>
            </div>
        </div>

        @if($product->reports->count() > 0)
        <div class="panel-card">
            <div class="panel-card-header">
                <div class="panel-card-title">Reports ({{ $product->reports->count() }})</div>
                @if($product->pending_reports_count > 0)
                    <span class="report-badge">{{ $product->pending_reports_count }} pending</span>
                @endif
            </div>
            @foreach($product->reports as $report)
            <div class="p-3 mb-2 rounded" style="background:{{ $report->status=='pending' ? 'rgba(239,68,68,.05)' : 'var(--table-hover)' }}; border:1px solid var(--border-color);">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <strong style="font-size:13px;">{{ $report->reason }}</strong>
                    <span class="badge-status {{ $report->status }}">{{ ucfirst($report->status) }}</span>
                </div>
                @if($report->description)
                <p style="font-size:13px; margin:4px 0; color:var(--text-muted);">{{ $report->description }}</p>
                @endif
                <small style="color:var(--text-muted);">By {{ $report->reporter->name ?? 'Unknown' }} on {{ $report->created_at->format('d M Y') }}</small>
                @if($report->status === 'pending')
                <div class="mt-2">
                    <form method="POST" action="{{ route('admin.reports.dismiss', $report->id) }}" style="display:inline;">
                        @csrf @method('PATCH')
                        <button type="submit" class="btn-admin btn-admin-secondary btn-admin-sm">Dismiss</button>
                    </form>
                </div>
                @endif
            </div>
            @endforeach
        </div>
        @endif
    </div>
</div>
@endsection
