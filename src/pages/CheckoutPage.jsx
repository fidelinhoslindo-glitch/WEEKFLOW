import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const PLANS = {
  free: {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    color: 'neutral',
    badge: 'Gratis para sempre',
    cta: 'Continuar gratis',
    features: [
      '15 tarefas simultaneas',
      'Planner semanal completo',
      '1 FlowCircle (3 membros)',
      'Pulso do Circulo + FlowStreak basico',
      '5 mensagens de IA por dia',
      'App web + desktop',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 19,
    yearly: 152,
    color: 'primary',
    badge: 'Mais popular',
    cta: 'Comecar Pro',
    features: [
      'Tarefas ilimitadas',
      'Sync na nuvem (Supabase)',
      'IA ilimitada (Groq)',
      'Circles ilimitados',
      'Detector de Colisao',
      'Janela Livre automatica',
      'FlowStreak + Escudos + Pacto',
      'Previsao da Semana',
      'Analytics completo (90 dias)',
      'Smart Calendar IA',
      'Google Calendar sync',
    ],
  },
  business: {
    name: 'Business',
    monthly: 49,
    yearly: 392,
    color: 'purple',
    badge: 'Para times',
    cta: 'Comecar Business',
    features: [
      'Tudo do Pro, mais:',
      'Membros ilimitados por circulo',
      'Painel admin do time',
      'Delegar tarefas por membro',
      'Relatorio semanal do time',
      'Chama do Circulo avancada',
      'Analytics do time (90 dias)',
      'Suporte prioritario',
    ],
  },
}

const PRICE_MAP = {
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY || '',
    pix: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY || '',
  },
  business: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_YEARLY || '',
    pix: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_MONTHLY || '',
  },
}

