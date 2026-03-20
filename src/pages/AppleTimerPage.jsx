import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const LS_TIMERS = 'wf_timers_history'
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

const PRESETS = [
  { label: '1 min',  secs: 60,   color: '#6467f2', icon: 'timer' },
  { label: '5 min',  secs: 300,  color: '#10b981', icon: 'self_improvement' },
  { label: '10 min', secs: 600,  color: '#f59e0b', icon: 'coffee' },
  { label: '15 min', secs: 900,  color: '#8b5cf6', icon: 'fitness_center' },
  { label: '25 min', secs: 1500, color: '#6467f2', icon: 'psychology' },
  { label: '30 min', secs: 1800, color: '#ec4899', icon: 'menu_book' },
  { label: '45 min', secs: 2700, color: '#06b6d4', icon: 'work' },
  { label: '1 hora', secs: 3600, color: '#f97316', icon: 'sports_soccer' },
]

// ── Apple Watch ring SVG component ────────────────────────────────────────────
function WatchRing({ secs, total, color, size = 220, strokeWidth = 18, children }) {
  const r   = (size - strokeWidth * 2) / 2
  const circ = 2 * Math.PI * r
  const pct  = total > 0 ? Math.max(0, secs / total) : 0
  const offset = circ * (1 - pct)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute' }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="currentColor" strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800" />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ── Sound beep ────────────────────────────────────────────────────────────────
function playBeep(freq = 880, duration = 0.6) {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(); osc.stop(ctx.currentTime + duration)
  } catch {}
}

