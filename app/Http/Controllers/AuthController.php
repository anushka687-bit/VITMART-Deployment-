<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Validator};
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function __construct(private OtpService $otp) {}

    // ── Session-based Auth (Blade forms — used only by the Admin Panel) ──

    public function loginSubmit(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);
        if ($v->fails()) {
            if ($request->wantsJson()) return response()->json(['message' => $v->errors()->first()], 422);
            return back()->withErrors($v)->withInput();
        }

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            if ($request->wantsJson()) return response()->json(['message' => 'Invalid credentials.'], 401);
            return back()->withErrors(['email' => 'Invalid credentials.'])->withInput();
        }
        if (!$user->email_verified_at) {
            if ($request->wantsJson()) return response()->json(['message' => 'Email not verified.'], 403);
            return back()->withErrors(['email' => 'Email not verified.'])->withInput();
        }
        if ($user->isBlocked()) {
            if ($request->wantsJson()) return response()->json(['message' => 'Your account has been blocked. Contact support for assistance.'], 403);
            return back()->withErrors(['email' => 'Your account has been blocked. Contact support for assistance.'])->withInput();
        }

        // The React "Admin" login only ever wants an admin session — a valid
        // non-admin login here is rejected rather than silently signed in.
        if ($request->wantsJson() && !$user->isAdmin()) {
            return response()->json(['message' => 'This account does not have admin access.'], 403);
        }

        auth()->login($user, $request->boolean('remember'));

        if ($request->wantsJson()) {
            $request->session()->regenerate();
            return response()->json(['redirect' => route('admin.dashboard')]);
        }

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->intended(route('home'));
    }

    public function logoutSession(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect(config('app.frontend_url'));
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

        cache()->put('pending_user_' . $request->email, $request->only('name', 'email', 'password', 'phone', 'block', 'show_phone'), now()->addMinutes(15));
        $this->otp->generateAndSend($request->email, 'registration');

        return response()->json(['message' => 'OTP sent to your college email.']);
    }

    public function verifyOtp(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $purpose = 'registration';
        $result = $this->otp->verify($request->email, $request->otp, $purpose);
        if (!$result['ok']) return response()->json(['message' => $result['message']], 400);

        $pending = cache()->get('pending_user_' . $request->email);
        if (!$pending) return response()->json(['message' => 'Registration data expired. Please register again.'], 400);

        $user = User::create([
            'name'              => $pending['name'],
            'email'             => $pending['email'],
            'password'          => Hash::make($pending['password']),
            'phone'             => $pending['phone'] ?? null,
            'block'             => $pending['block'] ?? null,
            'show_phone'        => $pending['show_phone'] ?? false,
            'email_verified_at' => now(),
        ]);
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
        if ($user->isBlocked()) {
            return response()->json(['message' => 'Your account has been blocked. Contact support for assistance.'], 403);
        }

        $token = $user->createToken('vitmart')->plainTextToken;
        return response()->json(['message' => 'Logged in.', 'token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    public function resendOtp(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'   => 'required|email',
            'purpose' => 'nullable|string|in:registration,password_reset',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $purpose = $request->input('purpose', 'registration');

        if ($purpose === 'registration' && User::where('email', $request->email)->whereNotNull('email_verified_at')->exists()) {
            return response()->json(['message' => 'This email is already verified.'], 409);
        }

        $wait = $this->otp->secondsUntilResendAllowed($request->email, $purpose);
        if ($wait > 0) {
            return response()->json(['message' => "Please wait {$wait}s before requesting another OTP."], 429);
        }

        $this->otp->generateAndSend($request->email, $purpose);
        return response()->json(['message' => 'OTP resent.']);
    }

    public function forgotPassword(Request $request)
    {
        $v = Validator::make($request->all(), ['email' => 'required|email|exists:users,email']);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $wait = $this->otp->secondsUntilResendAllowed($request->email, 'password_reset');
        if ($wait > 0) {
            return response()->json(['message' => "Please wait {$wait}s before requesting another OTP."], 429);
        }

        $this->otp->generateAndSend($request->email, 'password_reset');
        return response()->json(['message' => 'Password reset OTP sent.']);
    }

    public function verifyResetOtp(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp'   => 'required|string|size:6',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $result = $this->otp->verify($request->email, $request->otp, 'password_reset');
        if (!$result['ok']) return response()->json(['message' => $result['message']], 400);

        $resetToken = Str::random(40);
        cache()->put('password_reset_token_' . $request->email, $resetToken, now()->addMinutes(10));

        return response()->json(['message' => 'OTP verified.', 'reset_token' => $resetToken]);
    }

    public function resetPassword(Request $request)
    {
        $v = Validator::make($request->all(), [
            'email'       => 'required|email|exists:users,email',
            'reset_token' => 'required|string',
            'password'    => 'required|min:8|confirmed',
        ]);
        if ($v->fails()) return response()->json(['errors' => $v->errors()], 422);

        $cachedToken = cache()->get('password_reset_token_' . $request->email);
        if (!$cachedToken || !hash_equals($cachedToken, $request->reset_token)) {
            return response()->json(['message' => 'Invalid or expired reset session. Please verify OTP again.'], 400);
        }

        User::where('email', $request->email)->firstOrFail()->update(['password' => Hash::make($request->password)]);
        cache()->forget('password_reset_token_' . $request->email);

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
