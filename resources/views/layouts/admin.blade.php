<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Admin - VITMart')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    @stack('styles')
    <style>
        :root {
            --sidebar-width: 240px;
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --sidebar-bg: #ffffff;
            --sidebar-border: #e5e7eb;
            --body-bg: #f8fafc;
            --card-bg: #ffffff;
            --card-shadow: 0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.05);
            --text-main: #111827;
            --text-muted: #6b7280;
            --border-color: #e5e7eb;
            --table-hover: #f9fafb;
        }
        body.dark-mode {
            --body-bg: #0f172a;
            --card-bg: #1e293b;
            --sidebar-bg: #1e293b;
            --sidebar-border: #334155;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --border-color: #334155;
            --table-hover: #263347;
        }
        * { box-sizing: border-box; }
        body { background: var(--body-bg); font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; color: var(--text-main); margin: 0; }

        /* Sidebar */
        .sidebar {
            width: var(--sidebar-width);
            background: var(--sidebar-bg);
            border-right: 1px solid var(--sidebar-border);
            position: fixed; top: 0; left: 0; bottom: 0;
            overflow-y: auto; z-index: 1040;
            transition: transform 0.3s;
        }
        .sidebar-brand {
            padding: 20px 20px 16px;
            display: flex; align-items: center; gap: 10px;
            border-bottom: 1px solid var(--sidebar-border);
        }
        .brand-icon {
            width: 36px; height: 36px;
            background: var(--primary);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            color: #fff; font-size: 18px;
        }
        .brand-text { font-size: 18px; font-weight: 700; color: var(--text-main); }
        .brand-text span { color: var(--primary); }
        .brand-sub { font-size: 11px; color: var(--text-muted); }

        .sidebar-section { padding: 16px 12px 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: var(--text-muted); }
        .sidebar-nav { padding: 4px 8px; list-style: none; margin: 0; }
        .sidebar-nav a, .sidebar-nav .nav-btn {
            display: flex; align-items: center; gap: 10px;
            padding: 9px 12px; border-radius: 8px;
            color: var(--text-muted); text-decoration: none;
            font-size: 14px; font-weight: 500;
            transition: all 0.15s;
            background: none; border: none; width: 100%; cursor: pointer;
            font-family: inherit;
        }
        .sidebar-nav a:hover, .sidebar-nav .nav-btn:hover { background: #f3f4f6; color: var(--text-main); }
        .sidebar-nav a.active { background: #ede9fe; color: var(--primary); font-weight: 600; }
        body.dark-mode .sidebar-nav a:hover, body.dark-mode .sidebar-nav .nav-btn:hover { background: #334155; }
        body.dark-mode .sidebar-nav a.active { background: rgba(99,102,241,.15); color: #a5b4fc; }
        .sidebar-nav i { font-size: 17px; width: 20px; text-align: center; }
        .nav-badge { margin-left: auto; background: #ef4444; color: #fff; font-size: 11px; padding: 1px 7px; border-radius: 20px; }

        /* Main */
        .main-content { margin-left: var(--sidebar-width); min-height: 100vh; }
        .top-header {
            background: var(--card-bg);
            border-bottom: 1px solid var(--border-color);
            padding: 0 24px;
            height: 60px;
            display: flex; justify-content: space-between; align-items: center;
            position: sticky; top: 0; z-index: 1030;
        }
        .header-left { display: flex; align-items: center; gap: 12px; }
        .page-title-header { font-size: 16px; font-weight: 600; color: var(--text-main); }
        .header-actions { display: flex; align-items: center; gap: 8px; }
        .icon-btn {
            width: 36px; height: 36px; border-radius: 8px;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--text-muted); font-size: 16px;
            transition: all 0.15s;
        }
        .icon-btn:hover { background: #f3f4f6; color: var(--text-main); }
        body.dark-mode .icon-btn:hover { background: #334155; }
        .admin-pill {
            display: flex; align-items: center; gap: 8px;
            padding: 4px 12px 4px 4px;
            border: 1px solid var(--border-color);
            border-radius: 20px; cursor: pointer; background: var(--card-bg);
        }
        .admin-avatar {
            width: 28px; height: 28px; border-radius: 50%;
            background: var(--primary); color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 700;
        }
        .admin-pill-name { font-size: 13px; font-weight: 600; color: var(--text-main); }
        .dark-switch {
            display: flex; align-items: center; gap: 6px;
            font-size: 12px; color: var(--text-muted);
            border: 1px solid var(--border-color);
            border-radius: 20px; padding: 4px 10px;
            cursor: pointer; background: var(--card-bg);
        }
        .toggle-dot {
            width: 28px; height: 16px; background: #d1d5db;
            border-radius: 8px; position: relative; transition: 0.2s;
        }
        .toggle-dot::after {
            content: ''; width: 12px; height: 12px;
            background: #fff; border-radius: 50%;
            position: absolute; top: 2px; left: 2px; transition: 0.2s;
        }
        body.dark-mode .toggle-dot { background: var(--primary); }
        body.dark-mode .toggle-dot::after { left: 14px; }

        /* Content */
        .content-body { padding: 24px; }

        /* Stat Cards */
        .stat-card {
            background: var(--card-bg);
            border-radius: 12px; padding: 20px;
            box-shadow: var(--card-shadow);
            display: flex; align-items: center; gap: 16px;
            border: 1px solid var(--border-color);
        }
        .stat-icon-wrap {
            width: 56px; height: 56px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px; flex-shrink: 0;
        }
        .stat-icon-wrap.green { background: #dcfce7; }
        .stat-icon-wrap.blue  { background: #dbeafe; }
        .stat-icon-wrap.amber { background: #fef3c7; }
        .stat-icon-wrap.red   { background: #fee2e2; }
        .stat-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; font-weight: 500; }
        .stat-number { font-size: 30px; font-weight: 700; color: var(--text-main); line-height: 1; }
        .stat-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

        /* Cards */
        .panel-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px; padding: 20px;
            box-shadow: var(--card-shadow);
            margin-bottom: 20px;
        }
        .panel-card-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 16px;
        }
        .panel-card-title { font-size: 15px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 8px; }
        .panel-card-title::before { content: ''; display: inline-block; width: 3px; height: 18px; background: var(--primary); border-radius: 2px; }

        /* Tables */
        .admin-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
        .admin-table th {
            text-align: left; padding: 10px 14px;
            font-size: 11px; font-weight: 700; color: var(--text-muted);
            text-transform: uppercase; letter-spacing: .05em;
            border-bottom: 2px solid var(--border-color);
            background: var(--card-bg);
        }
        .admin-table td {
            padding: 11px 14px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-main);
            vertical-align: middle;
        }
        .admin-table tbody tr:hover { background: var(--table-hover); }
        .admin-table tbody tr:last-child td { border-bottom: none; }
        .table-img { width: 42px; height: 42px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); }
        .price-cell { font-weight: 700; color: var(--primary); }

        /* Badges */
        .badge-cat {
            display: inline-block; padding: 3px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 600;
            background: #ede9fe; color: #6366f1;
        }
        .badge-status {
            display: inline-block; padding: 3px 10px; border-radius: 20px;
            font-size: 11px; font-weight: 600;
        }
        .badge-status.available { background: #dcfce7; color: #15803d; }
        .badge-status.sold { background: #fee2e2; color: #b91c1c; }
        .badge-status.pending { background: #fef3c7; color: #b45309; }
        .badge-status.ignored { background: #f1f5f9; color: #64748b; }
        .badge-status.resolved { background: #dcfce7; color: #15803d; }
        .report-badge { background: #ef4444; color: #fff; padding: 2px 7px; border-radius: 12px; font-size: 11px; font-weight: 700; }

        /* Buttons */
        .btn-admin { padding: 6px 14px; border: none; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; transition: all 0.15s; }
        .btn-admin-primary { background: var(--primary); color: #fff; }
        .btn-admin-primary:hover { background: var(--primary-dark); color: #fff; }
        .btn-admin-secondary { background: var(--card-bg); color: var(--text-muted); border: 1px solid var(--border-color); }
        .btn-admin-secondary:hover { background: var(--table-hover); }
        .btn-admin-danger { background: #ef4444; color: #fff; }
        .btn-admin-danger:hover { background: #dc2626; color: #fff; }
        .btn-admin-warning { background: #f59e0b; color: #fff; }
        .btn-admin-sm { padding: 4px 10px; font-size: 12px; border-radius: 6px; }

        /* Filter bar */
        .filter-bar { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
        .filter-bar select, .filter-bar input {
            padding: 7px 12px; border: 1px solid var(--border-color); border-radius: 8px;
            font-size: 13px; background: var(--card-bg); color: var(--text-main);
        }
        .filter-bar input[type="text"] { flex: 1; min-width: 200px; }

        /* Charts */
        .chart-container { position: relative; height: 250px; }

        /* Settings */
        .settings-form .form-group { margin-bottom: 20px; }
        .settings-form label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 14px; color: var(--text-main); }
        .settings-form input[type="text"],
        .settings-form input[type="email"],
        .settings-form input[type="file"] {
            width: 100%; padding: 10px 14px;
            border: 1px solid var(--border-color); border-radius: 8px;
            font-size: 14px; background: var(--card-bg); color: var(--text-main);
        }
        .settings-form input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

        /* Reported highlight */
        .row-reported { background: #fef2f2 !important; }
        body.dark-mode .row-reported { background: rgba(239,68,68,.08) !important; }

        /* Detail grid */
        .detail-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--text-muted); margin-bottom: 3px; }
        .detail-value { font-size: 14px; color: var(--text-main); }

        /* Alert */
        .alert-success { background: #dcfce7; border: 1px solid #86efac; color: #15803d; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }
        .alert-error { background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }

        /* Breadcrumb */
        .breadcrumb-bar { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-muted); margin-bottom: 20px; }
        .breadcrumb-bar a { color: var(--text-muted); text-decoration: none; }
        .breadcrumb-bar a:hover { color: var(--primary); }
        .breadcrumb-bar .sep { color: var(--border-color); }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            .sidebar.open { transform: translateX(0); box-shadow: 4px 0 20px rgba(0,0,0,.15); }
            .main-content { margin-left: 0; }
            .stat-card { padding: 14px; }
        }
    </style>
</head>
<body>
<aside class="sidebar" id="sidebar">
    <div class="sidebar-brand">
        <div class="brand-icon"><i class="bi bi-bag-heart-fill"></i></div>
        <div>
            <div class="brand-text"><span>VIT</span>Mart</div>
            <div class="brand-sub">Admin Panel</div>
        </div>
    </div>

    <div class="sidebar-section">Main Menu</div>
    <ul class="sidebar-nav">
        <li>
            <a href="{{ route('admin.dashboard') }}" class="{{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">
                <i class="bi bi-speedometer2"></i> Dashboard
            </a>
        </li>
        <li>
            <a href="{{ route('admin.products.index') }}" class="{{ request()->routeIs('admin.products.index') ? 'active' : '' }}">
                <i class="bi bi-box-seam"></i> Products
            </a>
        </li>
        <li>
            <a href="{{ route('admin.products.sold') }}" class="{{ request()->routeIs('admin.products.sold') ? 'active' : '' }}">
                <i class="bi bi-check2-circle"></i> Sold Products
            </a>
        </li>
        <li>
            <a href="{{ route('admin.users.index') }}" class="{{ request()->routeIs('admin.users.*') ? 'active' : '' }}">
                <i class="bi bi-people"></i> Users
            </a>
        </li>
        <li>
            <a href="{{ route('admin.reports.index') }}" class="{{ request()->routeIs('admin.reports.*') ? 'active' : '' }}">
                <i class="bi bi-flag"></i> Reports
            </a>
        </li>
    </ul>

    <div class="sidebar-section">System</div>
    <ul class="sidebar-nav">
        <li>
            <a href="{{ route('admin.settings') }}" class="{{ request()->routeIs('admin.settings') ? 'active' : '' }}">
                <i class="bi bi-gear"></i> Settings
            </a>
        </li>
        <li>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="nav-btn">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </button>
            </form>
        </li>
    </ul>
</aside>

<div class="main-content">
    <header class="top-header">
        <div class="header-left">
            <button class="icon-btn d-md-none" id="sidebar-toggle"><i class="bi bi-list"></i></button>
            <span class="page-title-header">@yield('page-title', 'Dashboard')</span>
        </div>
        <div class="header-actions">
            <button class="icon-btn" title="Search" onclick="document.querySelector('.filter-bar input')?.focus()"><i class="bi bi-search"></i></button>
            <div class="dark-switch" id="dark-toggle" title="Toggle theme">
                <span id="dark-label">Light</span>
                <div class="toggle-dot" id="toggle-dot"></div>
                <span id="dark-label2">Dark</span>
            </div>
            <div class="dropdown">
                <div class="admin-pill dropdown-toggle" data-bs-toggle="dropdown">
                    <div class="admin-avatar">{{ substr(auth()->user()->name ?? 'A', 0, 1) }}</div>
                    <span class="admin-pill-name">Admin</span>
                </div>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><span class="dropdown-item-text small text-muted">{{ auth()->user()->email }}</span></li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button class="dropdown-item text-danger" type="submit"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </header>

    <div class="content-body">
        @if(session('success'))
            <div class="alert-success">{{ session('success') }}</div>
        @endif
        @if(session('error'))
            <div class="alert-error">{{ session('error') }}</div>
        @endif
        @yield('content')
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
@stack('scripts')
<script>
    // Dark mode
    const darkToggle = document.getElementById('dark-toggle');
    if (localStorage.getItem('vitmart_dark') === '1') {
        document.body.classList.add('dark-mode');
    }
    darkToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('vitmart_dark', document.body.classList.contains('dark-mode') ? '1' : '0');
    });
    // Sidebar mobile
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => sidebar.classList.toggle('open'));
</script>
</body>
</html>
