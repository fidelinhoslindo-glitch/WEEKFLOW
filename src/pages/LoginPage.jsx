import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { supabaseResetPassword, supabaseResendVerification } from '../utils/supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const sbReady = !!(SUPABASE_URL && SUPABASE_KEY)

const getInitialPage = () => {
  try {
    const ob = JSON.parse(localStorage.getItem('wf_onboard') || '{}')
    return Object.keys(ob).length > 0 ? 'dashboard' : 'onboarding'
  } catch { return 'onboarding' }
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, signInWithApple, login, navigate } = useApp()
  const { t } = useLanguage()

  // Main form state
  const [tab,      setTab]      = useState('signin')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [error,    setError]    = useState('')

  // Email verification modal
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [verifyEmail,     setVerifyEmail]     = useState('')
  const [resending,       setResending]       = useState(false)
  const [resendSuccess,   setResendSuccess]   = useState(false)

  // Forgot password / reset view: 'form' | 'forgot' | 'reset'
  const [view,          setView]          = useState('form')
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg,     setForgotMsg]     = useState('')
  const [resetToken,    setResetToken]    = useState('')
  const [newPassword,   setNewPassword]   = useState('')
  const [confirmPass,   setConfirmPass]   = useState('')
  const [resetLoading,  setResetLoading]  = useState(false)
  const [resetMsg,      setResetMsg]      = useState('')

  // ── Handle OAuth redirect + password reset token in URL hash ──────────────
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (!accessToken) return
    window.history.replaceState({}, '', window.location.pathname)

    if (type === 'recovery') {
      setResetToken(accessToken)
      setView('reset')
      return
    }

    localStorage.setItem('wf_token', JSON.stringify(accessToken))
    const refreshToken = params.get('refresh_token')
    if (refreshToken) localStorage.setItem('wf_refresh_token', JSON.stringify(refreshToken))
    fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${accessToken}` }
    })
      .then(r => r.json())
      .then(u => {
        const userName  = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User'
        login(userName, u.email || '', null)
        navigate(getInitialPage())
      })
      .catch(() => { login('User', '', null); navigate(getInitialPage()) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearMessages = () => { setError('') }

  // ── Email/password submit ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    clearMessages()
    if (!email.trim())    { setError('Please enter your email.'); return }
    if (!password.trim()) { setError('Please enter your password.'); return }
    if (tab === 'signup') {
      if (!name.trim())        { setError('Please enter your full name.'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    }

    setLoading(true)
    try {
      if (tab === 'signin') {
        if (sbReady) {
          await signIn(email.trim(), password)
        } else {
          await new Promise(r => setTimeout(r, 500))
          login(email.split('@')[0], email, null)
        }
        navigate(getInitialPage())
      } else {
        if (sbReady) {
          const res = await signUp(name.trim(), email.trim(), password)
          if (res?.needsConfirmation) {
            setVerifyEmail(email.trim())
            setShowVerifyModal(true)
          } else {
            navigate(getInitialPage())
          }
        } else {
          await new Promise(r => setTimeout(r, 500))
          login(name.trim(), email.trim(), null)
          navigate(getInitialPage())
        }
      }
    } catch (err) {
      setError(err.message || t.common.unexpectedError)
    }
    setLoading(false)
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    clearMessages()
    if (!sbReady) { setError('Connect Supabase first — Settings → Cloud Sync.'); return }
    setOauthLoading('google')
    try { await signInWithGoogle() }
    catch (err) { setError(err.message || 'Google login failed.'); setOauthLoading('') }
  }

  // ── Apple OAuth ───────────────────────────────────────────────────────────
  const handleApple = async () => {
    clearMessages()
    if (!sbReady) { setError('Connect Supabase first — Settings → Cloud Sync.'); return }
    setOauthLoading('apple')
    try { await signInWithApple() }
    catch (err) { setError(err.message || 'Apple login failed.'); setOauthLoading('') }
  }

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true)
    setResendSuccess(false)
    try {
      await supabaseResendVerification(verifyEmail)
      setResendSuccess(true)
    } catch { /* silent */ }
    setResending(false)
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async () => {
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    setForgotMsg('')
    try {
      await supabaseResetPassword(forgotEmail.trim())
      setForgotMsg(t.login.resetEmailSent)
    } catch (err) {
      setForgotMsg(err.message || t.common.unexpectedError)
    }
    setForgotLoading(false)
  }

  // ── Reset password ────────────────────────────────────────────────────────
  const handleReset = async () => {
    if (newPassword !== confirmPass) { setResetMsg(t.login.passwordsMismatch); return }
    setResetLoading(true)
    setResetMsg('')
    try {
      const { supabaseUpdatePassword } = await import('../utils/supabase')
      await supabaseUpdatePassword(resetToken, newPassword)
      setResetMsg(t.login.passwordUpdated)
      setTimeout(() => { setView('form'); setResetToken('') }, 2000)
    } catch (err) {
      setResetMsg(err.message || t.common.unexpectedError)
    }
    setResetLoading(false)
  }

  const tabs = [['signin', t.login.signIn], ['signup', t.login.signUp]]

  // ── VERIFY EMAIL MODAL ────────────────────────────────────────────────────
  if (showVerifyModal) {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#8b5cf6] opacity-10 blur-[100px]"/>
        </div>
        <div className="relative w-full max-w-sm text-center">
          <div className="bg-[#0d0f1c] border border-white/[0.07] rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-emerald-400 text-3xl">mark_email_unread</span>
            </div>
            <div>
              <h2 className="text-white text-xl font-black mb-2">{t.login.verifyTitle}</h2>
              <p className="text-slate-400 text-sm">{t.login.verifySent}</p>
              <p className="text-[#6467f2] font-bold mt-1 break-all">{verifyEmail}</p>
            </div>
            {resendSuccess ? (
              <p className="text-emerald-400 text-sm font-semibold">{t.login.resendSuccess}</p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-slate-400 hover:text-white text-sm transition-colors disabled:opacity-50">
                {resending ? t.login.resending : t.login.resendEmail}
              </button>
            )}
            <button
              onClick={() => { setShowVerifyModal(false); setTab('signin') }}
              className="w-full py-3 bg-gradient-to-r from-[#6467f2] to-[#8b5cf6] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-[#6467f2]/30">
              {t.login.goToSignIn}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── FORGOT PASSWORD VIEW ──────────────────────────────────────────────────
  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#8b5cf6] opacity-10 blur-[100px]"/>
        </div>
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6467f2] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#6467f2]/40">
              <span className="text-white font-black text-2xl">W</span>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight">{t.login.forgotTitle}</h1>
            <p className="text-slate-500 text-sm mt-1">{t.login.forgotSubtitle}</p>
          </div>
          <div className="bg-[#0d0f1c] border border-white/[0.07] rounded-2xl p-6 shadow-2xl space-y-4">
            {forgotMsg && (
              <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ${forgotMsg === t.login.resetEmailSent ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${forgotMsg === t.login.resetEmailSent ? 'text-emerald-400' : 'text-red-400'}`}>
                  {forgotMsg === t.login.resetEmailSent ? 'check_circle' : 'error'}
                </span>
                <p className={`text-sm ${forgotMsg === t.login.resetEmailSent ? 'text-emerald-300' : 'text-red-300'}`}>{forgotMsg}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.emailAddress}</label>
              <input
                type="email" autoComplete="email"
                placeholder={t.login.emailPlaceholder}
                value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleForgot()}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
              />
            </div>
            <button onClick={handleForgot} disabled={forgotLoading || !forgotEmail.trim()}
              className="w-full py-3 bg-gradient-to-r from-[#6467f2] to-[#8b5cf6] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-[#6467f2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {forgotLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
              {t.login.sendResetLink}
            </button>
            <button onClick={() => setView('form')} className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-1">
              ← {t.login.backToLogin}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── RESET PASSWORD VIEW ───────────────────────────────────────────────────
  if (view === 'reset') {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
        </div>
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6467f2] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#6467f2]/40">
              <span className="text-white font-black text-2xl">W</span>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight">{t.login.resetTitle}</h1>
          </div>
          <div className="bg-[#0d0f1c] border border-white/[0.07] rounded-2xl p-6 shadow-2xl space-y-4">
            {resetMsg && (
              <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ${resetMsg === t.login.passwordUpdated ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${resetMsg === t.login.passwordUpdated ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resetMsg === t.login.passwordUpdated ? 'check_circle' : 'error'}
                </span>
                <p className={`text-sm ${resetMsg === t.login.passwordUpdated ? 'text-emerald-300' : 'text-red-300'}`}>{resetMsg}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.newPassword}</label>
              <input type="password" placeholder={t.login.passwordPlaceholder}
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.confirmPassword}</label>
              <input type="password" placeholder={t.login.passwordPlaceholder}
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleReset()}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
              />
            </div>
            <button onClick={handleReset} disabled={resetLoading || !newPassword || !confirmPass}
              className="w-full py-3 bg-gradient-to-r from-[#6467f2] to-[#8b5cf6] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-[#6467f2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {resetLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : null}
              {t.login.updatePassword}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── MAIN LOGIN FORM ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#8b5cf6] opacity-10 blur-[100px]"/>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6467f2] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#6467f2]/40">
            <span className="text-white font-black text-2xl">W</span>
          </div>
          <h1 className="text-white text-2xl font-black tracking-tight">WeekFlow</h1>
          <p className="text-slate-500 text-sm mt-1">{t.login.tagline}</p>
        </div>

        {/* Card */}
        <div className="bg-[#0d0f1c] border border-white/[0.07] rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/[0.04] p-1 rounded-xl mb-6">
            {tabs.map(([val, label]) => (
              <button key={val} onClick={() => { setTab(val); clearMessages() }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  tab === val ? 'bg-[#6467f2] text-white shadow-lg shadow-[#6467f2]/30' : 'text-slate-500 hover:text-slate-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
              <span className="material-symbols-outlined text-red-400 text-sm mt-0.5 shrink-0">error</span>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Name field (signup only) */}
          {tab === 'signup' && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.fullName}</label>
              <input type="text" autoComplete="name"
                placeholder={t.login.namePlaceholder}
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.emailAddress}</label>
            <input type="email" autoComplete="email"
              placeholder={t.login.emailPlaceholder}
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t.login.password}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                placeholder={t.login.passwordPlaceholder}
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#6467f2] transition-colors"
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Forgot password link (signin only) */}
          {tab === 'signin' && (
            <div className="flex justify-end mb-4">
              <button onClick={() => setView('forgot')}
                className="text-xs text-slate-500 hover:text-[#6467f2] transition-colors">
                {t.login.forgotPassword}
              </button>
            </div>
          )}
          {tab !== 'signin' && <div className="mb-6" />}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#6467f2] to-[#8b5cf6] text-white font-bold rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#6467f2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Loading...</>
            ) : (
              <>{tab === 'signin' ? t.login.signIn : t.login.createAccount} <span className="material-symbols-outlined text-sm">arrow_forward</span></>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]"/>
            <span className="text-xs text-slate-600 font-medium">{t.login.orContinueWith}</span>
            <div className="flex-1 h-px bg-white/[0.07]"/>
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={handleGoogle} disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-semibold text-white hover:bg-white/[0.09] active:scale-[0.98] transition-all disabled:opacity-40">
              {oauthLoading === 'google' ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
                </svg>
              )}
              Google
            </button>
            <button onClick={handleApple} disabled={!!oauthLoading}
              className="flex items-center justify-center gap-2 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-semibold text-white hover:bg-white/[0.09] active:scale-[0.98] transition-all disabled:opacity-40">
              {oauthLoading === 'apple' ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              ) : (
                <svg width="18" height="18" viewBox="0 0 814 1000" fill="white">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-163.3-109.5C138.1 753.3 69.3 651.8 69.3 601.5c0-38.8 8.3-76.2 25.3-112.3 23.4-48.7 82.5-101.7 140.8-101.7 55.1 0 83.9 36.3 158.8 36.3 73.2 0 115-36.9 173.3-36.9 55.1 0 101.1 28.6 138.8 86.5zm-154.8-222.2c37-44.2 63.3-105.4 63.3-166.6 0-8.4-.6-17-2-25.4-60.2 2.2-131.2 40.2-173.9 91.6-33.3 38.8-64.1 99.5-64.1 161.5 0 9 1.3 18 2 20.7 3.9.6 10.3 1.3 16.6 1.3 54.5 0 121.5-36.5 158.1-82.9z"/>
                </svg>
              )}
              Apple
            </button>
          </div>

          {/* Supabase status */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <div className={`w-1.5 h-1.5 rounded-full ${sbReady ? 'bg-emerald-500' : 'bg-slate-600'}`}/>
            <p className="text-xs text-slate-600">
              {sbReady ? t.login.connectedSupabase : t.login.offlineMode}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
