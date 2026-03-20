import { useEffect, useState } from 'react'

const STEPS = [
  { icon: 'calendar_view_week', label: 'Loading your schedule…', delay: 0    },
  { icon: 'task_alt',           label: 'Syncing your tasks…',    delay: 900  },
  { icon: 'insights',           label: 'Crunching your stats…',  delay: 1700 },
  { icon: 'rocket_launch',      label: 'Ready to flow!',         delay: 2400 },
]

export default function SplashScreen({ onDone }) {
  const [step,    setStep]    = useState(0)
  const [pct,     setPct]     = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    // Progress bar smooth fill
    let start = null
    const total = 3000
    const raf = (ts) => {
      if (!start) start = ts
      const elapsed = ts - start
      setPct(Math.min(100, Math.round((elapsed / total) * 100)))
      if (elapsed < total) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    // Step transitions
    STEPS.forEach(s => {
      if (s.delay > 0) setTimeout(() => setStep(i => i + 1), s.delay)
    })

    // Fade out and call onDone
    setTimeout(() => setLeaving(true), 3100)
    setTimeout(() => onDone?.(), 3500)
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center transition-all ${leaving ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`} style={{ backgroundColor: '#101122', transition: 'opacity 400ms ease, transform 400ms ease' }}
      
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
      </div>

      {/* Logo */}
      <div className="relative mb-10 flex flex-col items-center">
        <div className="relative">
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-3xl border-2 border-primary/30 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 relative">
            <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_view_week</span>
          </div>
          {/* Sparkles */}
          {[0,1,2,3].map(i => (
            <div key={i} className="absolute w-2 h-2 bg-primary rounded-full animate-ping"
              style={{
                top:  i < 2 ? '-4px' : 'auto',
                bottom: i >= 2 ? '-4px' : 'auto',
                left:  i % 2 === 0 ? '-4px' : 'auto',
                right: i % 2 === 1 ? '-4px' : 'auto',
                animationDelay: `${i * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>
        <h1 className="text-4xl font-black text-white mt-6 tracking-tight">WeekFlow</h1>
        <p className="text-primary/70 text-sm font-medium mt-1">Organize your week, find your flow.</p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-col items-center gap-3 mb-10 h-16 justify-center">
        {STEPS.map((s, i) => (
          <div key={i}
            className={`flex items-center gap-3 transition-all duration-500 ${step === i ? 'opacity-100 translate-y-0 scale-105' : step > i ? 'opacity-0 -translate-y-4 scale-95 absolute' : 'opacity-0 translate-y-4 scale-95 absolute'}`}
            style={{ position: step === i ? 'relative' : 'absolute' }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step >= i ? 'bg-primary text-white' : 'bg-slate-800 text-slate-600'}`}>
              <span className="material-symbols-outlined text-sm">{s.icon}</span>
            </div>
            <span className="text-slate-300 text-sm font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-100"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-slate-600 text-xs font-mono mt-2">{pct}%</p>

      {/* Dots loader */}
      <div className="flex gap-2 mt-8">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}
