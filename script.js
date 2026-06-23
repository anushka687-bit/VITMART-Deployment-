// VITMart Main Script - Fetches real products from API
const container = document.getElementById("products");

async function loadProducts(search = '', category = '') {
    container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">Loading products...</p>';

    try {
        let url = '/products?';
        if (search) url += `search=${encodeURIComponent(search)}&`;
        if (category) url += `category=${encodeURIComponent(category)}&`;
        url += 'per_page=50';

        const res = await fetch(url, {
            headers: { 'Accept': 'application/json' }
        });
        const data = await res.json();
        const products = data.data || data || [];

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:40px; color:#777;">No products found. Be the first to <a href="pages/create-listing.html">list an item!</a></p>';
            return;
        }

        products.forEach(product => {
            const imgUrl = product.images && product.images.length > 0
                ? `/storage/${product.images[0].image_path}`
                : 'https://via.placeholder.com/300x180?text=VITMart';

            const isSold = product.status === 'sold';

            container.innerHTML += `
                <div class="product-card ${isSold ? 'sold' : ''}" onclick="window.location.href='pages/product.html?id=${product.id}'">
                    <img src="${imgUrl}" alt="${product.title}" onerror="this.src='https://via.placeholder.com/300x180?text=VITMart'">
                    ${isSold ? '<span class="sold-badge">SOLD</span>' : ''}
                    <h3>${escapeHtml(product.title)}</h3>
                    <p>${escapeHtml(product.category ? product.category.name : 'Others')}</p>
                    <p class="price">₹${Number(product.price).toLocaleString()}</p>
                    <button ${isSold ? 'disabled style="background:#999;"' : ''}>${isSold ? 'Sold' : 'View Details'}</button>
                </div>
            `;
        });
    } catch (err) {
        container.innerHTML = '<p style="text-align:center; padding:40px; color:red;">Failed to load products. Is the server running?</p>';
        console.error('Load products error:', err);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}

// Search handler
const searchInput = document.querySelector('.hero input');
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            loadProducts(e.target.value);
        }
    });
}

// Category filter
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const catName = btn.textContent.trim().replace(/[^\w\s]/g, '').trim();
        // Map display names to slugs or search terms
        const slugMap = {
            'Books': 'Books',
            'Electronics': 'Electronics',
            'Cycles': 'Cycles',
            'Hostel Essentials': 'Hostel+Essentials',
            'Fashion': 'Others',
            'Others': 'Others',
            'Lab Equipment': 'Lab+Equipment',
            'Furniture': 'Furniture',
            'Sports': 'Sports'
        };
        const slug = slugMap[catName] || catName;
        loadProducts('', slug);
    });
});

// Load products on page load
document.addEventListener('DOMContentLoaded', () => loadProducts());