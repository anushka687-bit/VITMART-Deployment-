import { useState, useRef } from 'react'
import {
  Store, ShieldCheck, Mail, Lock, Eye, EyeOff, Phone, ChevronLeft,
} from 'lucide-react'
import { apiPost, setToken, ApiError } from '@/lib/api'
import type { ApiUser } from '@/lib/adapters'
import type { Page, AuthMode } from '@/types'

type OtpFlow = 'register' | 'reset'

const OTP_PURPOSE: Record<OtpFlow, 'registration' | 'password_reset'> = {
  register: 'registration',
  reset: 'password_reset',
}
export function AuthPage({ setPage, onAuthenticated, initialMode = 'login' }: { setPage: (p: Page) => void; onAuthenticated: (user: ApiUser) => void; initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)

  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)

  // login
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // register
  const [regFirstName, setRegFirstName] = useState('')
  const [regLastName, setRegLastName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regBlock, setRegBlock] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')
  const [regError, setRegError] = useState('')

  // otp (shared between the register and forgot-password flows)
  const [otpFlow, setOtpFlow] = useState<OtpFlow>('register')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(false)

  // forgot-password: verify-otp and reset-password are two distinct steps
  const [resetOtpVerified, setResetOtpVerified] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('')

  // forgot password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotError, setForgotError] = useState('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleOtp(i: number, v: string) {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (v && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function resetOtpEntry() {
    setOtp(['', '', '', '', '', ''])
    setOtpError('')
  }

  async function handleLogin() {
    setLoginError('')
    setSubmitting(true)
    try {
      const res = await apiPost<{ token: string; user: ApiUser }>('/auth/login', { email: loginEmail, password: loginPassword })
      setToken(res.token)
      onAuthenticated(res.user)
      setPage('landing')
    } catch (e) {
      setLoginError(e instanceof ApiError ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister() {
    setRegError('')
    if (regPassword !== regPasswordConfirm) {
      setRegError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/auth/register', {
        name: `${regFirstName} ${regLastName}`.trim(),
        email: regEmail,
        password: regPassword,
        password_confirmation: regPasswordConfirm,
        phone: regPhone || null,
        block: regBlock || null,
      })
      setOtpFlow('register')
      setOtpEmail(regEmail)
      resetOtpEntry()
      setMode('otp')
    } catch (e) {
      setRegError(e instanceof ApiError ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp() {
    setOtpError('')
    const code = otp.join('')
    if (code.length !== 6) {
      setOtpError('Enter the full 6-digit code.')
      return
    }
    setSubmitting(true)
    try {
      if (otpFlow === 'reset') {
        const res = await apiPost<{ reset_token: string }>('/auth/verify-reset-otp', { email: otpEmail, otp: code })
        setResetToken(res.reset_token)
        setResetOtpVerified(true)
        setResetPassword('')
        setResetPasswordConfirm('')
      } else {
        const res = await apiPost<{ token: string; user: ApiUser }>('/auth/verify-otp', {
          email: otpEmail, otp: code, purpose: OTP_PURPOSE[otpFlow],
        })
        setToken(res.token)
        onAuthenticated(res.user)
        setPage('landing')
      }
    } catch (e) {
      setOtpError(e instanceof ApiError ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCompleteReset() {
    setOtpError('')
    if (!resetPassword || resetPassword !== resetPasswordConfirm) {
      setOtpError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await apiPost('/auth/reset-password', {
        email: otpEmail, reset_token: resetToken, password: resetPassword, password_confirmation: resetPasswordConfirm,
      })
      setMode('login')
      setResetOtpVerified(false)
      setResetToken('')
    } catch (e) {
      setOtpError(e instanceof ApiError ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendOtp() {
    if (resendCooldown) return
    setResendCooldown(true)
    try {
      await apiPost('/auth/resend-otp', { email: otpEmail, purpose: OTP_PURPOSE[otpFlow] })
    } catch {
      // silently ignore; the button re-enables below
    }
    setTimeout(() => setResendCooldown(false), 30000)
  }

  async function handleForgotPassword() {
    setForgotError('')
    setSubmitting(true)
    try {
      await apiPost('/auth/forgot-password', { email: forgotEmail })
      setOtpFlow('reset')
      setOtpEmail(forgotEmail)
      resetOtpEntry()
      setResetOtpVerified(false)
      setResetToken('')
      setMode('otp')
    } catch (e) {
      setForgotError(e instanceof ApiError ? e.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const cardClass = 'bg-card rounded-3xl border border-border shadow-xl w-full max-w-md p-8'
  const showingResetPasswordStep = otpFlow === 'reset' && resetOtpVerified

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-3">
            <Store className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-2xl font-poppins text-foreground">VIT<span className="text-blue-600">Mart</span></span>
          <p className="text-muted-foreground text-sm mt-1">Campus marketplace for VIT students</p>
          <div className="mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-full px-4 py-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Verified Student Access Only</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 text-center max-w-xs">
            Only students with a valid <span className="font-semibold text-foreground">@vit.ac.in</span> email can join VITMart.
          </p>
        </div>

        {mode === 'login' && (
          <div className={cardClass}>
            <h2 className="text-xl font-bold text-foreground mb-1">Welcome back!</h2>
            <p className="text-muted-foreground text-sm mb-6">Sign in to your VITMart account</p>
            <div className="space-y-4">
              {loginError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{loginError}</div>}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">VIT Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} type="email" placeholder="yourname@vit.ac.in" className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} type={showPwd ? 'text' : 'password'} placeholder="Enter your password" className="w-full pl-10 pr-10 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                  <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => setMode('forgot')} className="text-sm text-primary hover:underline">Forgot password?</button>
              </div>
              <button onClick={handleLogin} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-5">
              New to VITMart?{' '}
              <button onClick={() => setMode('register')} className="text-primary font-semibold hover:underline">Create account</button>
            </p>
          </div>
        )}

        {mode === 'register' && (
          <div className={cardClass}>
            <h2 className="text-xl font-bold text-foreground mb-1">Create your account</h2>
            <p className="text-muted-foreground text-sm mb-6">Join 4,200+ VIT students on VITMart</p>
            <div className="space-y-4">
              {regError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{regError}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">First Name</label>
                  <input value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} placeholder="Arjun" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Last Name</label>
                  <input value={regLastName} onChange={(e) => setRegLastName(e.target.value)} placeholder="Mehta" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">VIT Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={regEmail} onChange={(e) => setRegEmail(e.target.value)} type="email" placeholder="yourname.21cse@vit.ac.in" className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                  Only <span className="font-semibold text-foreground mx-0.5">@vit.ac.in</span> emails are accepted
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} type="tel" placeholder="+91 98765 43210" className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Hostel / Block</label>
                <select value={regBlock} onChange={(e) => setRegBlock(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50">
                  <option value="">Select your hostel</option>
                  {['Himalaya Block A', 'Himalaya Block B', 'Himalaya Block C', 'Ganga Block A', 'Ganga Block B', 'Cauvery Block A', 'Cauvery Block B', 'Krishna Block', 'Saraswathi Block', 'Yamuna Block'].map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" className="w-full pl-10 pr-10 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                  <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                <input value={regPasswordConfirm} onChange={(e) => setRegPasswordConfirm(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="Re-enter your password" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
              </div>
              <button onClick={handleRegister} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-5">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign in</button>
            </p>
          </div>
        )}

        {mode === 'otp' && (
          <div className={cardClass}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {showingResetPasswordStep ? 'Set a new password' : 'Verify your email'}
              </h2>
              {!showingResetPasswordStep && (
                <p className="text-muted-foreground text-sm">We sent a 6-digit OTP to <span className="font-semibold text-foreground">{otpEmail}</span></p>
              )}
            </div>

            {!showingResetPasswordStep && (
              <>
                <div className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl px-4 py-3 mb-5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Verified Student Access</span> — Your @vit.ac.in email ensures only real students trade on VITMart.
                  </p>
                </div>
                {otpError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-4">{otpError}</div>}
                <div className="flex gap-2.5 justify-center mb-6">
                  {otp.map((v, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text" maxLength={1} value={v}
                      onChange={(e) => handleOtp(i, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold bg-muted border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                    />
                  ))}
                </div>
                <button onClick={handleVerifyOtp} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors mb-4 disabled:opacity-60">
                  {submitting ? 'Verifying...' : otpFlow === 'reset' ? 'Verify Code' : 'Verify & Enter VITMart'}
                </button>
                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive it?{' '}
                  <button onClick={handleResendOtp} disabled={resendCooldown} className="text-primary font-semibold hover:underline disabled:opacity-50 disabled:no-underline">Resend OTP</button>
                  {resendCooldown && <span className="text-muted-foreground"> (30s)</span>}
                </p>
              </>
            )}

            {showingResetPasswordStep && (
              <>
                {otpError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2 mb-4">{otpError}</div>}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">New Password</label>
                    <input value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm New Password</label>
                    <input value={resetPasswordConfirm} onChange={(e) => setResetPasswordConfirm(e.target.value)} type={showPwd ? 'text' : 'password'} placeholder="Re-enter new password" className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                  </div>
                </div>
                <button onClick={handleCompleteReset} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
          </div>
        )}

        {mode === 'forgot' && (
          <div className={cardClass}>
            <div className="mb-6">
              <button onClick={() => setMode('login')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ChevronLeft className="w-4 h-4" /> Back to login
              </button>
              <h2 className="text-xl font-bold text-foreground mb-1">Reset Password</h2>
              <p className="text-muted-foreground text-sm">Enter your VIT email and we'll send a one-time code</p>
            </div>
            <div className="space-y-4">
              {forgotError && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 rounded-lg px-3 py-2">{forgotError}</div>}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">VIT Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} type="email" placeholder="yourname@vit.ac.in" className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none" />
                </div>
              </div>
              <button onClick={handleForgotPassword} disabled={submitting} className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
