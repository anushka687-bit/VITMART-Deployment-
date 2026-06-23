<?php

namespace App\Http\Controllers;

use App\Models\{OtpVerification, User};
use App\Mail\OtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Mail, Validator};
use Carbon\Carbon;

class AuthController extends Controller
{
    // ── Session-based Auth (Blade forms) ──────────────────────

    public function loginSubmit(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);
        if ($v->fails()) return back()->withErrors($v)->withInput();

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors(['email' => 'Invalid credentials.'])->withInput();
        }
        if (!$user->email_verified_at) {
            return back()->withErrors(['email' => 'Email not verified.'])->withInput();
        }

        auth()->login($user, $request->boolean('remember'));

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->intended(route('home'));
    }

    public function registerSubmit(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email|ends_with:@vitstudent.ac.in,@vit.ac.in',
            'password' => 'required|min:8|confirmed',
            'phone'    => 'nullable|string|max:15',
            'block'    => 'nullable|string|max:100',
        ]);
        if ($v->fails()) return back()->withErrors($v)->withInput();

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        OtpVerification::updateOrCreate(
            ['email' => $request->email],
            ['otp' => $otp, 'expires_at' => Carbon::now()->addMinutes(10)]
        );
        cache()->put('pending_user_' . $request->email, $request->only('name', 'email', 'password', 'phone', 'block'), now()->addMinutes(15));

        try {
            Mail::to($request->email)->send(new OtpMail($otp));
        } catch (\Exception $e) {
            // Log error but continue (mail may fail in dev)
            \Log::error('OTP mail failed: ' . $e->getMessage());
        }

        return redirect()->route('verify-otp', ['email' => $request->email])
            ->with('message', 'OTP sent to your college email.');
    }

    public function showVerifyOtp(Request $request)
    {
        $email = $request->query('email');
        if (!$email) return redirect()->route('register');
        return view('auth.verify-otp', compact('email'));
    }

    public function verifyOtpSubmit(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);
        if ($v->fails()) return back()->withErrors($v)->withInput();

        $record = OtpVerification::where('email', $request->email)->where('otp', $request->otp)->first();
        if (!$record) return back()->withErrors(['otp' => 'Invalid OTP.'])->withInput();
        if ($record->isExpired()) return back()->withErrors(['otp' => 'OTP expired.'])->withInput();

        $pending = cache()->get('pending_user_' . $request->email);
        if (!$pending) return back()->withErrors(['otp' => 'Registration data expired. Please register again.'])->withInput();

        $user = User::create([
            'name'              => $pending['name'],
            'email'             => $pending['email'],
            'password'          => Hash::make($pending['password']),
            'phone'             => $pending['phone'] ?? null,
            'block'             => $pending['block'] ?? null,
            'email_verified_at' => now(),
        ]);

        $record->delete();
        cache()->forget('pending_user_' . $request->email);
        auth()->login($user);

        return redirect()->route('home')->with('success', 'Account created successfully!');
    }

    public function logoutSession(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }

    // ── JSON API Auth ──────────────────────────────────────────

    public function register(Request $request)
    {
        $v = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email|ends_with:@vitstudent.ac.in,@vit.ac.in',
            'password' => 'required|min:8|confirmed',
            'phone'    => 'nullable|string|max:15',
            'block'    => 'nullable|string|max:100',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        OtpVerification::updateOrCreate(['email' => $request->email], ['otp' => $otp, 'expires_at' => Carbon::now()->addMinutes(10)]);
        cache()->put('pending_user_' . $request->email, $request->only('name', 'email', 'password', 'phone', 'block', 'show_phone'), now()->addMinutes(15));

        try { Mail::to($request->email)->send(new OtpMail($otp)); } catch (\Exception $e) {}

        return response()->json(['message' => 'OTP sent to your college email.']);
    }

    public function verifyOtp(Request $request)
    {
        $v = Validator::make($request->all(), ['email' => 'required|email', 'otp' => 'required|string|size:6']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $record = OtpVerification::where('email', $request->email)->where('otp', $request->otp)->first();
        if (!$record) return response()->json(['message' => 'Invalid OTP.'], 400);
        if ($record->isExpired()) return response()->json(['message' => 'OTP expired.'], 400);

        $pending = cache()->get('pending_user_' . $request->email);
        if (!$pending) return response()->json(['message' => 'Registration data expired.'], 400);

        $user = User::create([
            'name'              => $pending['name'],
            'email'             => $pending['email'],
            'password'          => Hash::make($pending['password']),
            'phone'             => $pending['phone'] ?? null,
            'block'             => $pending['block'] ?? null,
            'show_phone'        => $pending['show_phone'] ?? false,
            'email_verified_at' => now(),
        ]);
        $record->delete();
        cache()->forget('pending_user_' . $request->email);
        $token = $user->createToken('vitmart')->plainTextToken;
        return response()->json(['message' => 'Account created.', 'token' => $token, 'user' => $user]);
    }

    public function login(Request $request)
    {
        $v = Validator::make($request->all(), ['email' => 'required|email', 'password' => 'required']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }
        if (!$user->email_verified_at) return response()->json(['message' => 'Email not verified.'], 403);

        $token = $user->createToken('vitmart')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    public function resendOtp(Request $request)
    {
        $v = Validator::make($request->all(), ['email' => 'required|email|ends_with:@vitstudent.ac.in,@vit.ac.in']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        if (User::where('email', $request->email)->whereNotNull('email_verified_at')->exists()) {
            return response()->json(['message' => 'This email is already verified.'], 409);
        }
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        OtpVerification::updateOrCreate(['email' => $request->email], ['otp' => $otp, 'expires_at' => Carbon::now()->addMinutes(10)]);
        try { Mail::to($request->email)->send(new OtpMail($otp)); } catch (\Exception $e) {}
        return response()->json(['message' => 'OTP resent.']);
    }

    public function forgotPassword(Request $request)
    {
        $v = Validator::make($request->all(), ['email' => 'required|email|exists:users,email']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        OtpVerification::updateOrCreate(['email' => $request->email], ['otp' => $otp, 'expires_at' => Carbon::now()->addMinutes(10)]);
        cache()->put('password_reset_' . $request->email, ['otp' => $otp], now()->addMinutes(10));
        try { Mail::to($request->email)->send(new OtpMail($otp)); } catch (\Exception $e) {}
        return response()->json(['message' => 'Password reset OTP sent.']);
    }

    public function resetPassword(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email|exists:users,email',
            'otp'      => 'required|string|size:6',
            'password' => 'required|min:8|confirmed',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);
        $cached = cache()->get('password_reset_' . $request->email);
        if (!$cached || $cached['otp'] !== $request->otp) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }
        User::where('email', $request->email)->firstOrFail()->update(['password' => Hash::make($request->password)]);
        cache()->forget('password_reset_' . $request->email);
        OtpVerification::where('email', $request->email)->delete();
        return response()->json(['message' => 'Password reset successfully.']);
    }
}
