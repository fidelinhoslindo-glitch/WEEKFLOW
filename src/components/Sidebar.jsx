import { memo } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'

function Sidebar() {
  const { page, navigate, isPro, user, darkMode, setDarkMode, tasks, generateRecurring } = useApp()
  const { t } = useLanguage()
  const completed = tasks.filter(tk => tk.completed).length
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0

  const navItems = [
    { id: 'dashboard',     label: t.sidebar.dashboard,   icon: 'dashboard'        },
    { id: 'planner',       label: t.sidebar.planner,     icon: 'calendar_today'   },
    { id: 'daily',         label: t.sidebar.today,       icon: 'today'            },
    { id: 'smart-calendar',label: t.sidebar.smartCal,    icon: 'auto_awesome'     },
    { id: 'flowcircle',    label: t.sidebar.flowcircle,  icon: 'hub'              },
    { id: 'notes',         label: t.sidebar.notes,       icon: 'sticky_note_2'    },
    { id: 'pomodoro',      label: t.sidebar.pomodoro,    icon: 'self_improvement' },
    { id: 'analytics',     label: t.sidebar.analytics,   icon: 'bar_chart'        },
    { id: 'profile',       label: t.sidebar.profile || 'Meu Perfil', icon: 'person' },
    { id: 'settings',      label: t.sidebar.settings,    icon: 'settings'         },
    { id: 'faq',           label: t.sidebar.faq,         icon: 'help'             },
    { id: 'download',      label: t.sidebar.desktopApp,  icon: 'computer'         },
  ]

  return (
    <aside data-tour="sidebar" className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col sticky top-0 h-screen">
      <button onClick={() => navigate('landing')} className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity text-left w-full">
        <div className="bg-primary p-2 rounded-lg text-white">
          <span className="material-symbols-outlined block">calendar_view_week</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">WeekFlow</h1>
      </button>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              page === item.id
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{t.sidebar.dailyProgress}</p>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{completed}/{tasks.length} {t.sidebar.tasksDone}</p>
        </div>

        <div className="flex items-center gap-3 px-2">
          <button
            onClick={() => navigate('profile')}
            className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors"
            style={user.avatarColor ? { background: user.avatarColor + '33', borderColor: user.avatarColor + '66', color: user.avatarColor } : {}}
            aria-label="Go to profile"
          >
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </button>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name || user.email?.split('@')[0] || t.sidebar.user}</p>
            <p className="text-xs text-slate-500">{user.plan} {t.common.plan}</p>
          </div>
          <button onClick={() => navigate('settings')} aria-label="Go to settings" className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">settings</span>
          </button>
        </div>

        <button
          onClick={() => { generateRecurring(); }}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          {t.sidebar.resetRecurring}
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          {darkMode ? t.sidebar.lightMode : t.sidebar.darkMode}
        </button>
      </div>
    </aside>
  )
}

export default memo(Sidebar)