function fmtTime(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function AppleTimerPage() {
  const { pushToast, sendPushNotification } = useApp()

  // Active timers (can have multiple)
  const [timers, setTimers] = useState([
    { id: 1, label: 'Focus', total: 1500, remaining: 1500, running: false, color: '#6467f2', icon: 'psychology' },
  ])
  const [activeId,    setActiveId]    = useState(1)
  const [history,     setHistory]     = useState(() => load(LS_TIMERS, []))
  const [showCustom,  setShowCustom]  = useState(false)
  const [customMins,  setCustomMins]  = useState(25)
  const [customLabel, setCustomLabel] = useState('')
  const [customColor, setCustomColor] = useState('#6467f2')
  const [showPresets, setShowPresets] = useState(false)
  const ivRefs = useRef({})

  const activeTimer = timers.find(t => t.id === activeId) || timers[0]

  // Tick each running timer - using stable ref-based approach
  const timersRef = useRef(timers)
  timersRef.current = timers

  useEffect(() => {
    const iv = setInterval(() => {
      setTimers(prev => {
        let changed = false
        const next = prev.map(t => {
          if (!t.running) return t
          if (t.remaining <= 1) {
            playBeep(660, 1.2)
            sendPushNotification?.('⏰ Timer done!', `"${t.label}" finished!`)
            pushToast(`⏰ "${t.label}" timer done!`, 'success')
            const entry = { id: Date.now(), label: t.label, mins: Math.round(t.total / 60), date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }
            setHistory(h => { const n = [entry,...h].slice(0,50); save(LS_TIMERS,n); return n })
            changed = true
            return { ...t, remaining: 0, running: false }
          }
          changed = true
          return { ...t, remaining: t.remaining - 1 }
        })
        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [pushToast, sendPushNotification])

  const toggleTimer = (id) => setTimers(prev => prev.map(t => t.id === id ? { ...t, running: !t.running } : t))
  const resetTimer  = (id) => setTimers(prev => prev.map(t => t.id === id ? { ...t, remaining: t.total, running: false } : t))
  const removeTimer = (id) => { clearInterval(ivRefs.current[id]); delete ivRefs.current[id]; setTimers(prev => prev.filter(t => t.id !== id)); if (activeId === id) setActiveId(timers[0]?.id) }

  const addTimer = (preset) => {
    const id = Date.now()
    setTimers(prev => [...prev, { id, label: preset.label, total: preset.secs, remaining: preset.secs, running: false, color: preset.color, icon: preset.icon }])
    setActiveId(id)
    setShowPresets(false)
  }

  const addCustom = () => {
    if (!customMins || customMins < 1) return
    const id = Date.now()
    const secs = customMins * 60
    setTimers(prev => [...prev, { id, label: customLabel || `${customMins}m Timer`, total: secs, remaining: secs, running: false, color: customColor, icon: 'timer' }])
    setActiveId(id); setShowCustom(false); setCustomMins(25); setCustomLabel('')
  }

  const pct = activeTimer ? Math.round((1 - activeTimer.remaining / activeTimer.total) * 100) : 0

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Timer" subtitle="Apple-style focus timer" />
        <main className="flex-1 p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Main watch ring ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Main ring display */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center gap-6">
              {activeTimer && (
                <>
                  {/* Stacked rings for multiple timers (Apple Watch Activity style) */}
                  <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
                    {/* Outer ring — active timer */}
                    <WatchRing secs={activeTimer.remaining} total={activeTimer.total} color={activeTimer.color} size={260} strokeWidth={20}>
                      {/* Inner decorative ring if multiple timers */}
                      {timers.length > 1 && (() => {
                        const second = timers.find(t => t.id !== activeId)
                        if (!second) return null
                        return (
                          <div className="absolute" style={{ width: 200, height: 200 }}>
                            <WatchRing secs={second.remaining} total={second.total} color={second.color} size={200} strokeWidth={16}>
                              <div />
                            </WatchRing>
                          </div>
                        )
                      })()}

                      {/* Center content */}
                      <div className="flex flex-col items-center gap-1 z-10">
                        <span className="material-symbols-outlined text-3xl" style={{ color: activeTimer.color }}>{activeTimer.icon}</span>
                        <span className="text-4xl font-black tabular-nums" style={{ color: activeTimer.color }}>
                          {fmtTime(activeTimer.remaining)}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{activeTimer.label}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-600">{pct}% elapsed</span>
                      </div>
                    </WatchRing>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    <button onClick={() => resetTimer(activeTimer.id)}
                      className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105">
                      <span className="material-symbols-outlined">refresh</span>
                    </button>

                    <button onClick={() => toggleTimer(activeTimer.id)}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl transition-all hover:scale-110 active:scale-95"
                      style={{ backgroundColor: activeTimer.color, boxShadow: `0 8px 32px ${activeTimer.color}60` }}>
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {activeTimer.running ? 'pause' : 'play_arrow'}
                      </span>
                    </button>

                    <button onClick={() => removeTimer(activeTimer.id)}
                      className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-105">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Timer tabs (multiple active timers) */}
            {timers.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {timers.map(t => (
                  <button key={t.id} onClick={() => setActiveId(t.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 shrink-0 transition-all ${activeId === t.id ? 'border-current shadow-md' : 'border-slate-200 dark:border-slate-700'}`}
                    style={{ borderColor: activeId === t.id ? t.color : undefined }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-sm font-bold">{t.label}</span>
                    <span className="text-xs text-slate-400 tabular-nums">{fmtTime(t.remaining)}</span>
                    {t.running && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.color }} />}
                  </button>
                ))}
              </div>
            )}

            {/* Add timer row */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary text-sm">add_alarm</span>
                Quick timer
              </button>
              <button onClick={() => setShowCustom(!showCustom)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold hover:border-primary transition-all">
                <span className="material-symbols-outlined text-primary text-sm">tune</span>
                Custom
              </button>
            </div>

            {/* Preset grid */}
            {showPresets && (
              <div className="grid grid-cols-4 gap-3">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => addTimer(p)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-transparent hover:border-current transition-all hover:shadow-md group"
                    style={{ backgroundColor: p.color + '15', '--tw-border-opacity': 1 }}>
                    <span className="material-symbols-outlined text-2xl" style={{ color: p.color }}>{p.icon}</span>
                    <span className="text-xs font-black" style={{ color: p.color }}>{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Custom timer form */}
            {showCustom && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
                <h4 className="font-black">Custom Timer</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Label</label>
                    <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                      placeholder="e.g. Reading" value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Minutes</label>
                    <input type="number" min={1} max={480}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                      value={customMins} onChange={e => setCustomMins(Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Ring Color</label>
                  <div className="flex gap-2">
                    {['#6467f2','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316'].map(c => (
                      <button key={c} onClick={() => setCustomColor(c)}
                        className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${customColor===c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <button onClick={addCustom}
                  className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: customColor }}>
                  Add Timer
                </button>
              </div>
            )}
          </div>

          {/* ── Right: History + Stats ── */}
          <div className="space-y-5">
            {/* Today stats */}
            <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, #6467f2, #8b5cf6)' }}>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-3">Today</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black">{history.filter(h => h.date === new Date().toLocaleDateString()).length}</p>
                  <p className="text-xs opacity-70 mt-0.5">Sessions</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black">
                    {history.filter(h => h.date === new Date().toLocaleDateString()).reduce((s, h) => s + h.mins, 0)}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">Minutes</p>
                </div>
              </div>
            </div>

            {/* Active timers mini list */}
            {timers.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">Active Timers</p>
                <div className="space-y-2">
                  {timers.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ backgroundColor: t.color + '10' }}>
                      <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                          <circle cx="16" cy="16" r="12" fill="none" stroke={t.color + '30'} strokeWidth="4" />
                          <circle cx="16" cy="16" r="12" fill="none" stroke={t.color} strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 12}`}
                            strokeDashoffset={`${2 * Math.PI * 12 * (1 - (t.total > 0 ? (1 - t.remaining/t.total) : 0))}`} />
                        </svg>
                        <span className="absolute text-[8px] font-black" style={{ color: t.color }}>
                          {Math.round((1 - t.remaining/t.total)*100)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{t.label}</p>
                        <p className="text-[10px] text-slate-400 tabular-nums">{fmtTime(t.remaining)} left</p>
                      </div>
                      {t.running && <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: t.color }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">Recent Sessions</p>
                {history.length > 0 && (
                  <button onClick={() => { setHistory([]); save(LS_TIMERS, []) }} className="text-xs text-red-400 hover:text-red-600">Clear</button>
                )}
              </div>
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">timer</span>
                  <p className="text-xs text-slate-400">Complete a timer to see history</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {history.slice(0, 20).map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-base">⏱️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{h.label}</p>
                        <p className="text-[10px] text-slate-400">{h.date} · {h.time}</p>
                      </div>
                      <span className="text-xs font-black text-primary shrink-0">{h.mins}m</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
