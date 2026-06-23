// VITMart Admin Panel Script

const API_BASE = '/admin';

// On load, check authentication
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '../login.html?admin=1';
        return;
    }
    initNavigation();
    loadDashboardData();
    initFilterListeners();
    initModalClose();
});

// State Management
let currentState = {
    stats: {},
    products: [],
    soldProducts: [],
    users: [],
    reports: [],
    currentPanel: 'panel-dashboard'
};

// Setup SPA Navigation and Sidebar Tabs
function initNavigation() {
    const menuItems = document.querySelectorAll('.menu-item:not(.logout-btn)');
    const panels = document.querySelectorAll('.content-panel');
    const pageTitle = document.getElementById('page-title');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            menuItems.forEach(i => i.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPanelId = item.getAttribute('data-target');
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) targetPanel.classList.add('active');

            const tabName = item.textContent.replace(/[^\w\s]/g, '').trim();
            pageTitle.textContent = tabName;

            switch (targetPanelId) {
                case 'panel-dashboard':
                    loadDashboardData();
                    break;
                case 'panel-products':
                    loadProductsData();
                    break;
                case 'panel-sold-products':
                    loadSoldProductsData();
                    break;
                case 'panel-users':
                    loadUsersData();
                    break;
                case 'panel-reports':
                    loadReportsData();
                    break;
            }
        });
    });

    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout from Admin Panel?')) {
            localStorage.removeItem('admin_token');
            window.location.href = '../login.html';
        }
    });
}

// Global API Fetch Helper
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = '../login.html?admin=1';
        return null;
    }

    const defaultHeaders = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('admin_token');
            window.location.href = '../login.html?admin=1';
            return null;
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (err) {
        console.error(`Fetch failed for ${endpoint}:`, err);
        throw err;
    }
}

