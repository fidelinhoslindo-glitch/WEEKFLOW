import { useState } from 'react'
import { useApp } from '../context/AppContext'

const PLANS = {
  monthly: { price: 19, label: '/mês', saving: null, currency: 'R$' },
  yearly:  { price: 152, label: '/ano', saving: 'Economize R$76', currency: 'R$' },
}

const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SB_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const FREE_FEATURES = [
  'Até 15 tarefas simultâneas',
  'Planner semanal completo',
  '1 FlowCircle (até 3 membros)',
  '5 mensagens de IA por dia',
  'App web + mobile + desktop',
]

const PRO_FEATURES = [
  'Tudo do Free, mais:',
  'Tarefas ilimitadas',
  'IA ilimitada (Groq)',
  'Circles ilimitados + membros ilimitados',
  'Detector de Colisão',
  'Janela Livre automática',
  'FlowStreak completo + Escudos + Pacto de Semana',
  'Previsão da Semana (todo domingo)',
  'Analytics completo (90 dias)',
  'Smart Calendar com sugestões de IA',
  'Sync na nuvem (Supabase)',
  'Google Calendar sync',
  'Suporte prioritário',
]

export default function CheckoutPage() {
  const { navigate, user, pushToast, setUser, confetti: _c, setConfetti } = useApp()
  const sbToken = localStorage.getItem('wf_token')

  const [billing,  setBilling]  = useState('monthly')
  const [step,     setStep]     = useState('plan')   // plan | payment | success
  const [loading,  setLoading]  = useState(false)
  const [card,     setCard]     = useState({ number:'', exp:'', cvv:'', name: user?.name || '' })
  const [errors,   setErrors]   = useState({})

  const plan = PLANS[billing]

  function validate() {
    const e = {}
    const num = card.number.replace(/\s/g,'')
    if (num.length < 16)         e.number = 'Número do cartão inválido'
    if (card.exp.length < 5)     e.exp    = 'Validade inválida'
    if (card.cvv.length < 3)     e.cvv    = 'CVV inválido'
    if (!card.name.trim())       e.name   = 'Nome obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay() {
    if (!validate()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))

    try {
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

      const updatedUser = { ...user, plan:'Pro' }
      localStorage.setItem('wf_user', JSON.stringify(updatedUser))
      if (setUser) setUser(updatedUser)
      if (setConfetti) setConfetti(true)

      setStep('success')
    } catch {
      pushToast('Pagamento processado! Plano atualizado.', 'success')
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

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <span className="material-symbols-outlined text-emerald-500 text-6xl" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
        </div>
        <h1 className="text-4xl font-black mb-3">Você é Pro! 🎉</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Todos os recursos foram desbloqueados. Aproveite!</p>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-8 text-left space-y-3">
          {['Tarefas ilimitadas','IA ilimitada (Groq)','Circles ilimitados','Sync na nuvem','Analytics 90 dias','Suporte prioritário'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
              <span className="text-sm font-medium">{f}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('dashboard')}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25 text-base">
          Ir para o app →
        </button>
      </div>
    </div>
  )

  // ── Main layout ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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

      {/* Step 1: Plan selection — two card layout */}
      {step === 'plan' && (
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="text-3xl font-black text-center mb-2">Escolha seu plano</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-10">Comece grátis. Faça upgrade quando estiver pronto.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-5 sm:p-8 flex flex-col">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full mb-5 self-start">
                Grátis para sempre
              </div>
              <p className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Free</p>
              <p className="text-4xl sm:text-5xl font-black mb-1">R$0</p>
              <p className="text-slate-400 text-sm mb-6">Sem cartão. Sem prazo.</p>
              <ul className="space-y-2.5 flex-1 mb-8">
                {FREE_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className="text-emerald-500 font-black mt-0.5 shrink-0">✓</span>
                    <span className="text-slate-600 dark:text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('dashboard')}
                className="w-full py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold hover:border-slate-400 transition-all">
                Continuar grátis
              </button>
            </div>

            {/* Pro card */}
            <div className="bg-primary rounded-2xl p-5 sm:p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-primary/30">
              <div className="absolute top-5 right-5 bg-white text-primary text-xs font-black px-3 py-1 rounded-full">
                Mais Popular
              </div>

              {/* Billing toggle */}
              <div className="flex bg-white/10 rounded-xl p-1 mb-5 self-start">
                {Object.entries(PLANS).map(([k, p]) => (
                  <button key={k} onClick={() => setBilling(k)}
                    className={`relative px-4 py-1.5 rounded-lg text-xs font-black transition-all ${billing === k ? 'bg-white text-primary shadow-sm' : 'text-white/70 hover:text-white'}`}>
                    {k === 'monthly' ? 'Mensal' : 'Anual'}
                    {k === 'yearly' && <span className="absolute -top-2 -right-2 bg-emerald-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">-33%</span>}
                  </button>
                ))}
              </div>

              <p className="text-sm font-black uppercase tracking-wider text-white/70 mb-2">Pro</p>
              <div className="mb-1">
                <span className="text-4xl sm:text-5xl font-black text-white">{plan.currency}{plan.price}</span>
                <span className="text-white/70 text-base ml-1">{plan.label}</span>
              </div>
              {plan.saving && (
                <p className="text-emerald-300 text-xs font-bold mb-6">{plan.saving}</p>
              )}
              {!plan.saving && <p className="text-white/50 text-xs mb-6">{billing === 'yearly' ? '' : `ou R$152/ano — economize R$76`}</p>}

              <ul className="space-y-2.5 flex-1 mb-8">
                {PRO_FEATURES.map((f, i) => (
                  <li key={f} className={`flex items-start gap-2.5 text-sm text-white ${i === 0 ? 'font-black text-white/60 text-xs uppercase tracking-wider pt-1' : ''}`}>
                    {i > 0 && <span className="text-white/80 font-black mt-0.5 shrink-0">✓</span>}
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setStep('payment')}
                className="w-full py-3.5 rounded-xl bg-white text-primary font-black hover:bg-white/90 transition-all shadow-lg">
                Começar Pro →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <div className="max-w-3xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">✓</div>
              <span className="text-sm font-semibold text-slate-400">Plano</span>
              <span className="material-symbols-outlined text-slate-300 text-sm">chevron_right</span>
              <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">2</div>
              <span className="text-sm font-semibold">Pagamento</span>
            </div>

            <h2 className="text-2xl font-black">Dados do cartão</h2>

            <div className="space-y-4">
              {/* Card number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Número do cartão</label>
                <div className="relative">
                  <input
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.number?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                    placeholder="0000 0000 0000 0000"
                    value={card.number}
                    onChange={e => setCard(c=>({...c,number:formatCard(e.target.value)}))}
                    maxLength={19}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                    {['VISA','MC','AMEX'].map(b => (
                      <div key={b} className="w-9 h-5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black flex items-center justify-center text-slate-400">{b}</div>
                    ))}
                  </div>
                </div>
                {errors.number && <p className="text-red-400 text-xs mt-1">{errors.number}</p>}
              </div>

              {/* Exp + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Validade (MM/AA)</label>
                  <input
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.exp?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                    placeholder="MM/AA"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Nome no cartão</label>
                <input
                  className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all bg-white dark:bg-slate-900 ${errors.name?'border-red-400':'border-slate-200 dark:border-slate-700'}`}
                  placeholder="Seu nome completo"
                  value={card.name}
                  onChange={e => setCard(c=>({...c,name:e.target.value}))}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
                <p className="text-xs text-amber-700 dark:text-amber-300">Este é um checkout simulado. Nenhum pagamento real é processado.</p>
              </div>

              <button onClick={handlePay} disabled={loading}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:opacity-90 shadow-lg shadow-primary/25 text-base disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? (
                  <><span className="animate-spin material-symbols-outlined text-sm">refresh</span> Processando...</>
                ) : (
                  <><span className="material-symbols-outlined text-sm">lock</span> Confirmar pagamento — {plan.currency}{plan.price}{plan.label}</>
                )}
              </button>
            </div>
          </div>

          {/* Right — order summary */}
          <div className="lg:col-span-2">
            <div className="bg-primary rounded-2xl p-6 sticky top-24 text-white">
              <h3 className="font-black text-base mb-5">Resumo do pedido</h3>
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <img src="./favicon.png" alt="" className="w-8 h-8 rounded-lg" onError={e=>e.target.style.display='none'}/>
                </div>
                <div>
                  <p className="font-black">WeekFlow Pro</p>
                  <p className="text-xs text-white/60 capitalize">{billing === 'monthly' ? 'Mensal' : 'Anual'}</p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-semibold">{plan.currency}{plan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Impostos</span>
                  <span className="font-semibold">R$0,00</span>
                </div>
                {billing === 'yearly' && (
                  <div className="flex justify-between text-sm text-emerald-300">
                    <span>Desconto anual</span>
                    <span className="font-bold">-R$76</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between font-black text-lg border-t border-white/20 pt-4 mb-5">
                <span>Total</span>
                <span>{plan.currency}{plan.price}</span>
              </div>
              <div className="space-y-2">
                {['Tarefas ilimitadas','IA ilimitada','Circles ilimitados','Sync na nuvem'].map(f => (
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
