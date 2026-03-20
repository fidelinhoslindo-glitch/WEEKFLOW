import { useApp } from '../context/AppContext'
import { useCountUp, useInView } from '../hooks/useAnimatedStats'

export default function DayProgressWidget({ day }) {
  const { tasks, categoryColors } = useApp()
  const [ref, inView] = useInView()

  const dayTasks  = tasks.filter(t => t.day === day)
  const done      = dayTasks.filter(t => t.completed).length
  const total     = dayTasks.length
  const pct       = total ? Math.round((done / total) * 100) : 0
  const animPct   = useCountUp(inView ? pct : 0, 1000)
  const animDone  = useCountUp(inView ? done : 0, 800)

  const catBreakdown = Object.entries(categoryColors)
    .map(([cat, c]) => ({ cat, c, count: dayTasks.filter(t => t.category === cat).length }))
    .filter(x => x.count > 0)

  const totalMins = dayTasks.reduce((s, t) => s + (t.duration || 0), 0)
  const doneMins  = dayTasks.filter(t => t.completed).reduce((s, t) => s + (t.duration || 0), 0)

  const msg = pct === 100 ? '🎉 Perfect day!' : pct >= 75 ? '🔥 Almost there!' : pct >= 50 ? '💪 Halfway done!' : pct > 0 ? '🚀 Keep going!' : '☀️ Let\'s get started!'

  return (
    <div ref={ref} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-5">
      {/* Top gradient bar */}
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-primary to-purple-500'}`}
          style={{ width: `${animPct}%` }}
        />
      </div>

      <div className="p-4 lg:p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Left: message + stats */}
          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - animPct / 100)}`}
                  className={pct === 100 ? 'text-emerald-500' : 'text-primary'}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-black ${pct === 100 ? 'text-emerald-500' : 'text-primary'}`}>{animPct}%</span>
              </div>
            </div>

            <div>
              <p className="text-lg font-black">{msg}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 dark:text-slate-200">{animDone}</span>/{total} tasks ·{' '}
                <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round(doneMins / 60 * 10) / 10}h</span>/{Math.round(totalMins / 60 * 10) / 10}h
              </p>
              {/* Category dots */}
              {catBreakdown.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {catBreakdown.map(({ cat, c, count }) => (
                    <span key={cat} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${c.bg} ${c.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {cat} ({count})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: next task */}
          {total > done && (() => {
            const next = dayTasks.find(t => !t.completed)
            if (!next) return null
            const c = categoryColors[next.category] || categoryColors.Work
            return (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.bg} ${c.border} shrink-0`}>
                <span className={`material-symbols-outlined text-sm ${c.text}`}>
                  {next.category==='Work'?'work':next.category==='Gym'?'fitness_center':next.category==='Study'?'school':next.category==='Rest'?'spa':'category'}
                </span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Next up</p>
                  <p className={`text-sm font-bold ${c.text} truncate max-w-32`}>{next.title}</p>
                  <p className="text-[10px] text-slate-400">{next.time} · {next.duration}min</p>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
