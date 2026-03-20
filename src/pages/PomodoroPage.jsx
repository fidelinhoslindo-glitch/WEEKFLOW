import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MODES = [
  { id: 'focus',  label: 'Focus',       mins: 25, color: 'text-primary',     bg: 'bg-primary',     ring: 'stroke-primary' },
  { id: 'short',  label: 'Short Break', mins: 5,  color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'stroke-emerald-500' },
  { id: 'long',   label: 'Long Break',  mins: 15, color: 'text-purple-500',  bg: 'bg-purple-500',  ring: 'stroke-purple-500' },
]

const LS_POMO = 'wf_pomodoro_history'
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb } catch { return fb } }
const save = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

export default function PomodoroPage() {
  const { tasks, pushToast, sendPushNotification, planLimits, isPro, navigate } = useApp()

  const [modeIdx,  setModeIdx]  = useState(0)
  const [seconds,  setSeconds]  = useState(MODES[0].mins * 60)
  const [running,  setRunning]  = useState(false)
  const [session,  setSession]  = useState(1)           // current session number
  const [history,  setHistory]  = useState(() => load(LS_POMO, []))
  const [linkedTask, setLinkedTask] = useState(null)
  const [settings, setSettings] = useState({ focusMins: 25, shortMins: 5, longMins: 15, autoBreak: true, sound: true })
  const [showSettings, setShowSettings] = useState(false)
  const [showFreeTimer, setShowFreeTimer] = useState(false)
  const [freeInput, setFreeInput] = useState({ h: 0, m: 5, s: 0 })
  const [freeSecs, setFreeSecs] = useState(5 * 60)
  const [freeRunning, setFreeRunning] = useState(false)
  const freeRef = useRef(null)

  useEffect(() => {
    if (freeRunning) {
      freeRef.current = setInterval(() => {
        setFreeSecs(s => {
          if (s <= 1) { setFreeRunning(false); clearInterval(freeRef.current); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(freeRef.current)
    }
    return () => clearInterval(freeRef.current)
  }, [freeRunning])

  const freeTotal = freeInput.h * 3600 + freeInput.m * 60 + freeInput.s
  const freeProgress = freeTotal > 0 ? 1 - freeSecs / freeTotal : 0
  const freeMM = String(Math.floor(freeSecs / 60)).padStart(2, '0')
  const freeSS = String(freeSecs % 60).padStart(2, '0')
  const freeHH = String(Math.floor(freeSecs / 3600)).padStart(2, '0')

  const intervalRef = useRef(null)
  const mode = MODES[modeIdx]
  const totalSecs = (modeIdx === 0 ? settings.focusMins : modeIdx === 1 ? settings.shortMins : settings.longMins) * 60

  // beep on complete
  const beep = useCallback(() => {
    if (!settings.sound) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start(); osc.stop(ctx.currentTime + 0.8)
    } catch {}
  }, [settings.sound])

  // tick
  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          handleComplete()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, modeIdx])

  const handleComplete = useCallback(() => {
    beep()
    if (modeIdx === 0) {
      // completed a focus session
      const entry = {
        id: Date.now(),
        task: linkedTask?.title || 'Free focus',
        mins: settings.focusMins,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        session,
      }
      const newHistory = [entry, ...history].slice(0, 50)
      setHistory(newHistory)
      save(LS_POMO, newHistory)
      pushToast(`🍅 Focus session #${session} complete! Great work!`, 'success')
      setSession(s => s + 1)
      if (settings.autoBreak) {
        const nextMode = session % 4 === 0 ? 2 : 1   // every 4 sessions → long break
        setModeIdx(nextMode)
        setSeconds(nextMode === 2 ? settings.longMins * 60 : settings.shortMins * 60)
      }
    } else {
      pushToast('Break over! Ready to focus again? 🚀', 'info')
      if (settings.autoBreak) {
        setModeIdx(0)
        setSeconds(settings.focusMins * 60)
      }
    }
  }, [modeIdx, session, history, linkedTask, settings, beep, pushToast])

  const switchMode = (idx) => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setModeIdx(idx)
    const mins = idx === 0 ? settings.focusMins : idx === 1 ? settings.shortMins : settings.longMins
    setSeconds(mins * 60)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    const mins = modeIdx === 0 ? settings.focusMins : modeIdx === 1 ? settings.shortMins : settings.longMins
    setSeconds(mins * 60)
  }

  const clearHistory = () => { setHistory([]); save(LS_POMO, []) }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  const progress = 1 - seconds / totalSecs
  const circumference = 2 * Math.PI * 90
  const dashOffset = circumference * (1 - progress)

  const focusSessions = history.filter(h => h.date === new Date().toLocaleDateString()).length
  const totalFocusMins = history.filter(h => h.date === new Date().toLocaleDateString()).reduce((s, h) => s + h.mins, 0)

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Pomodoro Timer" subtitle="Deep focus sessions" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Left: Timer ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode tabs */}
            <div className="flex gap-2 bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800">
              {MODES.map((m, i) => (
                <button key={m.id} onClick={() => { setShowFreeTimer(false); switchMode(i) }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${!showFreeTimer && modeIdx === i ? `${m.bg} text-white shadow-md` : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {m.label}
                </button>
              ))}
              <button onClick={() => { setShowFreeTimer(true); setFreeRunning(false) }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${showFreeTimer ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                Timer
              </button>
            </div>

            {/* Free Timer */}
            {showFreeTimer && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-8">
                <div className="relative">
                  <svg width="220" height="220" className="-rotate-90">
                    <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800"/>
                    <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - freeProgress)}
                      className="stroke-amber-500"
                      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black tabular-nums text-amber-500">
                      {freeSecs >= 3600 ? `${freeHH}:${freeMM}:${freeSS}` : `${freeMM}:${freeSS}`}
                    </span>
                    <span className="text-sm font-bold text-slate-400 mt-1">Free Timer</span>
                  </div>
                </div>
                {/* Duration inputs */}
                {!freeRunning && freeSecs === freeTotal && (
                  <div className="flex gap-4 items-end">
                    {[{ label: 'Hours', key: 'h', max: 23 }, { label: 'Min', key: 'm', max: 59 }, { label: 'Sec', key: 's', max: 59 }].map(f => (
                      <div key={f.key} className="flex flex-col items-center gap-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">{f.label}</label>
                        <input
                          type="number" min={0} max={f.max}
                          value={freeInput[f.key]}
                          onChange={e => {
                            const val = Math.max(0, Math.min(f.max, Number(e.target.value)))
                            const next = { ...freeInput, [f.key]: val }
                            setFreeInput(next)
                            setFreeSecs(next.h * 3600 + next.m * 60 + next.s)
                          }}
                          className="w-16 text-center text-2xl font-black rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <button onClick={() => { setFreeRunning(false); setFreeSecs(freeTotal) }}
                    className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                  <button onClick={() => setFreeRunning(r => !r)} disabled={freeSecs === 0}
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 bg-amber-500 disabled:opacity-40">
                    <span className="material-symbols-outlined text-4xl fill-icon">{freeRunning ? 'pause' : 'play_arrow'}</span>
                  </button>
                  <div className="w-12 h-12" />
                </div>
              </div>
            )}

            {/* Ring timer */}
            {!showFreeTimer && <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center gap-8">
              <div className="relative">
                <svg width="220" height="220" className="-rotate-90">
                  <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800"/>
                  <circle cx="110" cy="110" r="90" fill="none" stroke="currentColor" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    className={mode.ring}
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-6xl font-black tabular-nums ${mode.color}`}>{mm}:{ss}</span>
                  <span className="text-sm font-bold text-slate-400 mt-1">{mode.label}</span>
                  <span className="text-xs text-slate-300 dark:text-slate-600 mt-1">Session #{session}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <button onClick={reset}
                  className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined">refresh</span>
                </button>
                <button onClick={() => setRunning(r => !r)}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl transition-all hover:scale-105 ${mode.bg} shadow-current/30`}>
                  <span className="material-symbols-outlined text-4xl fill-icon">{running ? 'pause' : 'play_arrow'}</span>
                </button>
                <button onClick={() => setShowSettings(!showSettings)}
                  className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <span className="material-symbols-outlined">settings</span>
                </button>
              </div>

              {/* Linked task */}
              <div className="w-full">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Focusing on</p>
                <select
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-semibold focus:outline-none focus:border-primary transition-all"
                  value={linkedTask?.id || ''}
                  onChange={e => setLinkedTask(tasks.find(t => t.id === Number(e.target.value)) || null)}>
                  <option value="">— Free focus (no task) —</option>
                  {tasks.filter(t => !t.completed).map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.day})</option>
                  ))}
                </select>
              </div>
            </div>}

            {/* Settings panel */}
            {showSettings && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                <h4 className="font-black">Timer Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Focus (min)', key: 'focusMins', min: 5, max: 60 },
                    { label: 'Short Break', key: 'shortMins', min: 1, max: 15 },
                    { label: 'Long Break',  key: 'longMins',  min: 5, max: 30 },
                  ].map(s => (
                    <div key={s.key}>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{s.label}</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSettings(p => ({ ...p, [s.key]: Math.max(s.min, p[s.key] - 1) })); reset() }}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center text-sm">−</button>
                        <span className="flex-1 text-center font-black text-lg">{settings[s.key]}</span>
                        <button onClick={() => { setSettings(p => ({ ...p, [s.key]: Math.min(s.max, p[s.key] + 1) })); reset() }}
                          className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center text-sm">+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-6 pt-2">
                  {[
                    { key: 'autoBreak', label: 'Auto-start breaks' },
                    { key: 'sound',     label: 'Sound notifications' },
                  ].map(s => (
                    <label key={s.key} className="flex items-center gap-2 cursor-pointer">
                      <button onClick={() => setSettings(p => ({ ...p, [s.key]: !p[s.key] }))}
                        className={`w-10 h-5 rounded-full transition-all relative ${settings[s.key] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${settings[s.key] ? 'left-5' : 'left-0.5'}`} />
                      </button>
                      <span className="text-sm font-medium">{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Stats + History ── */}
          <div className="space-y-6">
            {/* Today stats */}
            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-6 text-white">
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-4">Today's Progress</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-black">{focusSessions}</p>
                  <p className="text-xs opacity-70 mt-1">Sessions</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-3xl font-black">{totalFocusMins}</p>
                  <p className="text-xs opacity-70 mt-1">Minutes</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs opacity-70 mb-1">
                  <span>Daily goal: 4 sessions</span>
                  <span>{Math.min(focusSessions, 4)}/4</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (focusSessions / 4) * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Session dots */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <p className="text-sm font-black mb-3">Session Tracker</p>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all ${
                    i < focusSessions
                      ? 'bg-primary border-primary text-white'
                      : i === focusSessions && running && modeIdx === 0
                        ? 'border-primary text-primary animate-pulse'
                        : 'border-slate-200 dark:border-slate-700 text-slate-300'
                  }`}>
                    {i < focusSessions ? '🍅' : i + 1}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Every 4 🍅 earns a long break</p>
            </div>

            {/* History */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-black">Recent Sessions</p>
                {isPro && history.length > 0 && (
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear</button>
                )}
              </div>
              {!isPro ? (
                <div className="text-center py-6 space-y-3">
                  <span className="text-3xl block">🔒</span>
                  <p className="text-xs font-bold text-slate-500">Histórico de sessões é Pro</p>
                  <button onClick={() => navigate('checkout')}
                    className="text-xs font-black text-primary hover:underline">
                    Fazer upgrade →
                  </button>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-6">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">timer</span>
                  <p className="text-xs text-slate-400">No sessions yet. Start focusing!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                  {history.slice(0, 20).map(h => (
                    <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-lg">🍅</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{h.task}</p>
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
