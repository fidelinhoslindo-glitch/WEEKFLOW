import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { getHoliday, resolveHolidayConflicts, generateSmartSuggestions, detectPatterns, detectRealPatterns, getWeeklyInsights, trackTaskCompletion } from '../utils/smartCalendar'

const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const DOW_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function statusColor(status) {
  return { online:'bg-emerald-500', away:'bg-amber-400', busy:'bg-red-500', offline:'bg-slate-400' }[status] || 'bg-slate-400'
}

export default function SmartCalendarPage() {
  const { tasks, addTask, addTasks, updateTask, pushToast, setShowAddTask, planLimits, isPro, navigate } = useApp()

  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [dismissedSuggestions, setDismissedSuggestions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wf_dismissed_suggestions') || '[]') } catch { return [] }
  })

  const year  = month.getFullYear()
  const mon   = month.getMonth()
  const first = new Date(year, mon, 1).getDay()
  const days  = new Date(year, mon + 1, 0).getDate()
  const totalCells = Math.ceil((first + days) / 7) * 7

  // Smart suggestions from current tasks
  const smartSuggestions = useMemo(() =>
    generateSmartSuggestions(tasks).filter(s => !dismissedSuggestions.includes(s.title)),
  [tasks, dismissedSuggestions])

  // Real patterns from actual usage history
  const realPatterns = useMemo(() => detectRealPatterns(), [])
  const weeklyInsights = useMemo(() => getWeeklyInsights(), [])

  // Pattern events from tasks
  const patternEvents = useMemo(() => {
    const all = [...detectRealPatterns(), ...tasks.filter(t => t.recurring).map(t => ({
      title: t.title, weekday: t.day, hour: parseInt(t.time), time: t.time, count: 3, confidence: 70, icon: '🔄',
      category: t.category, message: `"${t.title}" is recurring on ${t.day}s`,
    }))]
    return all.slice(0, 8)
  }, [tasks])

  // Track when user toggles task complete from calendar
  const handleTaskToggle = (task) => {
    if (!task.completed) trackTaskCompletion(task)
  }

  const getDayTasks = (date) => {
    const dow = new Date(year, mon, date).getDay()
    return tasks.filter(t => t.day === DOW_FULL[dow])
  }

  const getDayInfo = (date) => {
    const holiday = getHoliday(year, mon, date)
    const dayTasks = getDayTasks(date)
    const { tasks: resolved, conflicts } = resolveHolidayConflicts(dayTasks, year, mon, date)
    return { holiday, tasks: resolved, conflicts }
  }

  const clearDismissed = () => {
    setDismissedSuggestions([])
    try { localStorage.removeItem('wf_dismissed_suggestions') } catch {}
    pushToast('Suggestions reset!', 'info')
  }

  const acceptSuggestion = (s) => {
    if (s.action === 'make_recurring') {
      const matching = tasks.filter(t => t.title === s.title)
      matching.forEach(t => updateTask(t.id, { recurring: true }))
      pushToast(`✅ "${s.title}" is now recurring every week!`, 'success')
    } else if (s.action === 'suggest_rest') {
      addTask({ title: 'Rest & Recharge', category: 'Rest', day: 'Saturday', time: '14:00', duration: 90, priority: 'low', notes: 'Added by Smart Calendar', recurring: false, color: '' })
      pushToast('✅ Rest block added to Saturday!', 'success')
    }
    setDismissedSuggestions(p => [...p, s.title])
  }

  const dismissSuggestion = (s) => setDismissedSuggestions(p => {
    const next = [...p, s.title]
    try { localStorage.setItem('wf_dismissed_suggestions', JSON.stringify(next)) } catch {}
    return next
  })

  const selectedInfo = selected ? getDayInfo(selected) : null

  const today = new Date()
  const isToday = (d) => d === today.getDate() && mon === today.getMonth() && year === today.getFullYear()

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Smart Calendar" subtitle="Adapts to your habits automatically" />

        <main className="flex-1 p-4 lg:p-6 space-y-5 overflow-y-auto">

          {/* ── Smart Suggestions banner ── */}
          {!isPro && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-sm font-black">Sugestões de IA desativadas</p>
                  <p className="text-xs text-slate-500">Faça upgrade para Pro para receber sugestões inteligentes baseadas nos seus hábitos</p>
                </div>
              </div>
              <button onClick={() => navigate('checkout')}
                className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:opacity-90 shrink-0">
                Ver Pro →
              </button>
            </div>
          )}
          {isPro && showSuggestions && smartSuggestions.length > 0 && (
            <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h4 className="font-black text-sm">Smart Suggestions</h4>
                  <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full">{smartSuggestions.length}</span>
                </div>
                <button onClick={() => setShowSuggestions(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-2">
                {smartSuggestions.slice(0,3).map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl p-3 border border-primary/10">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">{s.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${s.confidence}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400">{s.confidence}% confidence</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => acceptSuggestion(s)}
                        className="px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all">
                        Add ✓
                      </button>
                      <button onClick={() => dismissSuggestion(s)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all">
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Insights from real usage */}
          {weeklyInsights.length > 0 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {weeklyInsights.map((ins, i) => (
                <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 shrink-0 text-sm font-medium">
                  <span className="text-lg">{ins.icon}</span>
                  <span className="text-slate-600 dark:text-slate-300">{ins.text}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

            {/* ── Calendar grid ── */}
            <div className="xl:col-span-3">
              {/* Month nav */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <button onClick={() => setMonth(new Date(year, mon - 1, 1))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h2 className="text-xl font-black min-w-44">{MONTHS[mon]} {year}</h2>
                <button onClick={() => setMonth(new Date(year, mon + 1, 1))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
                <button onClick={() => setMonth(new Date())} className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">Today</button>

                <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900/40" /> Holiday</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" /> Conflict</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/20" /> Tasks</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                  {DOW.map(d => (
                    <div key={d} className="py-3 text-center text-xs font-black uppercase tracking-wider text-slate-400">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: totalCells }, (_, ci) => {
                    const date = ci - first + 1
                    const inMonth = date >= 1 && date <= days
                    if (!inMonth) return <div key={ci} className="min-h-20 border-b border-r border-slate-50 dark:border-slate-800/50" />

                    const { holiday, tasks: dayTasks, conflicts } = getDayInfo(date)
                    const sel  = selected === date
                    const tod  = isToday(date)
                    const isWknd = ci % 7 === 0 || ci % 7 === 6
                    const hasConflict = conflicts.length > 0 && holiday

                    return (
                      <div key={ci} onClick={() => setSelected(date === selected ? null : date)}
                        className={`relative min-h-20 border-b border-r border-slate-100 dark:border-slate-800 cursor-pointer transition-all
                          ${sel ? 'ring-2 ring-inset ring-primary z-10' : ''}
                          ${holiday ? 'bg-amber-50/60 dark:bg-amber-900/10' : isWknd ? 'bg-slate-50/40 dark:bg-slate-800/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                        `}>

                        {/* Holiday bg */}
                        {holiday && <div className="absolute inset-0 opacity-20" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }} />}
                        {hasConflict && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-bl-lg" title="Holiday conflict" />}

                        <div className="relative p-1.5 h-full flex flex-col gap-0.5">
                          {/* Date + emoji */}
                          <div className="flex items-center justify-between">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black
                              ${tod ? 'bg-primary text-white shadow-md shadow-primary/40' : sel ? 'bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300'}
                            `}>{date}</span>
                            {holiday && <span className="text-sm leading-none">{holiday.emoji}</span>}
                          </div>

                          {/* Tasks */}
                          <div className="flex-1 space-y-0.5 overflow-hidden">
                            {dayTasks.slice(0,2).map((t, i) => (
                              <div key={i} className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${t._suspended ? 'line-through opacity-40 bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-primary/15 text-primary'}`}>
                                {t._suspended ? '🚫 ' : ''}{t.title}
                              </div>
                            ))}
                            {dayTasks.length > 2 && <span className="text-[9px] text-slate-400">+{dayTasks.length - 2}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Right panel: detail + patterns ── */}
            <div className="space-y-4">
              {/* Selected day detail */}
              {selected && selectedInfo && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className={`px-4 py-3 ${selectedInfo.holiday ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-sm">{MONTHS[mon]} {selected}</h3>
                        {selectedInfo.holiday && (
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            {selectedInfo.holiday.emoji} {selectedInfo.holiday.name}
                          </p>
                        )}
                      </div>
                      <button onClick={() => setShowAddTask(true)} className="p-1.5 bg-primary text-white rounded-lg hover:opacity-90">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    {selectedInfo.conflicts.length > 0 && selectedInfo.holiday && (
                      <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-3">
                        <span className="material-symbols-outlined text-red-500 text-sm shrink-0 mt-0.5">warning</span>
                        <div>
                          <p className="text-xs font-black text-red-600 dark:text-red-400">Holiday Conflict</p>
                          <p className="text-[10px] text-red-500">{selectedInfo.conflicts.length} task(s) scheduled on {selectedInfo.holiday.name}</p>
                        </div>
                      </div>
                    )}
                    {selectedInfo.tasks.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No tasks this day</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedInfo.tasks.map((t, i) => (
                          <div key={i} className={`flex items-center gap-2 p-2 rounded-xl ${t._suspended ? 'opacity-50 bg-red-50 dark:bg-red-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                            <span className={`w-2 h-2 rounded-full shrink-0 ${t._suspended ? 'bg-red-400' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-bold truncate ${t._suspended ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                              <p className="text-[10px] text-slate-400">{t.time} · {t.duration}min</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detected patterns */}
              {patternEvents.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">Detected Patterns</p>
                  </div>
                  <div className="space-y-2">
                    {patternEvents.slice(0,4).map((p, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-xl">
                        <span className="text-base">{p.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{p.title}</p>
                          <p className="text-[10px] text-slate-400">{p.weekday}s · {p.count}x detected</p>
                        </div>
                        <span className="text-[10px] font-black text-primary shrink-0">{p.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Smart Features</p>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 shrink-0">🏖️</span>
                    <span>Holiday conflicts auto-detected and highlighted</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary shrink-0">🔄</span>
                    <span>Recurring habits suggested after 3+ occurrences</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 shrink-0">⚖️</span>
                    <span>Work/rest balance monitored automatically</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500 shrink-0">🧠</span>
                    <span>Pattern engine learns from your routine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
