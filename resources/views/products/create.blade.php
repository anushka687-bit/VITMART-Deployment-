@extends('layouts.app')
@section('title', 'Sell Item - VITMart')

@section('content')
<div class="row justify-content-center">
<div class="col-md-8">
<div class="mb-4"><h4 class="fw-bold mb-0">List an Item for Sale</h4><p class="text-muted" style="font-size:14px;">Fill in the details to post your listing.</p></div>

@if($errors->any())
<div class="alert alert-danger">{{ $errors->first() }}</div>
@endif

<form method="POST" action="{{ route('products.store') }}" enctype="multipart/form-data">
@csrf
<div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:28px;margin-bottom:20px;">
    <h6 class="fw-bold mb-3">Product Details</h6>
    <div class="mb-3">
        <label class="form-label fw-semibold">Title <span class="text-danger">*</span></label>
        <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" placeholder="e.g. HP Pavilion Laptop 2022" required>
    </div>
    <div class="row g-3 mb-3">
        <div class="col-md-6">
            <label class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
            <select name="category_id" class="form-select @error('category_id') is-invalid @enderror" required>
                <option value="">Select category</option>
                @foreach($categories as $cat)
                    <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-md-6">
            <label class="form-label fw-semibold">Brand</label>
            <input type="text" name="brand_name" class="form-control" value="{{ old('brand_name') }}" placeholder="e.g. HP, Samsung">
        </div>
    </div>
    <div class="mb-3">
        <label class="form-label fw-semibold">Description <span class="text-danger">*</span></label>
        <textarea name="description" rows="4" class="form-control @error('description') is-invalid @enderror" placeholder="Describe your item in detail..." required>{{ old('description') }}</textarea>
    </div>
    <div class="row g-3 mb-3">
        <div class="col-md-4">
            <label class="form-label fw-semibold">Price (₹) <span class="text-danger">*</span></label>
            <input type="number" name="price" class="form-control @error('price') is-invalid @enderror" value="{{ old('price') }}" min="0" placeholder="e.g. 5000" required>
        </div>
        <div class="col-md-4">
            <label class="form-label fw-semibold">Condition <span class="text-danger">*</span></label>
            <select name="condition" class="form-select @error('condition') is-invalid @enderror" required>
                <option value="">Select condition</option>
                <option value="new" {{ old('condition')=='new' ? 'selected' : '' }}>New</option>
                <option value="like_new" {{ old('condition')=='like_new' ? 'selected' : '' }}>Like New</option>
                <option value="good" {{ old('condition')=='good' ? 'selected' : '' }}>Good</option>
                <option value="fair" {{ old('condition')=='fair' ? 'selected' : '' }}>Fair</option>
            </select>
        </div>
        <div class="col-md-4 d-flex align-items-end">
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" name="negotiable" id="negotiable" value="1" {{ old('negotiable') ? 'checked' : '' }}>
                <label class="form-check-label fw-semibold" for="negotiable">Price Negotiable</label>
            </div>
        </div>
    </div>
</div>

<div style="background:#fff;border-radius:14px;border:1px solid #e5e7eb;padding:28px;margin-bottom:20px;">
    <h6 class="fw-bold mb-3">Product Images <span class="text-danger">*</span></h6>
    <input type="file" name="images[]" id="images" class="form-control @error('images') is-invalid @enderror" multiple accept="image/*" required>
    <div class="mt-2 text-muted" style="font-size:12px;">Upload 1–6 images. Max 3MB each. JPG, PNG accepted.</div>
    <div id="preview" class="d-flex gap-2 flex-wrap mt-3"></div>
</div>

<button type="submit" class="btn btn-primary px-5 py-2" style="border-radius:10px;font-weight:600;">Post Listing</button>
<a href="{{ route('home') }}" class="btn btn-outline-secondary ms-2 px-4 py-2" style="border-radius:10px;">Cancel</a>
</form>
</div>
</div>
@endsection

@push('scripts')
<script>
document.getElementById('images').addEventListener('change', function() {
    const preview = document.getElementById('preview');
    preview.innerHTML = '';
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #e5e7eb;';
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
});
</script>
@endpush
