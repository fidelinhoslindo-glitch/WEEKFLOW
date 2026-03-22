import { useState, useEffect, useRef } from 'react'

// ── Task & circle data (purely decorative) ───────────────────────────────────
const TASKS = [
  { day: 0, emoji: '🏋️', title: 'Morning Workout', time: '07:00', cat: 'Gym',   color: '#22c55e' },
  { day: 1, emoji: '💼', title: 'Deep Work Block', time: '09:00', cat: 'Work',  color: '#a855f7' },
  { day: 2, emoji: '📚', title: 'Study Session',   time: '19:00', cat: 'Study', color: '#3b82f6' },
]

const CIRCLE_MEMBERS = [
  { initial: 'A', bg: '#6467f2' },
  { initial: 'M', bg: '#a855f7' },
  { initial: 'R', bg: '#22c55e' },
]

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MOBILE_DAYS = ['Mon','Tue','Wed','Thu','Fri']

// ── Hook: tracks scroll progress within an element ───────────────────────────
function useScrollReveal(totalSteps) {
  const containerRef = useRef(null)
  const [step, setStep] = useState(-1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const viewH = window.innerHeight
      // progress 0→1 as element scrolls from bottom-of-viewport to top
      const progress = Math.min(1, Math.max(0, (viewH - rect.top) / (viewH + rect.height)))
      const newStep = Math.floor(progress * (totalSteps + 1)) - 1
      setStep(newStep) // follows scroll both directions
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [totalSteps])

  return { containerRef, step }
}

