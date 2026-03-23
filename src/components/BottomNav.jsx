import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

export default function BottomNav() {
  const { page, navigate, setShowAddTask } = useApp()
  const { t } = useLanguage()

  const NAV_ITEMS = [
    { id: 'dashboard', icon: 'dashboard',      label: t.bottomNav.home    },
    { id: 'planner',   icon: 'calendar_today', label: t.bottomNav.planner },
    { id: 'flowcircle',icon: 'hub',             label: t.bottomNav.circles },
    { id: 'analytics', icon: 'bar_chart',      label: t.bottomNav.stats   },
    { id: 'settings',  icon: 'person',         label: t.bottomNav.profile },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
      <div className="relative flex items-end justify-around px-1 pt-2 pb-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>

        {/* First two items */}
        {NAV_ITEMS.slice(0, 2).map(item => <NavBtn key={item.id} item={item} active={page === item.id} navigate={navigate} />)}

        {/* Center FAB */}
        <div className="flex flex-col items-center px-2">
          <button
            onClick={() => setShowAddTask(true)}
            aria-label="Add new task"
            className="w-14 h-14 -mt-7 bg-primary text-white rounded-full shadow-2xl shadow-primary/50 flex items-center justify-center hover:scale-110 transition-all active:scale-95 border-4 border-white dark:border-slate-900 mb-1"
          >
            <span className="material-symbols-outlined text-2xl">add</span>
          </button>
          <span className="text-[10px] font-bold text-slate-400">{t.bottomNav.add}</span>
        </div>

        {/* Last two items */}
        {NAV_ITEMS.slice(2).map(item => <NavBtn key={item.id} item={item} active={page === item.id} navigate={navigate} />)}
      </div>
    </nav>
  )
}

function NavBtn({ item, active, navigate }) {
  return (
    <button
      onClick={() => navigate(item.id)}
      className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all min-w-[52px] relative ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />}
      <span
        className="material-symbols-outlined text-[22px]"
        style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
      >
        {item.icon}
      </span>
      <span className={`text-[10px] font-bold ${active ? 'text-primary' : ''}`}>{item.label}</span>
    </button>
  )
}
