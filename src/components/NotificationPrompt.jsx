import { useState, useEffect } from 'react'
import { requestNotificationPermission, registerServiceWorker } from '../utils/notifications'

// ── NotificationPrompt ────────────────────────────────────────────────────────
// Toast-style prompt shown once after login if notifications not yet granted.
// Stores decision in localStorage under 'wf_notif_asked'.

const LS_KEY = 'wf_notif_asked'

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if: already asked, notifications not supported, or already granted/denied
    if (!('Notification' in window)) return
    if (localStorage.getItem(LS_KEY)) return
    if (Notification.permission !== 'default') {
      localStorage.setItem(LS_KEY, '1')
      return
    }

    // Small delay so it doesn't pop up immediately on login
    const timer = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const handleEnable = async () => {
    setVisible(false)
    localStorage.setItem(LS_KEY, '1')
    await registerServiceWorker()
    await requestNotificationPermission()
  }

  const handleDismiss = () => {
    setVisible(false)
    localStorage.setItem(LS_KEY, '1')
  }

  return (
    <div
      role="dialog"
      aria-label="Ativar notificações"
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 max-w-xs w-full"
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 p-4 flex flex-col gap-3 animate-slide-up">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              Ativar notificações
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
              Receba lembretes 15 min antes das suas tarefas.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-auto shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleEnable}
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors active:scale-95"
          >
            Ativar
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded-xl transition-colors active:scale-95"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
