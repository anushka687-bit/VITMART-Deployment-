<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'VITMart')</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    @stack('styles')
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --body-bg: #f8fafc;
            --card-bg: #ffffff;
            --border-color: #e5e7eb;
            --text-main: #111827;
            --text-muted: #6b7280;
        }
        body { background: var(--body-bg); font-family: 'Inter','Segoe UI',system-ui,sans-serif; color: var(--text-main); }
        .navbar-brand { font-weight: 800; font-size: 20px; color: var(--text-main) !important; }
        .navbar-brand span { color: var(--primary); }
        .brand-icon { width:30px; height:30px; background:var(--primary); border-radius:7px; display:inline-flex; align-items:center; justify-content:center; color:#fff; font-size:14px; margin-right:6px; }
        .navbar { background: #fff; border-bottom: 1px solid var(--border-color); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
        .nav-link { font-size: 14px; font-weight: 500; color: var(--text-muted) !important; }
        .nav-link:hover, .nav-link.active { color: var(--primary) !important; }
        .btn-primary { background: var(--primary); border-color: var(--primary); }
        .btn-primary:hover { background: var(--primary-dark); border-color: var(--primary-dark); }
        .btn-outline-primary { border-color: var(--primary); color: var(--primary); }
        .btn-outline-primary:hover { background: var(--primary); border-color: var(--primary); }
        footer { border-top: 1px solid var(--border-color); margin-top: 60px; padding: 30px 0; color: var(--text-muted); font-size: 13px; }
        .alert { border-radius: 8px; font-size: 14px; }
    </style>
</head>
<body>
<nav class="navbar navbar-expand-lg sticky-top">
    <div class="container">
        <a class="navbar-brand" href="{{ route('home') }}">
            <span class="brand-icon"><i class="bi bi-bag-heart-fill"></i></span>
            <span>VIT</span>Mart
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
            <ul class="navbar-nav me-auto gap-1">
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('home') ? 'active' : '' }}" href="{{ route('home') }}">Home</a></li>
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('browse') ? 'active' : '' }}" href="{{ route('browse') }}">Browse Products</a></li>
                @auth
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('create-listing') ? 'active' : '' }}" href="{{ route('create-listing') }}">Sell Item</a></li>
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('my-listings') ? 'active' : '' }}" href="{{ route('my-listings') }}">My Listings</a></li>
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('saved-items') ? 'active' : '' }}" href="{{ route('saved-items') }}">Saved Items</a></li>
                <li class="nav-item"><a class="nav-link {{ request()->routeIs('messages') ? 'active' : '' }}" href="{{ route('messages') }}">Messages</a></li>
                @endauth
            </ul>
            <ul class="navbar-nav gap-2 align-items-center">
                @auth
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown">
                        <div style="width:30px;height:30px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;">{{ substr(auth()->user()->name,0,1) }}</div>
                        {{ auth()->user()->name }}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                        <li><a class="dropdown-item" href="{{ route('profile') }}"><i class="bi bi-person me-2"></i>Profile</a></li>
                        <li><a class="dropdown-item" href="{{ route('my-listings') }}"><i class="bi bi-box me-2"></i>My Listings</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button class="dropdown-item text-danger" type="submit"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
                            </form>
                        </li>
                    </ul>
                </li>
                @else
                <li class="nav-item"><a class="btn btn-outline-primary btn-sm" href="{{ route('login') }}">Login</a></li>
                <li class="nav-item"><a class="btn btn-primary btn-sm text-white" href="{{ route('register') }}">Register</a></li>
                @endauth
            </ul>
        </div>
    </div>
</nav>

<main>
    <div class="container py-4">
        @if(session('success'))
            <div class="alert alert-success">{{ session('success') }}</div>
        @endif
        @if(session('error'))
            <div class="alert alert-danger">{{ session('error') }}</div>
        @endif
        @yield('content')
    </div>
</main>

<footer class="text-center">
    <div class="container">
        <div>© {{ date('Y') }} VITMart — Campus Marketplace for VIT Students</div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
@stack('scripts')
</body>
</html>
