import { memo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import { getSupabaseCredentials } from '../utils/supabase'

// Keyboard shortcut Ctrl+K is handled centrally in AppContext — no duplicate listener here.
function Header({ title, subtitle }) {
  const { user, navigate, setShowAddTask, notifications, setNotifications, setShowSearch, pushToast, setShowAIChat, requestPushPermission, syncing, sbEnabled, setPendingCircleInvite } = useApp()
  const { t } = useLanguage()
  const [showNotifs, setShowNotifs] = useState(false)
  const [inviteModal, setInviteModal] = useState(null) // { invite, notifId, members }
  const [loadingInvite, setLoadingInvite] = useState(false)
  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  const openInviteModal = async (n) => {
    setShowNotifs(false)
    setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    // circle_mode is stored in the invite row itself — no need to query circles table (RLS blocks it)
    const circleMode = n.circleInvite.circle_mode || null
    setInviteModal({ invite: n.circleInvite, notifId: n.id, members: [], circleMode })
    setLoadingInvite(true)
    let members = []
    try {
      // User may not be a member yet, so this might return empty — that's expected
      const { url, key } = getSupabaseCredentials()
      const userToken = localStorage.getItem('wf_token') || key
      const mRes = await fetch(`${url}/rest/v1/circle_members?circle_id=eq.${n.circleInvite.circle_id}&select=*`, { headers: { 'apikey': key, 'Authorization': `Bearer ${userToken}` } })
      if (mRes.ok) members = await mRes.json() || []
    } catch {}
    setLoadingInvite(false)
    setInviteModal(prev => prev ? { ...prev, members } : null)
  }

  const acceptInvite = () => {
    if (!inviteModal) return
    // Normalize fields so joinCircle in FlowCirclePage can use them
    setPendingCircleInvite({
      ...inviteModal.invite,
      circleId: inviteModal.invite.circle_id,
      circleName: inviteModal.invite.circle_name,
      mode: inviteModal.circleMode || 'friends',
    })
    navigate('flowcircle')
    setNotifications(prev => prev.filter(x => x.id !== inviteModal.notifId))
    setInviteModal(null)
  }

  const declineInvite = async () => {
    if (!inviteModal) return
    try {
      const { url, key } = getSupabaseCredentials()
      const userToken = localStorage.getItem('wf_token') || key
      await fetch(`${url}/rest/v1/circle_invites?id=eq.${inviteModal.invite.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${userToken}` },
        body: JSON.stringify({ status: 'declined' })
      })
    } catch {}
    setNotifications(prev => prev.filter(x => x.id !== inviteModal.notifId))
    setInviteModal(null)
    pushToast('Invite declined.', 'info')
  }

  return (
    <>
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
            <span className="flex-1 text-left">{t.header.searchTasks}</span>
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
            {t.header.addTask}
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
            <button onClick={async () => { const ok = await requestPushPermission(); if(ok) pushToast(t.app.pushEnabled, 'success') }}
              className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 text-[10px] font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
              <span className="material-symbols-outlined text-xs">notifications_none</span>
              {t.header.enableAlerts}
            </button>
          )}

          {/* Bell */}
          <div className="relative">
            <button onClick={() => setShowNotifs(!showNotifs)}
              aria-label={t.header.notifications}
              className="relative flex items-center justify-center rounded-xl h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined text-sm">notifications</span>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unread}</span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-sm">{t.header.notifications}</h4>
                  <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">{t.header.markAllRead}</button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">{t.header.noNotifications}</div>
                  ) : notifications.map(n => (
                    <div key={n.id}
                      onClick={() => n.circleInvite ? openInviteModal(n) : setNotifications(prev=>prev.map(x=>x.id===n.id?{...x,read:true}:x))}
                      className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0 cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-300' : 'bg-primary'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-snug">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                        {n.circleInvite && <p className="text-[10px] text-primary font-semibold mt-0.5">Clique para ver o convite →</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => { setShowNotifs(false); navigate('settings') }}
                    className="w-full text-xs font-semibold text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors">
                    {t.header.notificationSettings}
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

      {/* Circle Invite Modal */}
      {inviteModal && (() => {
        const MODES = { couple:'💑', friends:'👥', family:'👨‍👩‍👧‍👦', company:'🏢' }
        const modeIcon = MODES[inviteModal.circleMode] || '🔵'
        const members = inviteModal.members
        const shown = members.slice(0, 3)
        const extra = members.length - 3
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-sm">
            <div className="w-full sm:max-w-sm bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

              <div className="p-6 text-center">
                {/* Mode icon */}
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6467f2, #8b5cf6)' }}>
                  {modeIcon}
                </div>

                {/* Inviter */}
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Convite para Circle</p>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{inviteModal.invite.inviter_name}</span> te convidou para
                </p>
                <h3 className="font-black text-xl text-slate-900 dark:text-white mt-0.5 mb-5">"{inviteModal.invite.circle_name}"</h3>

                {/* Members avatars */}
                {loadingInvite ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-5">
                    <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
                    Carregando...
                  </div>
                ) : members.length > 0 && (
                  <div className="flex items-center justify-center mb-5 gap-1">
                    {shown.map((m, i) => (
                      <div key={i} title={m.name}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-sm font-black shadow-md -ml-2 first:ml-0"
                        style={{ backgroundColor: m.avatar || '#6467f2', zIndex: shown.length - i }}>
                        {(m.name||'?').charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {extra > 0 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 shadow-md -ml-2">
                        +{extra}
                      </div>
                    )}
                    <span className="ml-3 text-xs text-slate-400 font-medium">{members.length} {members.length === 1 ? 'membro' : 'membros'}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button onClick={declineInvite}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Recusar
                  </button>
                  <button onClick={acceptInvite}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-primary/30 hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #6467f2, #8b5cf6)' }}>
                    Aceitar convite
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}

export default memo(Header)
