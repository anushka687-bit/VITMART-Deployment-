// VITMart - Homepage helper (non-SPA, redirects to Blade routes)
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function loadFeaturedProducts() {
    const container = document.getElementById('products');
    if (!container) return;
    try {
        const res = await fetch('/api/products?per_page=12', { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        const products = data.data || [];
        if (!products.length) {
            container.innerHTML = '<p style="text-align:center;padding:40px;color:#777;">No products yet. Be the first to list an item!</p>';
            return;
        }
        container.innerHTML = products.map(p => {
            const img = p.images?.[0] ? `/storage/${p.images[0].image_path}` : 'https://placehold.co/300x180?text=VITMart';
            return `<div class="product-card" onclick="window.location.href='/products/${p.id}'" style="cursor:pointer;">
                <img src="${img}" alt="${escapeHtml(p.title)}" onerror="this.src='https://placehold.co/300x180?text=No+Image'">
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.category?.name || 'Others')}</p>
                <p class="price">₹${Number(p.price).toLocaleString()}</p>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('loadFeaturedProducts:', e);
    }
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
