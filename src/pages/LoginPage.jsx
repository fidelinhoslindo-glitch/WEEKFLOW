import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { fbSendPasswordReset, fbResendVerificationEmail } from '../utils/firebaseAuth'
import { isFirebaseConfigured } from '../utils/firebase'

const fbReady = isFirebaseConfigured()

const getInitialPage = () => {
  try {
    const ob = JSON.parse(localStorage.getItem('wf_onboard') || '{}')
    return Object.keys(ob).length > 0 ? 'dashboard' : 'onboarding'
  } catch { return 'onboarding' }
}

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, navigate, loginDemo } = useApp()
  const { t } = useLanguage()

  const [tab,      setTab]      = useState('signin')
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [error,    setError]    = useState('')

  // View: 'form' | 'forgot' | 'verify-email'
  const [view,          setView]          = useState('form')
  const [forgotEmail,   setForgotEmail]   = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotMsg,     setForgotMsg]     = useState('')
  const [resendMsg,     setResendMsg]     = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  // Firebase sends a reset email with a link — no in-app reset token flow needed
  // If user clicks the link they land on Firebase's hosted reset page

  // Exibir botão demo em dev ou quando query param ?demo=1 estiver presente
  const showDemo = import.meta.env.DEV || new URLSearchParams(window.location.search).get('demo') === '1'

  // ── Handle Google redirect result (if redirect flow was used) ─────────────
  useEffect(() => {
    // fbGetRedirectResult is already handled in AppContext on mount
    // Nothing needed here
  }, [])

  const clearMessages = () => setError('')

  // ── Email/password submit ─────────────────────────────────────────────────
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
        await signIn(email.trim(), password)
        navigate(getInitialPage())
      } else {
        await signUp(name.trim(), email.trim(), password)
        // Show email verification screen instead of navigating to dashboard
        setView('verify-email')
      }
    } catch (err) {
      if (err.message === 'email-not-verified') {
        setView('verify-email')
      } else {
        setError(err.message || t.common.unexpectedError)
      }
    }
    setLoading(false)
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    clearMessages()
    if (!fbReady) { setError('Firebase not configured.'); return }
    setOauthLoading('google')
    try {
      await signInWithGoogle()
      // popup: AppContext._finishLogin handles navigation
      // redirect: fbGetRedirectResult handles it on next mount
    } catch (err) {
      setError(err.message || 'Google login failed.')
    }
    setOauthLoading('')
  }

  // ── Resend verification email ─────────────────────────────────────────────
  const handleResend = async () => {
    setResendLoading(true)
    setResendMsg('')
    try {
      await fbResendVerificationEmail()
      setResendMsg('Email reenviado! Verifique sua caixa de entrada.')
    } catch (err) {
      setResendMsg(err.message || 'Erro ao reenviar email.')
    }
    setResendLoading(false)
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgot = async () => {
    if (!forgotEmail.trim()) return
    setForgotLoading(true)
    setForgotMsg('')
    try {
      await fbSendPasswordReset(forgotEmail.trim())
      setForgotMsg(t.login.resetEmailSent)
    } catch (err) {
      setForgotMsg(err.message || t.common.unexpectedError)
    }
    setForgotLoading(false)
  }

  const tabs = [['signin', t.login.signIn], ['signup', t.login.signUp]]

  // ── VERIFY EMAIL VIEW ────────────────────────────────────────────────────
  if (view === 'verify-email') {
    return (
      <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
          <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#8b5cf6] opacity-10 blur-[100px]"/>
        </div>
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6467f2] to-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#6467f2]/40">
              <span className="material-symbols-outlined text-white text-3xl">mark_email_unread</span>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight">Verifique seu email</h1>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Enviamos um link de confirmação para{' '}
              <span className="text-white font-semibold">{email}</span>.
              <br/>Clique no link para ativar sua conta.
            </p>
          </div>
          <div className="bg-[#0d0f1c] border border-white/[0.07] rounded-2xl p-6 shadow-2xl space-y-4">
            {resendMsg && (
              <div className={`flex items-start gap-2.5 rounded-xl px-4 py-3 ${resendMsg.startsWith('Email reenviado') ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <span className={`material-symbols-outlined text-sm mt-0.5 shrink-0 ${resendMsg.startsWith('Email reenviado') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {resendMsg.startsWith('Email reenviado') ? 'check_circle' : 'error'}
                </span>
                <p className={`text-sm ${resendMsg.startsWith('Email reenviado') ? 'text-emerald-300' : 'text-red-300'}`}>{resendMsg}</p>
              </div>
            )}
            <button onClick={handleResend} disabled={resendLoading}
              className="w-full py-3 bg-gradient-to-r from-[#6467f2] to-[#8b5cf6] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-[#6467f2]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {resendLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <span className="material-symbols-outlined text-sm">send</span>}
              Reenviar email
            </button>
            <button onClick={() => { setView('form'); setTab('signin'); setResendMsg('') }}
              className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors py-1">
              ← Voltar ao login
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

  // ── MAIN LOGIN FORM ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#07090f] flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#6467f2] opacity-10 blur-[120px]"/>
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#8b5cf6] opacity-10 blur-[100px]"/>
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-logo-intro">
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
          <div className="mb-4">
            <button onClick={handleGoogle} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-semibold text-white hover:bg-white/[0.09] active:scale-[0.98] transition-all disabled:opacity-40">
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
              Continuar com Google
            </button>
          </div>

          {/* Firebase status */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            <div className={`w-1.5 h-1.5 rounded-full ${fbReady ? 'bg-emerald-500' : 'bg-slate-600'}`}/>
            <p className="text-xs text-slate-600">
              {fbReady ? 'Connected to Firebase' : t.login.offlineMode}
            </p>
          </div>
        </div>

        {/* Botão demo — visível apenas em dev ou com ?demo=1 */}
        {showDemo && (
          <div className="mt-4 text-center">
            <button
              onClick={loginDemo}
              className="text-sm text-slate-500 hover:text-[#6467f2] transition-colors flex items-center gap-1.5 mx-auto"
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              Ver demo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
