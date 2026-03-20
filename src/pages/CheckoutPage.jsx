import { useState } from 'react'
import { useApp } from '../context/AppContext'

const PLANS = {
  monthly: { price: 8,  label: '/month', saving: null,       priceId: 'wf_pro_monthly' },
  yearly:  { price: 64, label: '/year',  saving: 'Save 33%', priceId: 'wf_pro_yearly'  },
}

const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export default function CheckoutPage() {
  const { navigate, user, pushToast, setUser } = useApp()
  const sbToken = localStorage.getItem('wf_token')

  const [billing,  setBilling]  = useState('monthly')
  const [step,     setStep]     = useState('plan')   // plan | payment | success
  const [loading,  setLoading]  = useState(false)
  const [card,     setCard]     = useState({ number:'', exp:'', cvv:'', name: user?.name || '' })
  const [errors,   setErrors]   = useState({})

  const plan = PLANS[billing]

  // ── Validate card ──────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    const num = card.number.replace(/\s/g,'')
    if (num.length < 16)         e.number = 'Invalid card number'
    if (card.exp.length < 5)     e.exp    = 'Invalid expiry'
    if (card.cvv.length < 3)     e.cvv    = 'Invalid CVV'
    if (!card.name.trim())       e.name   = 'Name required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Simulate payment + upgrade plan in Supabase ────────────────────────────
  async function handlePay() {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))  // simulate payment processing

    try {
      // Update plan in Supabase profiles
      if (SB_URL && sbToken && user?.id) {
        const expiresAt = billing === 'yearly'
          ? new Date(Date.now() + 365*24*60*60*1000).toISOString()
          : new Date(Date.now() +  30*24*60*60*1000).toISOString()

        await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${user.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type':'application/json', 'apikey':SB_KEY, 'Authorization':`Bearer ${sbToken}` },
          body: JSON.stringify({ plan:'Pro', plan_expires_at: expiresAt, plan_billing: billing })
        })
      }

      // Update local user
      const updatedUser = { ...user, plan:'Pro' }
      localStorage.setItem('wf_user', JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)

      setStep('success')
    } catch(e) {
      pushToast('Payment processed! Plan updated.', 'success')
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  function formatCard(v) {
    return v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  }
  function formatExp(v) {
    return v.replace(/\D/g,'').slice(0,4).replace(/^(\d{2})(\d)/,'$1/$2')
  }

  if (step === 'success') return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-emerald-500 text-5xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
        </div>
        <h1 className="text-3xl font-black mb-3">You're Pro! 🎉</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Welcome to WeekFlow Pro. All features unlocked. Enjoy your journey!</p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-8 text-left space-y-3">
          {['Unlimited tasks & routines','AI scheduling assistant','Unlimited FlowCircles','Cloud sync across devices','Push notifications','Priority support'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('dashboard')}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25">
          Go to Dashboard →
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => step==='payment'?setStep('plan'):navigate('landing')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="./favicon.png" alt="WeekFlow" className="w-7 h-7 rounded-lg" onError={e=>e.target.style.display='none'}/>
            <span className="font-black">WeekFlow</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
            Secure checkout
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {['plan','payment'].map((s,i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${step===s||((step==='payment'&&s==='plan'))||((step==='success'&&s!=='success'))?'bg-primary text-white':'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  {(step==='payment'&&s==='plan')||(step==='success'&&s!=='success') ? '✓' : i+1}
                </div>
                <span className={`text-sm font-semibold capitalize ${step===s?'text-slate-900 dark:text-white':'text-slate-400'}`}>{s}</span>
                {i===0 && <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>}
              </div>
            ))}
          </div>

          {/* STEP 1: Plan selection */}
          {step==='plan' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Choose your billing</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {Object.entries(PLANS).map(([k,p]) => (
                  <button key={k} onClick={() => setBilling(k)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${billing===k?'border-primary bg-primary/5':'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}>
                    {p.saving && (
                      <span className="absolute -top-2.5 left-4 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">{p.saving}</span>
                    )}
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{k}</p>
                    <p className="text-3xl font-black">${p.price}<span className="text-sm font-medium text-slate-400">{p.label}</span></p>
                    {k==='yearly' && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">${(p.price/12).toFixed(2)}/month</p>}
                  </button>
                ))}
              </div>
              <button onClick={() => setStep('payment')}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25 text-base">
                Continue to Payment →
              </button>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step==='payment' && (
            <div>
              <h2 className="text-2xl font-black mb-6">Payment details</h2>
              <div className="space-y-4">
                {/* Card number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.number?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      onChange={e => setCard(c=>({...c,number:formatCard(e.target.value)}))}
                      maxLength={19}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      {['visa','mc','amex'].map(b => (
                        <div key={b} className="w-8 h-5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black flex items-center justify-center text-slate-400">{b.toUpperCase()}</div>
                      ))}
                    </div>
                  </div>
                  {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
                </div>

                {/* Exp + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Expiry</label>
                    <input
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.exp?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                      placeholder="MM/YY"
                      value={card.exp}
                      onChange={e => setCard(c=>({...c,exp:formatExp(e.target.value)}))}
                      maxLength={5}
                    />
                    {errors.exp && <p className="text-red-400 text-xs mt-1">{errors.exp}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">CVV</label>
                    <input
                      className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.cvv?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                      placeholder="123"
                      value={card.cvv}
                      onChange={e => setCard(c=>({...c,cvv:e.target.value.replace(/\D/g,'').slice(0,4)}))}
                      maxLength={4}
                    />
                    {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Name on Card</label>
                  <input
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.name?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                    placeholder="John Smith"
                    value={card.name}
                    onChange={e => setCard(c=>({...c,name:e.target.value}))}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
                  <p className="text-xs text-amber-700 dark:text-amber-300">This is a simulated checkout. No real payment is processed.</p>
                </div>

                <button onClick={handlePay} disabled={loading}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25 text-base disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="animate-spin material-symbols-outlined text-sm">refresh</span> Processing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">lock</span> Pay ${plan.price} {billing === 'yearly' ? '/year' : '/month'}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
            <h3 className="font-black text-base mb-5">Order Summary</h3>
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <img src="./favicon.png" alt="" className="w-8 h-8 rounded-lg" onError={e=>e.target.style.display='none'}/>
              </div>
              <div>
                <p className="font-black">WeekFlow Pro</p>
                <p className="text-xs text-slate-400 capitalize">{billing} billing</p>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold">${plan.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tax</span>
                <span className="font-semibold">$0.00</span>
              </div>
              {billing==='yearly' && (
                <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                  <span>Annual discount</span>
                  <span className="font-bold">-$32</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-black text-lg border-t border-slate-100 dark:border-slate-800 pt-4 mb-5">
              <span>Total</span>
              <span>${plan.price}</span>
            </div>
            <div className="space-y-2">
              {['Unlimited tasks','AI scheduling','FlowCircles','Cloud sync'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-emerald-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                  {f}
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 justify-center">
              <span className="material-symbols-outlined text-sm">lock</span>
              SSL encrypted · Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
