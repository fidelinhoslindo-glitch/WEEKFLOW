import { useRef, useState, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'

// ---------------------------------------------------------------------------
// Motivational insight — tries Groq first, falls back to static messages
// ---------------------------------------------------------------------------
const STATIC_INSIGHTS = [
  { minPct: 80, text: 'Semana incrível! Você está no seu melhor ritmo. Continue assim e conquiste cada meta!' },
  { minPct: 60, text: 'Ótima semana! Sua consistência está fazendo a diferença. Continue assim e você vai longe.' },
  { minPct: 40, text: 'Boa semana! Cada tarefa concluída é um passo à frente. Você está construindo algo sólido.' },
  { minPct: 20, text: 'Semana de progresso! O importante é não parar. Cada pequeno avanço conta muito.' },
  { minPct:  0, text: 'Uma nova semana começa. Você tem tudo para arrasar e superar seus próprios limites!' },
]

function getStaticInsight(pct) {
  return STATIC_INSIGHTS.find(i => pct >= i.minPct)?.text || STATIC_INSIGHTS.at(-1).text
}

async function fetchGroqInsight(completed, total, activeDays) {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key) return null
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 80,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'Você é um coach motivacional do WeekFlow. Responda APENAS com o texto da mensagem, sem JSON, sem aspas extras, sem emojis no início.',
          },
          {
            role: 'user',
            content: `O usuário completou ${completed} de ${total} tarefas esta semana, com ${activeDays} dias ativos. Gere uma frase motivacional curta e personalizada em português (máx 2 frases).`,
          },
        ],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Helper: get current week date range string (e.g. "24 mar – 30 mar 2026")
// ---------------------------------------------------------------------------
function getWeekRange() {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const mon = new Date(now)
  mon.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1))
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)

  const fmt = (d) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')

  return `${fmt(mon)} – ${fmt(sun)} ${sun.getFullYear()}`
}

// ---------------------------------------------------------------------------
// Widget card (pure presentational + export logic)
// ---------------------------------------------------------------------------
export default function WeeklySummaryWidget({ onClose }) {
  const { tasks, weekDays, getTasksForDay, completionRate, user, isPro, isBusiness } = useApp()

  const cardRef = useRef(null)
  const [insight, setInsight] = useState('')
  const [loadingInsight, setLoadingInsight] = useState(true)
  const [exporting, setExporting] = useState(false)

  // --- compute stats ---
  const completed   = tasks.filter(t => t.completed).length
  const total       = tasks.length
  const weekRange   = getWeekRange()

  // active days = days that have at least 1 completed task
  const activeDays = weekDays.filter(day => {
    const dayTasks = getTasksForDay(day)
    return dayTasks.some(t => t.completed)
  }).length

  // events = tasks that have a time (rough proxy for "events")
  const events = tasks.filter(t => t.time).length

  const pct = completionRate

  const planLabel = isPro ? 'Pro' : isBusiness ? 'Business' : 'Free'
  const planColors = {
    Pro: 'from-violet-500 to-indigo-500',
    Business: 'from-amber-500 to-orange-500',
    Free: 'from-slate-500 to-slate-600',
  }

  // --- load AI insight ---
  useEffect(() => {
    let cancelled = false
    setLoadingInsight(true)
    fetchGroqInsight(completed, total, activeDays).then(aiText => {
      if (cancelled) return
      setInsight(aiText || getStaticInsight(pct))
      setLoadingInsight(false)
    })
    return () => { cancelled = true }
  }, [completed, total, activeDays, pct])

  // --- export ---
  const handleExport = useCallback(async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      // Dynamic import so the bundle stays lean until needed
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      const today = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `weekflow-resumo-${today}.png`
      a.click()
    } catch (err) {
      console.error('Export failed:', err)
    }
    setExporting(false)
  }, [exporting])

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div className="w-full max-w-sm flex flex-col gap-3">
        {/* ---- CARD ---- */}
        <div
          ref={cardRef}
          className="relative rounded-3xl overflow-hidden p-6 select-none"
          style={{
            background: 'linear-gradient(145deg, #0d0f1c 0%, #1a1a2e 60%, #16213e 100%)',
            boxShadow: '0 32px 80px rgba(100,103,242,0.35)',
          }}
        >
          {/* Decorative blobs */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #6467f2 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
          />

          {/* Header row */}
          <div className="relative flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6467f2, #a78bfa)' }}
              >
                <span className="text-white font-black text-xs">W</span>
              </div>
              <span className="text-white font-bold text-sm tracking-wide">WeekFlow</span>
            </div>
            <span className="text-white/40 text-xs">{weekRange}</span>
          </div>

          {/* Title */}
          <h2 className="relative text-white font-black text-xl mb-1 leading-tight">
            Sua Semana em Resumo
          </h2>
          <p className="relative text-white/50 text-xs mb-5">Gerado por IA · WeekFlow</p>

          {/* Stats 2x2 grid */}
          <div className="relative grid grid-cols-2 gap-3 mb-5">
            <StatCard icon="✅" value={completed} label="tarefas concluídas" color="#6467f2" />
            <StatCard icon="📅" value={events}    label="eventos esta semana" color="#818cf8" />
            <StatCard icon="🔥" value={activeDays} label="dias ativos"        color="#f59e0b" />
            <StatCard icon="⚡" value={total}      label="tarefas criadas"    color="#34d399" />
          </div>

          {/* AI insight */}
          <div
            className="relative rounded-2xl p-4 mb-5"
            style={{ background: 'rgba(100,103,242,0.12)', border: '1px solid rgba(100,103,242,0.25)' }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg, #6467f2, #a78bfa)' }}
              >
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              {loadingInsight ? (
                <div className="flex gap-1 items-center mt-1.5">
                  {[0, 0.15, 0.3].map((d, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                      style={{ animationDelay: `${d}s` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white/85 text-sm leading-relaxed">{insight}</p>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-white/60 text-xs font-medium">Taxa de conclusão</span>
              <span className="text-white font-bold text-sm">{pct}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #6467f2, #a78bfa)',
                }}
              />
            </div>
          </div>

          {/* Footer: user + plan badge */}
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">
                {user?.name || user?.email?.split('@')[0] || 'Usuário'}
              </p>
              <p className="text-white/40 text-xs">weekflow.space</p>
            </div>
            <span
              className={`text-white text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${planColors[planLabel]}`}
            >
              {planLabel}
            </span>
          </div>
        </div>

        {/* ---- ACTION BUTTONS (outside card so they don't appear in export) ---- */}
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || loadingInsight}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6467f2, #a78bfa)' }}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              download
            </span>
            {exporting ? 'Exportando...' : 'Exportar como imagem'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl text-sm font-bold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

// Small stat card used inside the widget
function StatCard({ icon, value, label, color }) {
  return (
    <div
      className="rounded-2xl p-3.5"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-white font-black text-xl leading-none" style={{ color }}>
          {value}
        </span>
      </div>
      <p className="text-white/50 text-xs leading-tight">{label}</p>
    </div>
  )
}