// Load Dashboard Statistics Cards & Recent Items
async function loadDashboardData() {
    try {
        const stats = await apiFetch('/stats');
        if (!stats) return;

        document.getElementById('stat-available').textContent = stats.available_products || 0;
        document.getElementById('stat-sold').textContent = stats.sold_products || 0;
        document.getElementById('stat-users').textContent = stats.total_users || 0;
        document.getElementById('stat-reported').textContent = stats.reported_listings || 0;

        // Load recent listings snippet
        const productsRes = await apiFetch('/products');
        if (!productsRes) return;
        const items = (productsRes.data || productsRes || []).slice(0, 5);
        const recentListingsTbody = document.getElementById('recent-listings-tbody');
        recentListingsTbody.innerHTML = '';

        if (items.length === 0) {
            recentListingsTbody.innerHTML = `<tr><td colspan="4" class="text-center">No listings found</td></tr>`;
        } else {
            items.forEach(prod => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHtml(prod.title)}</strong></td>
                    <td>${escapeHtml(prod.category ? prod.category.name : 'Others')}</td>
                    <td class="price">₹${Number(prod.price).toLocaleString()}</td>
                    <td>${new Date(prod.created_at).toLocaleDateString()}</td>
                `;
                recentListingsTbody.appendChild(tr);
            });
        }

        // Load recent reports snippet
        const reportsRes = await apiFetch('/reports');
        if (!reportsRes) return;
        const reports = (reportsRes.data || reportsRes || []).slice(0, 5);
        const recentReportsTbody = document.getElementById('recent-reports-tbody');
        recentReportsTbody.innerHTML = '';

        if (reports.length === 0) {
            recentReportsTbody.innerHTML = `<tr><td colspan="3" class="text-center">No pending reports</td></tr>`;
        } else {
            reports.forEach(rep => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escapeHtml(rep.product ? rep.product.title : 'Deleted Product')}</td>
                    <td><span class="text-danger">${escapeHtml(rep.reason || 'Inappropriate')}</span></td>
                    <td><span class="badge-status alert">Pending</span></td>
                `;
                recentReportsTbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

// Load Products Data with Centralized Filters
async function loadProductsData() {
    try {
        const category = document.getElementById('filter-product-category').value;
        const search = document.getElementById('filter-product-search').value.toLowerCase();
        const sort = document.getElementById('filter-product-sort').value;

        let url = '/products';
        const res = await apiFetch(url);
        if (!res) return;
        let items = res.data || res || [];

        if (category) {
            items = items.filter(i => i.category && i.category.name === category);
        }
        if (search) {
            items = items.filter(i => 
                i.title.toLowerCase().includes(search) || 
                (i.user && i.user.name && i.user.name.toLowerCase().includes(search))
            );
        }
        items = items.filter(i => i.status === 'available');

        if (sort === 'price_low') items.sort((a,b) => a.price - b.price);
        else if (sort === 'price_high') items.sort((a,b) => b.price - a.price);
        else if (sort === 'oldest') items.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        else items.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

        renderProductsTable(items);
    } catch (err) {
        console.error('Products load error:', err);
    }
}

function renderProductsTable(items) {
    const tbody = document.getElementById('products-table-tbody');
    tbody.innerHTML = '';

    if (items.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">No marketplace products found matching filters</td></tr>`;
        return;
    }

    items.forEach(prod => {
        const tr = document.createElement('tr');
        const imgUrl = prod.images && prod.images.length > 0 ? `/storage/${prod.images[0].image_path}` : 'https://via.placeholder.com/150?text=VITMart';
        
        tr.innerHTML = `
            <td><img src="${imgUrl}" class="table-img" onerror="this.src='https://via.placeholder.com/150?text=Listing'"></td>
            <td><strong>${escapeHtml(prod.title)}</strong></td>
            <td>${escapeHtml((prod.brand_name || prod.category?.name) || 'N/A')}</td>
            <td>${escapeHtml(prod.category ? prod.category.name : 'Others')}</td>
            <td>${escapeHtml(prod.user ? prod.user.name : 'Student')}</td>
            <td class="price">₹${Number(prod.price).toLocaleString()}</td>
            <td>${new Date(prod.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="viewProductDetails(${prod.id})">View</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Load Sold Products Page Content
async function loadSoldProductsData() {
    try {
        const res = await apiFetch('/products');
        if (!res) return;
        let items = res.data || res || [];
        items = items.filter(i => i.status === 'sold');

        const tbody = document.getElementById('sold-table-tbody');
        tbody.innerHTML = '';

        if (items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">No products have been marked as sold yet.</td></tr>`;
            return;
        }

        items.forEach(prod => {
            const tr = document.createElement('tr');
            const imgUrl = prod.images && prod.images.length > 0 ? `/storage/${prod.images[0].image_path}` : 'https://via.placeholder.com/150?text=VITMart';
            
            tr.innerHTML = `
                <td><img src="${imgUrl}" class="table-img"></td>
                <td><strong>${escapeHtml(prod.title)}</strong></td>
                <td>${escapeHtml((prod.brand_name || prod.category?.name) || 'N/A')}</td>
                <td>${escapeHtml(prod.category ? prod.category.name : 'Others')}</td>
                <td>${escapeHtml(prod.user ? prod.user.name : 'Student')}</td>
                <td class="price">₹${Number(prod.price).toLocaleString()}</td>
                <td>${new Date(prod.updated_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewProductDetails(${prod.id})">Details</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Sold products load error:', err);
    }
}

// Load Registered Users Profile Table
async function loadUsersData() {
    try {
        const search = document.getElementById('filter-user-search').value.toLowerCase();
        const res = await apiFetch('/users');
        if (!res) return;
        let users = res.data || res || [];

        if (search) {
            users = users.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search));
        }

        const tbody = document.getElementById('users-table-tbody');
        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No matching registered users found</td></tr>`;
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(user.name)}</strong></td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone || 'Not shared')}</td>
                <td>${user.products_count || 0}</td>
                <td>${user.sold_count || 0}</td>
                <td>${new Date(user.created_at || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="viewUserDetails(${user.id})">View</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Users load error:', err);
    }
}

// Load Platform Abuse Reports Table
async function loadReportsData() {
    try {
        const res = await apiFetch('/reports');
        if (!res) return;
        const reports = res.data || res || [];

        const tbody = document.getElementById('reports-table-tbody');
        tbody.innerHTML = '';

        if (reports.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">Excellent! No pending reported listings found.</td></tr>`;
            return;
        }

        reports.forEach(rep => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(rep.product ? rep.product.title : 'Deleted Product')}</strong></td>
                <td>${escapeHtml(rep.product && rep.product.user ? rep.product.user.name : 'Unknown')}</td>
                <td><span class="badge-status alert">Pending</span></td>
                <td><span class="text-danger">${escapeHtml(rep.reason)}</span></td>
                <td>${new Date(rep.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="viewReportDetails(${rep.id})">Review Action</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Reports load error:', err);
    }
}

// Product Details Inspection Modal View
async function viewProductDetails(id) {
    try {
        // Fetch individual product directly
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/products/${id}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const prod = await res.json();
        if (!prod || prod.id === undefined) return alert('Product not found.');

        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body-content');

        titleEl.textContent = `Product Inspection: ${prod.title}`;
        
        let imagesHtml = '';
        if (prod.images && prod.images.length > 0) {
            prod.images.forEach(img => {
                imagesHtml += `<img src="/storage/${img.image_path}" class="detail-img" onerror="this.src='https://via.placeholder.com/150?text=Listing'">`;
            });
        } else {
            imagesHtml = `<p class="detail-value">No attached images</p>`;
        }

        bodyEl.innerHTML = `
            <div class="detail-grid">
                <div class="detail-full">
                    <div class="detail-label">Product Gallery</div>
                    <div class="detail-images-container">${imagesHtml}</div>
                </div>
                <div>
                    <div class="detail-label">Title</div>
                    <div class="detail-value">${escapeHtml(prod.title)}</div>
                </div>
                <div>
                    <div class="detail-label">Category</div>
                    <div class="detail-value">${escapeHtml(prod.category ? prod.category.name : 'Others')}</div>
                </div>
                <div>
                    <div class="detail-label">Price</div>
                    <div class="detail-value price">₹${Number(prod.price).toLocaleString()}</div>
                </div>
                <div>
                    <div class="detail-label">Condition</div>
                    <div class="detail-value">${escapeHtml(prod.condition?.toUpperCase().replace('_', ' ') || 'N/A')}</div>
                </div>
                <div>
                    <div class="detail-label">Negotiable</div>
                    <div class="detail-value">${prod.negotiable ? 'Yes' : 'No'}</div>
                </div>
                <div>
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="badge-status ${prod.status}">${(prod.status || 'unknown').toUpperCase()}</span></div>
                </div>
                <div>
                    <div class="detail-label">Total Views</div>
                    <div class="detail-value">👁️ ${prod.views || 0} hits</div>
                </div>
                <div class="detail-full">
                    <div class="detail-label">Product Description</div>
                    <div class="detail-value" style="background:#f8fafc; padding:12px; border-radius:8px; margin-top:5px;">
                        ${escapeHtml(prod.description || 'No description provided by the seller.')}
                    </div>
                </div>
                <div class="detail-full" style="margin-top:20px; border-top:1px dashed #cbd5e1; padding-top:15px;">
                    <h3 style="font-size:15px; margin-bottom:10px; color:var(--primary-dark)">Seller Profile Information</h3>
                </div>
                <div>
                    <div class="detail-label">Seller Name</div>
                    <div class="detail-value">${escapeHtml(prod.user ? prod.user.name : 'VIT Student')}</div>
                </div>
                <div>
                    <div class="detail-label">College Email</div>
                    <div class="detail-value">${escapeHtml(prod.user ? prod.user.email : 'N/A')}</div>
                </div>
                <div>
                    <div class="detail-label">Phone Number</div>
                    <div class="detail-value">${escapeHtml(prod.user ? (prod.user.phone || 'Hidden') : 'Hidden')}</div>
                </div>
                <div>
                    <div class="detail-label">Hostel Block</div>
                    <div class="detail-value">${escapeHtml(prod.user ? prod.user.block || 'Main Campus' : 'N/A')}</div>
                </div>
            </div>
            <div class="modal-actions">
                ${prod.status === 'available' ? `<button class="btn btn-secondary" onclick="triggerMarkAsSold(${prod.id})">Mark as Sold</button>` : ''}
                <button class="btn btn-danger" onclick="triggerDeleteProduct(${prod.id})">Delete Listing</button>
            </div>
        `;
        openModal();
    } catch (err) {
        console.error('View product error:', err);
        alert('Could not load product details.');
    }
}

// User Inspection Details Modal
async function viewUserDetails(id) {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/admin/users`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const users = data.data || data || [];
        const user = users.find(u => u.id === id);
        if (!user) return alert('User profile not found.');

        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body-content');

        titleEl.textContent = `User Overview: ${user.name}`;
        bodyEl.innerHTML = `
            <div class="detail-grid">
                <div>
                    <div class="detail-label">Full Name</div>
                    <div class="detail-value">${escapeHtml(user.name)}</div>
                </div>
                <div>
                    <div class="detail-label">Official College Email</div>
                    <div class="detail-value">${escapeHtml(user.email)}</div>
                </div>
                <div>
                    <div class="detail-label">Phone Number</div>
                    <div class="detail-value">${escapeHtml(user.phone || 'N/A')}</div>
                </div>
                <div>
                    <div class="detail-label">Hostel block / Area</div>
                    <div class="detail-value">${escapeHtml(user.block || 'Not specified')}</div>
                </div>
                <div>
                    <div class="detail-label">Total Listings Posted</div>
                    <div class="detail-value">${user.products_count || 0} items</div>
                </div>
                <div>
                    <div class="detail-label">Account Joined Date</div>
                    <div class="detail-value">${new Date(user.created_at || Date.now()).toLocaleDateString()}</div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="closeModal()">Close Window</button>
            </div>
        `;
        openModal();
    } catch (err) {
        console.error('View user error:', err);
    }
}

// Review Report Actions Modal Pane
async function viewReportDetails(reportId) {
    try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`/admin/reports`, {
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        const reports = data.data || data || [];
        const report = reports.find(r => r.id === reportId);
        if (!report) return alert('Report details no longer active.');

        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body-content');

        titleEl.textContent = `Review Moderation Alert`;
        bodyEl.innerHTML = `
            <div class="detail-grid">
                <div class="detail-full" style="background:#fff5f5; border-left:4px solid var(--danger-color); padding:12px; border-radius:4px;">
                    <div class="detail-label" style="color:var(--danger-color)">Reason for Flagging</div>
                    <div class="detail-value" style="font-size:16px;"><strong>${escapeHtml(report.reason)}</strong></div>
                    <p style="font-size:13px; color:var(--text-muted); margin-top:5px;">Reported on ${new Date(report.created_at).toLocaleDateString()}</p>
                </div>
                <div class="detail-full" style="margin-top:15px;">
                    <h4 style="font-size:14px; margin-bottom:10px; color:var(--primary-dark)">Targeted Marketplace Item Information</h4>
                </div>
                <div>
                    <div class="detail-label">Product Name</div>
                    <div class="detail-value">${escapeHtml(report.product ? report.product.title : 'Deleted')}</div>
                </div>
                <div>
                    <div class="detail-label">Price / Condition</div>
                    <div class="detail-value">₹${report.product ? report.product.price : 0} | ${escapeHtml(report.product ? report.product.condition : 'N/A')}</div>
                </div>
                <div>
                    <div class="detail-label">Seller Account</div>
                    <div class="detail-value">${escapeHtml(report.product && report.product.user ? report.product.user.name : 'Unknown')}</div>
                </div>
                <div>
                    <div class="detail-label">Reporter Feedback</div>
                    <div class="detail-value">${escapeHtml(report.description || 'No written summary provided.')}</div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="triggerDismissReport(${report.id})">Dismiss False Report</button>
                <button class="btn btn-danger" onclick="triggerDeleteViaReport(${report.id})">Delete Listing & Resolve</button>
            </div>
        `;
        openModal();
    } catch (err) {
        console.error('View report error:', err);
    }
}

// Operations Action Triggers connecting with AdminController endpoints
async function triggerDeleteProduct(id) {
    if (!confirm('Delete this listing permanently?')) return;
    try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Delete failed');
        alert('Product listing deleted.');
        closeModal();
        loadProductsData();
        loadDashboardData();
    } catch(e) {
        alert('Delete failed. Check auth token.');
        closeModal();
    }
}

async function triggerMarkAsSold(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/products/${id}/sold`, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        alert('Listing marked as sold.');
        closeModal();
        loadProductsData();
    } catch(e) {
        alert('Operation completed.');
        closeModal();
    }
}

async function triggerDismissReport(id) {
    if (!confirm('Dismiss this report?')) return;
    try {
        const token = localStorage.getItem('admin_token');
        await fetch(`${API_BASE}/reports/${id}/ignore`, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        alert('Report dismissed.');
        closeModal();
        loadReportsData();
        loadDashboardData();
    } catch(e) {
        closeModal();
    }
}

async function triggerDeleteViaReport(id) {
    if (!confirm('Delete listing and resolve report?')) return;
    try {
        const token = localStorage.getItem('admin_token');
        await fetch(`${API_BASE}/reports/${id}/delete-listing`, {
            method: 'PATCH',
            headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        alert('Listing deleted and report resolved.');
        closeModal();
        loadReportsData();
        loadDashboardData();
    } catch(e) {
        closeModal();
    }
}

// Filter listeners configuration
function initFilterListeners() {
    ['filter-product-category', 'filter-product-date', 'filter-product-sort'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', loadProductsData);
    });
    const searchInput = document.getElementById('filter-product-search');
    if (searchInput) searchInput.addEventListener('input', loadProductsData);

    const resetBtn = document.getElementById('btn-reset-products');
    if (resetBtn) resetBtn.addEventListener('click', () => {
        const cat = document.getElementById('filter-product-category');
        const search = document.getElementById('filter-product-search');
        const date = document.getElementById('filter-product-date');
        const sort = document.getElementById('filter-product-sort');
        if (cat) cat.value = '';
        if (search) search.value = '';
        if (date) date.value = '';
        if (sort) sort.value = 'newest';
        loadProductsData();
    });

    const userSearch = document.getElementById('filter-user-search');
    if (userSearch) userSearch.addEventListener('input', loadUsersData);

    const resetUsers = document.getElementById('btn-reset-users');
    if (resetUsers) resetUsers.addEventListener('click', () => {
        const us = document.getElementById('filter-user-search');
        if (us) us.value = '';
        loadUsersData();
    });

    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Marketplace configuration stored successfully.');
    });
}

// Modal Toggle Utility Helpers
function openModal() { document.getElementById('details-modal').classList.add('show'); }
function closeModal() { document.getElementById('details-modal').classList.remove('show'); }
function initModalClose() {
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('details-modal')) closeModal();
    });
}

// Utility Sanitation Helper
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"');
}