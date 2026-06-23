<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Verify OTP - VITMart</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
    <style>
        body{background:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:'Inter','Segoe UI',system-ui,sans-serif;}
        .auth-card{background:#fff;border-radius:16px;padding:40px;max-width:420px;width:100%;box-shadow:0 4px 24px rgba(0,0,0,.08);border:1px solid #e5e7eb;}
        .brand{text-align:center;margin-bottom:24px;}
        .brand-icon{width:48px;height:48px;background:#6366f1;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:22px;margin-bottom:10px;}
        .brand h1{font-size:22px;font-weight:800;margin:0;}.brand h1 span{color:#6366f1;}
        .form-label{font-weight:600;font-size:14px;}
        .form-control{border-radius:8px;border-color:#e5e7eb;padding:10px 14px;font-size:14px;letter-spacing:6px;text-align:center;font-size:22px;font-weight:700;}
        .form-control:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15);}
        .btn-primary{background:#6366f1;border-color:#6366f1;border-radius:8px;padding:10px;font-weight:600;}
        .btn-primary:hover{background:#4f46e5;border-color:#4f46e5;}
        .alert{border-radius:8px;font-size:13px;}a{color:#6366f1;}
    </style>
</head>
<body>
<div class="auth-card">
    <div class="brand">
        <div class="brand-icon"><i class="bi bi-shield-lock-fill"></i></div>
        <h1>Verify <span>OTP</span></h1>
        <p class="text-muted" style="font-size:13px;">We sent a 6-digit code to<br><strong>{{ $email }}</strong></p>
    </div>

    @if($errors->any())
        <div class="alert alert-danger">{{ $errors->first() }}</div>
    @endif
    @if(session('message'))
        <div class="alert alert-info">{{ session('message') }}</div>
    @endif

    <form method="POST" action="{{ route('verify-otp.submit') }}">
        @csrf
        <input type="hidden" name="email" value="{{ $email }}">
        <div class="mb-4">
            <label class="form-label d-block text-center">Enter OTP</label>
            <input type="text" name="otp" class="form-control @error('otp') is-invalid @enderror"
                maxlength="6" placeholder="000000" required autofocus>
        </div>
        <button type="submit" class="btn btn-primary w-100">Verify & Create Account</button>
    </form>
    <hr class="my-3">
    <p class="text-center mb-0" style="font-size:13px; color:#6b7280;">Didn't receive the code? <a href="{{ route('register') }}">Register again</a></p>
</div>
</body>
</html>
