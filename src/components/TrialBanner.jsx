import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function TrialBanner() {
  const { user, isPro, trialDaysLeft, navigate } = useApp()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null
  if (!user?.isTrialUser || !isPro || trialDaysLeft <= 0) return null

  return (
    <div className="relative z-30 flex items-center justify-between gap-3 px-4 py-2.5 bg-gradient-to-r from-primary via-purple-600 to-indigo-600 text-white text-sm font-medium shadow-lg">
      <span className="flex items-center gap-2">
        <span>🎉</span>
        <span>Trial Pro: <strong>{trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}</strong></span>
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate('pricing')}
          className="bg-white text-primary font-bold px-3 py-1 rounded-lg text-xs hover:bg-slate-100 transition-colors"
        >
          Fazer upgrade →
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fechar banner"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  )
}
