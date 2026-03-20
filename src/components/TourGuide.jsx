import { useState, useEffect } from 'react'

const STEPS = [
  {
    target: null,
    title: '👋 Welcome to WeekFlow!',
    body: "Let's take a 30-second tour so you get the most out of your planner.",
    position: 'center',
  },
  {
    target: '[data-tour="sidebar"]',
    title: '📋 Navigation',
    body: 'Use the sidebar to switch between Dashboard, Planner, Notes, Calendar, Analytics and more.',
    position: 'right',
  },
  {
    target: '[data-tour="add-task"]',
    title: '➕ Add Tasks',
    body: 'Click here to create a new task — or press N on your keyboard anytime.',
    position: 'bottom',
  },
  {
    target: '[data-tour="search"]',
    title: '🔍 Global Search',
    body: 'Press ⌘K (or Ctrl+K) to instantly search all your tasks across the week.',
    position: 'bottom',
  },
  {
    target: '[data-tour="ai-btn"]',
    title: '🤖 AI Assistant',
    body: 'Tell the AI what you want in plain text — "Add gym Mon, Wed, Fri at 7am" — and it schedules it for you.',
    position: 'bottom',
  },
  {
    target: null,
    title: '🚀 You\'re all set!',
    body: "Start by adding your first task or let the AI build your week. You've got this!",
    position: 'center',
  },
]

const LS_TOUR = 'wf_tour_done'

export function useTour() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Show tour on first visit (after splash)
    const done = localStorage.getItem(LS_TOUR)
    if (!done) {
      const t = setTimeout(() => setShow(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const finish = () => {
    localStorage.setItem(LS_TOUR, '1')
    setShow(false)
  }

  return { show, setShow, finish }
}

export default function TourGuide({ onFinish }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  const next = () => isLast ? onFinish() : setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="fixed inset-0 z-[150] pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto" onClick={onFinish} />

      {/* Tooltip card — always centered for simplicity */}
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm pointer-events-auto"
          style={{ animation: 'tourIn 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-t-2xl overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-400 rounded-t-2xl"
              style={{ width: `${pct}%` }} />
          </div>

          <div className="p-6">
            {/* Step indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : i < step ? 'w-3 bg-primary/40' : 'w-3 bg-slate-200 dark:bg-slate-700'}`} />
                ))}
              </div>
              <button onClick={onFinish} className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
                Skip tour
              </button>
            </div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-4 text-2xl">
              {current.title.split(' ')[0]}
            </div>

            {/* Content */}
            <h3 className="font-black text-lg mb-2 leading-tight">{current.title.slice(3)}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{current.body}</p>

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-6">
              {!isFirst && (
                <button onClick={prev}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  ← Back
                </button>
              )}
              <button onClick={next}
                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2">
                {isLast ? (
                  <><span className="material-symbols-outlined text-sm">rocket_launch</span> Let's go!</>
                ) : (
                  <>Next <span className="material-symbols-outlined text-sm">arrow_forward</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourIn {
          from { opacity: 0; transform: scale(0.88) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
