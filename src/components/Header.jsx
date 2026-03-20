import { memo, useState } from 'react'
import { useApp } from '../context/AppContext'

// Keyboard shortcut Ctrl+K is handled centrally in AppContext — no duplicate listener here.
function Header({ title, subtitle }) {
  const { user, navigate, setShowAddTask, notifications, setNotifications, setShowSearch, pushToast, setShowAIChat, requestPushPermission, syncing, sbEnabled } = useApp()
  const [showNotifs, setShowNotifs] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-primary/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 sm:px-6 py-3 gap-2 sm:gap-4">
      {/* Left: title */}
      <div className="min-w-0">
        {title && <h2 className="text-lg font-black text-slate-900 dark:text-white truncate">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>

      {/* Right: search bar + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Inline search trigger */}
        <button onClick={() => setShowSearch(true)}
          className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-2 rounded-xl text-sm text-slate-400 transition-all w-48" data-tour="search">
          <span className="material-symbols-outlined text-sm">search</span>
          <span className="flex-1 text-left">Search tasks…</span>
          <kbd className="text-[10px] bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </button>

        {/* Mobile search icon */}
        <button onClick={() => setShowSearch(true)} aria-label="Search tasks" className="sm:hidden flex items-center justify-center rounded-xl h-9 w-9 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-sm">search</span>
        </button>

        {/* Add task */}
        <button onClick={() => setShowAddTask(true)}
          className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all" data-tour="add-task">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Task
        </button>

        {/* AI assistant button */}
        <button onClick={() => setShowAIChat(true)}
          aria-label="Open AI assistant"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border border-primary/20 hover:from-primary/20 hover:to-purple-500/20 transition-all text-xs font-bold"
          data-tour="ai-btn">
          <span className="material-symbols-outlined text-sm" style={{fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
          <span className="hidden lg:inline">AI</span>
        </button>

        {/* Sync indicator */}
        {sbEnabled && (
          <div className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${syncing ? 'text-amber-500' : 'text-emerald-500'}`} title={syncing ? 'Syncing...' : 'Synced to cloud'}>
            <span className={`material-symbols-outlined text-xs ${syncing ? 'animate-spin' : ''}`}>{syncing ? 'refresh' : 'cloud_done'}</span>
          </div>
        )}

        {/* Push notification enable */}
        {'Notification' in window && Notification.permission === 'default' && (
          <button onClick={async () => { const ok = await requestPushPermission(); if(ok) pushToast('Push notifications enabled! 🔔','success') }}
            className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
            <span className="material-symbols-outlined text-xs">notifications_none</span>
            Enable alerts
          </button>
        )}

        {/* Bell */}
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            aria-label="Notifications"
            className="relative flex items-center justify-center rounded-xl h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined text-sm">notifications</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unread}</span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-sm">Notifications</h4>
                <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-primary'}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-snug">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => { setShowNotifs(false); pushToast('Notification settings coming soon!', 'info') }}
                  className="w-full text-xs font-semibold text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors">
                  Notification Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <button onClick={() => navigate('settings')} aria-label="Go to settings" className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-primary font-black text-sm">
            {user.name.charAt(0)}
          </div>
        </button>
      </div>
    </header>
  )
}

export default memo(Header)
