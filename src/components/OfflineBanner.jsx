import { useState, useEffect } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus()
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState('offline') // 'offline' | 'syncing' | 'synced'

  useEffect(() => {
    if (!isOnline) {
      setPhase('offline')
      setVisible(true)
    } else if (wasOffline) {
      setPhase('syncing')
      setVisible(true)
      // After 1.5s switch to "Sincronizado!"
      const t1 = setTimeout(() => setPhase('synced'), 1500)
      // After 3.5s hide banner
      const t2 = setTimeout(() => setVisible(false), 3500)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [isOnline, wasOffline])

  if (!visible) return null

  const configs = {
    offline: {
      bg: 'bg-red-900/90 border-red-700',
      text: 'text-red-100',
      label: '📡 Sem conexão — alterações salvas localmente',
    },
    syncing: {
      bg: 'bg-yellow-900/90 border-yellow-700',
      text: 'text-yellow-100',
      label: '🔄 Sincronizando...',
    },
    synced: {
      bg: 'bg-emerald-900/90 border-emerald-700',
      text: 'text-emerald-100',
      label: '✅ Sincronizado!',
    },
  }

  const { bg, text, label } = configs[phase]

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm text-sm font-medium shadow-xl transition-all duration-300 ${bg} ${text}`}
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  )
}