// ── Single animated element ──────────────────────────────────────────────────
function Reveal({ visible, delay = 0, from = 'bottom', children, className = '' }) {
  const [hasEntered, setHasEntered] = useState(false)
  const [cleanWillChange, setCleanWillChange] = useState(false)

  useEffect(() => {
    if (visible && !hasEntered) {
      const t = setTimeout(() => setHasEntered(true), delay)
      return () => clearTimeout(t)
    }
  }, [visible, delay, hasEntered])

  // Remove will-change after transition completes
  useEffect(() => {
    if (hasEntered) {
      const t = setTimeout(() => setCleanWillChange(true), 500 + delay)
      return () => clearTimeout(t)
    }
  }, [hasEntered, delay])

  const transforms = {
    bottom: 'translateY(20px)',
    left: 'translateX(-30px)',
    right: 'translateX(30px)',
    scale: 'scale(0.85)',
  }

  return (
    <div
      className={className}
      style={{
        opacity: hasEntered ? 1 : 0,
        transform: hasEntered ? 'translate(0,0) scale(1)' : transforms[from],
        transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
        willChange: cleanWillChange ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AnimatedPlanner() {
  // 7 steps: 0=task1, 1=task2, 2=task3, 3=check, 4=circle, 5=pulse, 6=done
  const { containerRef, step } = useScrollReveal(7)

  return (
    <div ref={containerRef} className="relative max-w-5xl mx-auto" style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
      {/* Glow behind */}
      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl opacity-60 rounded-3xl" />

      {/* Browser chrome */}
      <div className="relative bg-[#0f0f1a] rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="bg-[#161625] border-b border-slate-700/50 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 bg-slate-800/80 h-6 rounded-lg flex items-center px-3 gap-2">
            <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 12 }}>lock</span>
            <span className="text-xs text-slate-500 font-mono">weekflow.space</span>
          </div>
        </div>

        {/* ── Desktop planner (7 cols) ── */}
        <div className="hidden sm:block p-5">
          <div className="grid grid-cols-7 gap-2" style={{ minHeight: 260 }}>
            {DAYS.map((day, di) => (
              <div key={day} className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold text-slate-500 text-center tracking-wider">{day}</p>

                {/* Task slots for Mon/Tue/Wed */}
                {TASKS.filter(t => t.day === di).map((task, ti) => (
                  <Reveal key={ti} visible={step >= task.day} from="left" delay={ti * 80}>
                    <TaskCard task={task} />
                  </Reveal>
                ))}

                {/* Completed badge on Monday (step 3) */}
                {di === 0 && (
                  <Reveal visible={step >= 3} from="scale" delay={100}>
                    <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-2 py-1.5">
                      <span className="text-emerald-400 text-xs font-bold">✓</span>
                      <span className="text-[10px] text-emerald-300 font-semibold truncate">Concluída!</span>
                    </div>
                  </Reveal>
                )}

                {/* Empty placeholder slots for other days */}
                {TASKS.filter(t => t.day === di).length === 0 && di < 5 && (
                  <>
                    <div className="h-14 rounded-xl bg-slate-800/40 border border-slate-700/30" />
                    {di % 2 === 0 && <div className="h-10 rounded-xl bg-slate-800/30 border border-slate-700/20" />}
                  </>
                )}
                {di >= 5 && (
                  <>
                    <div className="h-10 rounded-xl bg-slate-800/30 border border-slate-700/20" />
                    <div className="h-8 rounded-xl bg-slate-800/20 border border-slate-700/15" />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* FlowCircle card — floats in bottom-right (step 4) */}
          <Reveal visible={step >= 4} from="right" delay={0} className="absolute bottom-14 right-6 z-10">
            <CircleCard pulse={step >= 5} />
          </Reveal>
        </div>

        {/* ── Mobile planner (5 cols, fewer elements) ── */}
        <div className="sm:hidden p-3">
          <div className="grid grid-cols-5 gap-1.5" style={{ minHeight: 180 }}>
            {MOBILE_DAYS.map((day, di) => (
              <div key={day} className="flex flex-col gap-1">
                <p className="text-[9px] font-bold text-slate-500 text-center">{day}</p>

                {TASKS.filter(t => t.day === di).map((task, ti) => (
                  <Reveal key={ti} visible={step >= task.day} from="left" delay={ti * 60}>
                    <TaskCardMobile task={task} />
                  </Reveal>
                ))}

                {/* Completed badge on Monday (step 3) */}
                {di === 0 && (
                  <Reveal visible={step >= 3} from="scale">
                    <div className="flex items-center justify-center bg-emerald-500/15 border border-emerald-500/30 rounded-lg py-1">
                      <span className="text-emerald-400 text-[9px] font-bold">✓</span>
                    </div>
                  </Reveal>
                )}

                {/* Empty slots */}
                {TASKS.filter(t => t.day === di).length === 0 && (
                  <>
                    <div className="h-10 rounded-lg bg-slate-800/40 border border-slate-700/30" />
                    {di % 2 === 0 && <div className="h-6 rounded-lg bg-slate-800/30 border border-slate-700/20" />}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Mobile circle card (step 4) — smaller, below grid */}
          <Reveal visible={step >= 4} from="bottom" className="mt-2">
            <CircleCard pulse={step >= 5} small />
          </Reveal>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TaskCard({ task }) {
  return (
    <div className="rounded-xl p-2 flex flex-col gap-1"
      style={{ background: 'rgba(100,103,242,0.15)', border: '1px solid rgba(100,103,242,0.3)' }}>
      <div className="flex items-center gap-1">
        <span className="text-xs">{task.emoji}</span>
        <span className="text-[10px] font-bold text-white truncate">{task.title}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] text-slate-400">{task.time}</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: task.color }} />
          <span className="text-[9px] text-slate-400">{task.cat}</span>
        </span>
      </div>
    </div>
  )
}

function TaskCardMobile({ task }) {
  return (
    <div className="rounded-lg p-1.5 flex flex-col gap-0.5"
      style={{ background: 'rgba(100,103,242,0.15)', border: '1px solid rgba(100,103,242,0.3)' }}>
      <span className="text-[9px]">{task.emoji}</span>
      <div className="h-1 rounded-full" style={{ background: task.color, width: '60%' }} />
    </div>
  )
}

function CircleCard({ pulse, small }) {
  return (
    <div className={`${small ? 'p-2' : 'p-3'} rounded-2xl border border-primary/30`}
      style={{ background: 'rgba(100,103,242,0.2)' }}>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {CIRCLE_MEMBERS.map((m, i) => (
            <div key={i} className="relative">
              <div
                className={`${small ? 'w-5 h-5 text-[8px]' : 'w-7 h-7 text-[10px]'} rounded-full flex items-center justify-center font-bold text-white border-2 border-[#0f0f1a]`}
                style={{ background: m.bg }}
              >
                {m.initial}
              </div>
              {/* Pulse ring on first avatar */}
              {pulse && i === 0 && (
                <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-50"
                  style={{ animationDuration: '2s' }} />
              )}
            </div>
          ))}
        </div>
        <div>
          <p className={`${small ? 'text-[9px]' : 'text-[11px]'} font-bold text-white`}>FlowCircle</p>
          <p className={`${small ? 'text-[8px]' : 'text-[9px]'} text-slate-400`}>
            3 membros online <span className="text-emerald-400">●</span>
          </p>
        </div>
      </div>
    </div>
  )
}