export default function CheckoutPage() {
  const { navigate, user, pushToast, setUser, setConfetti } = useApp()

  const [billing, setBilling] = useState('monthly')
  const [step, setStep] = useState('plan')
  const [selectedPlan, setSelectedPlan] = useState('pro')
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('card') // card | pix

  // Read pre-selected plan from localStorage (set from LandingPage)
  useEffect(() => {
    const stored = localStorage.getItem('wf_selected_plan')
    if (stored && PLANS[stored]) {
      setSelectedPlan(stored)
      localStorage.removeItem('wf_selected_plan')
    }
  }, [])

  // Detect Stripe redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('checkout') === 'success') {
      const plan = params.get('plan') || 'Pro'
      const updatedUser = { ...user, plan }
      localStorage.setItem('wf_user', JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)
      if (setConfetti) setConfetti(true)
      setSelectedPlan(plan.toLowerCase())
      setStep('success')
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (params.get('checkout') === 'canceled') {
      setStep('plan')
      pushToast('Pagamento cancelado.', 'info')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const plan = PLANS[selectedPlan]
  const price = billing === 'yearly' ? plan.yearly : plan.monthly
  const saving = billing === 'yearly' ? Math.round(plan.monthly * 12 - plan.yearly) : 0
  const planDisplayName = selectedPlan === 'business' ? 'Business' : 'Pro'

  // ── Stripe Checkout redirect ─────────────────────────────────────────────
  async function handleCheckout() {
    setLoading(true)
    const billingKey = payMethod === 'pix' ? 'pix' : billing
    const priceId = PRICE_MAP[selectedPlan]?.[billingKey]

    if (!priceId) {
      pushToast('Stripe price ID not configured. Check environment variables.', 'error')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          plan: planDisplayName,
          billing: billingKey,
          userEmail: user?.email || '',
          userId: user?.id || '',
        }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        pushToast(data.error || 'Erro ao criar checkout.', 'error')
        setLoading(false)
      }
    } catch (err) {
      pushToast('Erro de conexao. Tente novamente.', 'error')
      setLoading(false)
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-emerald-500 text-6xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
        </div>
        <h1 className="text-4xl font-black mb-3">Voce e {planDisplayName}!</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Todos os recursos foram desbloqueados. Aproveite!</p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8 text-left space-y-3">
          {(selectedPlan === 'business'
            ? ['Tudo do Pro incluso','Membros ilimitados','Painel admin do time','Delegar tarefas','Relatorio do time','Suporte prioritario']
            : ['Tarefas ilimitadas','IA ilimitada (Groq)','Circles ilimitados','Sync na nuvem','Analytics 90 dias','Smart Calendar AI']
          ).map(f => (
            <div key={f} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('dashboard')}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25 text-base">
          Ir para o app
        </button>
      </div>
    </div>
  )

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => step==='payment' ? setStep('plan') : navigate('landing')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <img src="./favicon.png" alt="WeekFlow" className="w-7 h-7 rounded-lg" onError={e=>e.target.style.display='none'}/>
            <span className="font-black">WeekFlow</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
            Checkout seguro
          </div>
        </div>
      </div>

      {/* Step 1: Plan selection — 3 cards */}
      {step === 'plan' && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-black text-center mb-2">Escolha seu plano</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Comece gratis. Faca upgrade quando estiver pronto.</p>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {[['monthly','Mensal'],['yearly','Anual']].map(([k, label]) => (
                <button key={k} onClick={() => setBilling(k)}
                  className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-all ${billing === k ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {label}
                  {k === 'yearly' && <span className="absolute -top-2.5 -right-3 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">-33%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full mb-5 self-start">
                {PLANS.free.badge}
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Free</p>
              <p className="text-4xl sm:text-5xl font-black mb-1">R$0</p>
              <p className="text-slate-400 text-sm mb-6">Sem cartao. Sem prazo.</p>
              <ul className="space-y-2.5 flex-1 mb-8">
                {PLANS.free.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-500 font-black mt-0.5 shrink-0">✓</span>
                    <span className="text-slate-600 dark:text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('dashboard')}
                className="w-full py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-400 transition-all">
                Continuar gratis
              </button>
            </div>

            {/* Pro card — highlighted */}
            <div className="bg-primary rounded-2xl p-6 sm:p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-primary/30 border-2 border-primary">
              <div className="absolute top-5 right-5 bg-white text-primary text-xs font-black px-3 py-1 rounded-full">
                Mais Popular
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-white/70 mb-2">Pro</p>
              <div className="mb-1">
                <span className="text-4xl sm:text-5xl font-black text-white">R${billing === 'yearly' ? PLANS.pro.yearly : PLANS.pro.monthly}</span>
                <span className="text-white/70 text-base ml-1">{billing === 'yearly' ? '/ano' : '/mes'}</span>
              </div>
              {billing === 'yearly'
                ? <p className="text-emerald-300 text-xs font-bold mb-6">Economize R${Math.round(PLANS.pro.monthly * 12 - PLANS.pro.yearly)}</p>
                : <p className="text-white/50 text-xs mb-6">ou R${PLANS.pro.yearly}/ano — economize R${Math.round(PLANS.pro.monthly * 12 - PLANS.pro.yearly)}</p>
              }
              <ul className="space-y-2.5 flex-1 mb-8">
                {PLANS.pro.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                    <span className="text-white/80 font-black mt-0.5 shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => { setSelectedPlan('pro'); setStep('payment') }}
                className="w-full py-3.5 rounded-xl bg-white text-primary font-black hover:bg-white/90 transition-all shadow-lg">
                Comecar Pro
              </button>
            </div>

            {/* Business card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-300 dark:border-purple-700 p-6 sm:p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-5 right-5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-black px-3 py-1 rounded-full">
                Para times
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-purple-500 mb-2">Business</p>
              <div className="mb-1">
                <span className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400">R${billing === 'yearly' ? PLANS.business.yearly : PLANS.business.monthly}</span>
                <span className="text-purple-400 dark:text-purple-500 text-base ml-1">{billing === 'yearly' ? '/ano' : '/mes'}</span>
              </div>
              {billing === 'yearly'
                ? <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6">Economize R${Math.round(PLANS.business.monthly * 12 - PLANS.business.yearly)}</p>
                : <p className="text-slate-400 text-xs mb-6">ou R${PLANS.business.yearly}/ano — economize R${Math.round(PLANS.business.monthly * 12 - PLANS.business.yearly)}</p>
              }
              <ul className="space-y-2.5 flex-1 mb-8">
                {PLANS.business.features.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm ${i === 0 ? 'font-black text-purple-500 text-xs uppercase tracking-wider pt-1' : 'text-slate-600 dark:text-slate-300'}`}>
                    {i > 0 && <span className="text-purple-500 font-black mt-0.5 shrink-0">✓</span>}
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => { setSelectedPlan('business'); setStep('payment') }}
                className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25">
                Comecar Business
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payment method selection + Stripe redirect */}
      {step === 'payment' && (
        <div className="max-w-3xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — payment options */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">✓</div>
              <span className="text-sm font-semibold text-slate-400">Plano</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">2</div>
              <span className="text-sm font-semibold">Pagamento</span>
            </div>

            <h2 className="text-2xl font-black">Escolha o metodo de pagamento</h2>

            {/* Payment method toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setPayMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${payMethod === 'card' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-base">credit_card</span>
                Cartao — recorrente
              </button>
              <button onClick={() => setPayMethod('pix')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all ${payMethod === 'pix' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                <span className="material-symbols-outlined text-base">qr_code_2</span>
                PIX — 1 mes
              </button>
            </div>

            {/* Card billing selector */}
            {payMethod === 'card' && (
              <div className="flex gap-3">
                {[['monthly', `Mensal — R$${plan.monthly}/mes`], ['yearly', `Anual — R$${plan.yearly}/ano`]].map(([k, label]) => (
                  <button key={k} onClick={() => setBilling(k)}
                    className={`flex-1 p-4 rounded-xl border-2 text-sm font-bold text-left transition-all ${billing === k ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <span className="block">{label}</span>
                    {k === 'yearly' && (
                      <span className="text-emerald-500 text-xs font-bold mt-1 block">Economize R${Math.round(plan.monthly * 12 - plan.yearly)}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* PIX info */}
            {payMethod === 'pix' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-1">Pagamento unico via PIX</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">O PIX nao e recorrente. Voce tera 30 dias de acesso ao plano {planDisplayName}. O QR Code expira em 30 minutos.</p>
                </div>
              </div>
            )}

            {/* Checkout button */}
            <button onClick={handleCheckout} disabled={loading}
              className={`w-full py-4 text-white font-bold rounded-2xl hover:opacity-90 shadow-lg text-base disabled:opacity-50 flex items-center justify-center gap-2 ${selectedPlan === 'business' ? 'bg-purple-600 shadow-purple-500/25' : 'bg-primary shadow-primary/25'}`}>
              {loading ? (
                <><span className="animate-spin material-symbols-outlined text-sm">refresh</span> Redirecionando ao Stripe...</>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">{payMethod === 'pix' ? 'qr_code_2' : 'lock'}</span>
                  {payMethod === 'pix'
                    ? `Pagar com PIX — R$${plan.monthly}`
                    : `Continuar para pagamento — R$${billing === 'yearly' ? plan.yearly : plan.monthly}${billing === 'yearly' ? '/ano' : '/mes'}`
                  }
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
              <span className="material-symbols-outlined text-sm">lock</span>
              Processado com seguranca pelo Stripe
            </div>
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-2">
            <div className={`rounded-2xl p-6 sticky top-24 text-white ${selectedPlan === 'business' ? 'bg-purple-600' : 'bg-primary'}`}>
              <h3 className="font-black text-base mb-5">Resumo do pedido</h3>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <img src="./favicon.png" alt="" className="w-8 h-8 rounded-lg" onError={e=>e.target.style.display='none'}/>
                </div>
                <div>
                  <p className="font-black">WeekFlow {planDisplayName}</p>
                  <p className="text-xs text-white/60">
                    {payMethod === 'pix' ? 'PIX — 1 mes' : (billing === 'monthly' ? 'Mensal' : 'Anual')}
                  </p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-semibold">R${payMethod === 'pix' ? plan.monthly : price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Impostos</span>
                  <span className="font-semibold">R$0,00</span>
                </div>
                {payMethod === 'card' && billing === 'yearly' && saving > 0 && (
                  <div className="flex justify-between text-sm text-emerald-300">
                    <span>Desconto anual</span>
                    <span className="font-bold">-R${saving}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-black text-lg border-t border-white/20 pt-4 mb-5">
                <span>Total</span>
                <span>R${payMethod === 'pix' ? plan.monthly : price}</span>
              </div>
              <div className="space-y-2">
                {(selectedPlan === 'business'
                  ? ['Tudo do Pro','Membros ilimitados','Painel do time','Delegar tarefas']
                  : ['Tarefas ilimitadas','IA ilimitada','Circles ilimitados','Sync na nuvem']
                ).map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-white/70">
                    <span className="text-white font-black">✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-white/50 justify-center">
                <span className="material-symbols-outlined text-sm">lock</span>
                SSL encriptado · Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
