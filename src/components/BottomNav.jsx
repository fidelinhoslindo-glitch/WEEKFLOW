import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

const CAROUSEL_ITEMS = [
  { id: 'dashboard',   icon: 'dashboard',      label: 'Início'    },
  { id: 'planner',     icon: 'calendar_today', label: 'Planner'   },
  { id: 'flowcircle',  icon: 'hub',            label: 'Círculos'  },
  { id: 'analytics',   icon: 'bar_chart',      label: 'Stats'     },
  { id: 'profile',     icon: 'person',         label: 'Perfil'    },
]

export default function BottomNav() {
  const { page, navigate, setShowAddTask } = useApp()
  const { t } = useLanguage()

  // Find the active page index (default to 0)
  const activeIdx = CAROUSEL_ITEMS.findIndex(i => i.id === page)
  const [current, setCurrent] = useState(activeIdx >= 0 ? activeIdx : 0)

  // Sync carousel position when page changes externally (e.g. sidebar nav)
  const syncedPage = useRef(page)
  if (syncedPage.current !== page) {
    syncedPage.current = page
    const idx = CAROUSEL_ITEMS.findIndex(i => i.id === page)
    if (idx >= 0 && idx !== current) setCurrent(idx)
  }

  // Touch swipe handling
  const touchStartX = useRef(null)

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 30) return // too small — treat as tap
    if (dx < 0 && current < CAROUSEL_ITEMS.length - 1) {
      const next = current + 1
      setCurrent(next)
      navigate(CAROUSEL_ITEMS[next].id)
    } else if (dx > 0 && current > 0) {
      const prev = current - 1
      setCurrent(prev)
      navigate(CAROUSEL_ITEMS[prev].id)
    }
  }

  const handleTap = () => {
    navigate(CAROUSEL_ITEMS[current].id)
  }

  const item = CAROUSEL_ITEMS[current]
  const isActive = page === item.id

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
      <div
        className="relative flex items-end justify-between px-6 pt-2"
        style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom))' }}
      >

        {/* Left — Add task FAB */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setShowAddTask(true)}
            aria-label="Adicionar tarefa"
            className="w-12 h-12 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">add</span>
          </button>
          <span className="text-[10px] font-bold text-slate-400">{t.bottomNav.add}</span>
        </div>

        {/* Center — Carousel */}
        <div
          className="flex flex-col items-center gap-1 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleTap}
        >
          {/* Swipe hint arrows */}
          <div className="flex items-center gap-2">
            <span className={`text-[11px] transition-opacity duration-200 ${current > 0 ? 'text-slate-400' : 'text-transparent'}`}>‹</span>

            {/* Main pill button */}
            <div
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl transition-all duration-200 shadow-lg
                ${isActive
                  ? 'bg-primary text-white shadow-primary/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              style={{ minWidth: 130 }}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-bold">{item.label}</span>
            </div>

            <span className={`text-[11px] transition-opacity duration-200 ${current < CAROUSEL_ITEMS.length - 1 ? 'text-slate-400' : 'text-transparent'}`}>›</span>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-1 mt-0.5">
            {CAROUSEL_ITEMS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-200 ${
                  i === current
                    ? 'w-4 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right — placeholder to balance layout */}
        <div className="w-12 h-12" />

      </div>
    </nav>
  )
}
