import { useState } from 'react'
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ChevronLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import type { Page } from '@/types'
import { apiPost, ApiError } from '@/lib/api'

// Dedicated origin for the session-cookie-based admin login (Sanctum SPA
// flow). Must match the literal host the React dev server considers
// "same-site" (here, localhost) so document.cookie can read the XSRF-TOKEN
// cookie Laravel sets — kept separate from VITE_API_URL/APP_ORIGIN, which is
// used for the bearer-token customer API and may point at a different host
// alias (e.g. 127.0.0.1).
const ADMIN_ORIGIN = import.meta.env.VITE_ADMIN_URL
if (!ADMIN_ORIGIN) {
  throw new Error('VITE_ADMIN_URL is not set. Add it to .env or .env.local, e.g. VITE_ADMIN_URL=http://localhost:8000')
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

type View = 'login' | 'forgotEmail' | 'forgotOtp' | 'forgotReset'

const inputClass = 'w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none'
const inputClassWithToggle = 'w-full pl-10 pr-10 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none'

export function AdminLoginPage({ setPage }: { setPage: (p: Page) => void }) {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // forgot-password flow state (reuses the same OTP endpoints as user reset)
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  function switchView(v: View) {
    setError('')
    setNotice('')
    setView(v)
  }

  async function handleLogin() {
    setError('')
    setSubmitting(true)
    try {
      // Sanctum's SPA flow: fetch the XSRF cookie first, then send it back
      // as a header so Laravel's session-based /login route accepts us.
      await fetch(`${ADMIN_ORIGIN}/sanctum/csrf-cookie`, { credentials: 'include' })

      const res = await fetch(`${ADMIN_ORIGIN}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(getCookie('XSRF-TOKEN') ? { 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')! } : {}),
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setError(data?.message || 'Login failed. Please try again.')
        return
      }
      window.location.href = data.redirect
    } catch {
      setError('Could not reach the server. Check your connection and that the Laravel backend is running.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotEmail() {
    setError('')
    setSubmitting(true)
    try {
      await apiPost('/auth/forgot-password', { email })
      setNotice(`A 6-digit reset code has been sent to ${email}.`)
      setView('forgotOtp')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send the reset code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp() {
    setError('')
    setSubmitting(true)
    try {
      const res = await apiPost<{ reset_token: string }>('/auth/verify-reset-otp', { email, otp })
      setResetToken(res.reset_token)
      setNotice('')
      setView('forgotReset')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid code. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendOtp() {
    setError('')
    try {
      await apiPost('/auth/resend-otp', { email, purpose: 'password_reset' })
      setNotice('A new code has been sent.')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not resend the code.')
    }
  }

  async function handleResetPassword() {
    setError('')
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/auth/reset-password', {
        email,
        reset_token: resetToken,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      })
      setOtp('')
      setResetToken('')
      setNewPassword('')
      setNewPasswordConfirm('')
      setNotice('Password reset successfully. Sign in with your new password.')
      setView('login')
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reset the password. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const cardClass = 'bg-card rounded-3xl border border-border shadow-xl w-full max-w-md p-8'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl font-poppins text-foreground">VIT<span className="text-blue-600">Mart</span></span>
          <p className="text-muted-foreground text-sm mt-1">Admin Panel Access</p>
        </div>

        <div className={cardClass}>
          {view === 'login' ? (
            <button onClick={() => setPage('landing')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ChevronLeft className="w-4 h-4" /> Back to site
            </button>
          ) : (
            <button onClick={() => switchView(view === 'forgotEmail' ? 'login' : 'forgotEmail')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          )}

          {view === 'login' && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Admin Sign In</h2>
              <p className="text-muted-foreground text-sm mb-6">Sign in to access the admin dashboard</p>
              <div className="space-y-4">
                {notice && <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-950/40 rounded-lg px-3 py-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{notice}</div>}
                {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{error}</div>}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Enter your admin email" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" className={inputClassWithToggle} />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button onClick={handleLogin} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submitting ? 'Signing in...' : 'Sign In'}
                </button>
                <button onClick={() => switchView('forgotEmail')} className="w-full text-sm text-primary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {view === 'forgotEmail' && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Reset Password</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter your admin email and we'll send you a 6-digit reset code</p>
              <div className="space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{error}</div>}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleForgotEmail()} type="email" placeholder="Enter your admin email" className={inputClass} />
                  </div>
                </div>
                <button onClick={handleForgotEmail} disabled={submitting || !email} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submitting ? 'Sending code...' : 'Send Reset Code'}
                </button>
              </div>
            </>
          )}

          {view === 'forgotOtp' && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Enter Reset Code</h2>
              <p className="text-muted-foreground text-sm mb-6">Check your inbox for the 6-digit code</p>
              <div className="space-y-4">
                {notice && <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 dark:bg-green-950/40 rounded-lg px-3 py-2"><CheckCircle2 className="w-4 h-4 shrink-0" />{notice}</div>}
                {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{error}</div>}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Reset Code</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOtp()} inputMode="numeric" placeholder="6-digit code" className={`${inputClass} tracking-[0.4em] font-semibold`} />
                  </div>
                </div>
                <button onClick={handleVerifyOtp} disabled={submitting || otp.length !== 6} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submitting ? 'Verifying...' : 'Verify Code'}
                </button>
                <button onClick={handleResendOtp} className="w-full text-sm text-primary font-semibold hover:underline">
                  Resend code
                </button>
              </div>
            </>
          )}

          {view === 'forgotReset' && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Set New Password</h2>
              <p className="text-muted-foreground text-sm mb-6">Choose a new password for {email}</p>
              <div className="space-y-4">
                {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{error}</div>}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" className={inputClassWithToggle} />
                    <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()} type={showPwd ? 'text' : 'password'} placeholder="Repeat new password" className={inputClass} />
                  </div>
                </div>
                <button onClick={handleResetPassword} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
