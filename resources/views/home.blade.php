<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>VITMart</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>body{font-family:'Inter','Segoe UI',system-ui,sans-serif;background:#f8fafc;}</style>
</head>
<body>
<div class="container py-5 text-center">
    <h1 class="fw-bold">VITMart</h1>
    <p class="text-muted">The user-facing marketplace now lives in the separate React app. This page only exists as internal routing plumbing for the Admin Panel login flow.</p>
    @auth
        @if(auth()->user()->isAdmin())
            <a href="{{ route('admin.dashboard') }}" class="btn btn-primary">Go to Admin Dashboard</a>
        @endif
        <form method="POST" action="{{ route('logout') }}" class="mt-3">
            @csrf
            <button type="submit" class="btn btn-outline-secondary btn-sm">Sign Out</button>
        </form>
    @endauth
</div>
</body>
</html>
