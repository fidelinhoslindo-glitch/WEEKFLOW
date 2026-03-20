import { memo } from 'react'
import { useApp } from '../context/AppContext'

const navItems = [
  { id: 'dashboard',     label: 'Dashboard',    icon: 'dashboard'        },
  { id: 'planner',       label: 'Planner',      icon: 'calendar_today'   },
  { id: 'daily',         label: 'Today',        icon: 'today'            },
  { id: 'smart-calendar',label: 'Smart Cal',    icon: 'auto_awesome'     },
  { id: 'flowcircle',    label: 'FlowCircle',   icon: 'hub'              },
  { id: 'notes',         label: 'Notes',        icon: 'sticky_note_2'    },
  { id: 'timer',         label: 'Timer',        icon: 'timer'            },
  { id: 'pomodoro',      label: 'Pomodoro',     icon: 'self_improvement' },
  { id: 'analytics',     label: 'Analytics',    icon: 'bar_chart'        },
  { id: 'settings',      label: 'Settings',     icon: 'settings'         },
  { id: 'share',         label: 'Share Week',   icon: 'share'            },
  { id: 'export',        label: 'Export',       icon: 'download'         },
  { id: 'download',      label: 'Desktop App',  icon: 'computer'         },
]

function Sidebar() {
  const { page, navigate, isPro, user, darkMode, setDarkMode, tasks, generateRecurring } = useApp()
  const completed = tasks.filter(t => t.completed).length
  const pct = Math.round((completed / tasks.length) * 100)

  return (
    <aside data-tour="sidebar" className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex flex-col sticky top-0 h-screen">
      <button onClick={() => navigate('landing')} className="p-6 flex items-center gap-3 hover:opacity-80 transition-opacity text-left w-full">
        <div className="bg-primary p-2 rounded-lg text-white">
          <span className="material-symbols-outlined block">calendar_view_week</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">WeekFlow</h1>
      </button>

      <nav className="flex-1 px-4 space-y-1">
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
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Daily Progress</p>
            <span className="text-xs font-bold text-primary">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{completed}/{tasks.length} tasks done</p>
        </div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-slate-500">{user.plan} Plan</p>
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
          Reset recurring tasks
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">{darkMode ? 'light_mode' : 'dark_mode'}</span>
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </aside>
  )
}

export default memo(Sidebar)
