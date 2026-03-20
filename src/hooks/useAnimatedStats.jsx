import { useEffect, useRef, useState } from 'react'

// Smooth count-up animation hook
export function useCountUp(target, duration = 1000, start = 0) {
  const [value, setValue] = useState(start)
  const rafRef  = useRef(null)
  const startTs = useRef(null)

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTs.current = null
    const from = start

    const tick = (ts) => {
      if (!startTs.current) startTs.current = ts
      const elapsed = ts - startTs.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, start])

  return value
}

// Intersection observer hook — triggers animation when element enters viewport
export function useInView(threshold = 0.1) {
  const ref       = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, inView]
}

// Animated stat card
export function AnimatedStat({ icon, label, value, suffix = '', trend, up, neutral, color = 'text-primary bg-primary/10', delay = 0 }) {
  const [ref, inView] = useInView()
  // Parse the numeric part — handles '78%', 42, 'Tuesday'
  const isStatic  = typeof value === 'string' && isNaN(parseInt(value)) && !value.endsWith('%')
  const isPercent = typeof value === 'string' && value.endsWith('%')
  const numTarget = isStatic ? 0 : isPercent ? parseInt(value) : (typeof value === 'number' ? value : parseInt(value) || 0)
  const animated  = useCountUp(inView ? numTarget : 0, 1200 + delay)
  const display   = isStatic
    ? value
    : isPercent
      ? animated + '%'
      : suffix
        ? animated + suffix
        : animated

  return (
    <div ref={ref} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
      <div className="flex justify-between items-start mb-4">
        <span className={`material-symbols-outlined p-2 rounded-xl ${color}`}>{icon}</span>
        {trend && !neutral && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${up ? 'text-emerald-500' : 'text-red-500'}`}>
            {trend}
            <span className="material-symbols-outlined text-xs">{up ? 'trending_up' : 'trending_down'}</span>
          </span>
        )}
        {neutral && <span className="text-xs font-bold text-slate-400">{trend}</span>}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-black mt-1 tabular-nums group-hover:text-primary transition-colors">{display}</h3>
    </div>
  )
}
