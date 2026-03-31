import { useApp } from '../context/AppContext'

export default function TrialExpiredModal() {
  const { trialJustExpired, setTrialJustExpired, navigate } = useApp()

  if (!trialJustExpired) return null

  const close = () => setTrialJustExpired(false)

  const handleUpgrade = () => {
    navigate('pricing')
    close()
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-4 text-center">
        <div className="text-5xl">⏰</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Seu trial Pro expirou
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Esperamos que tenha aproveitado! Faça upgrade para continuar com todos os recursos.
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <button
            onClick={handleUpgrade}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
          >
            Ver planos
          </button>
          <button
            onClick={close}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Continuar no Free
          </button>
        </div>
      </div>
    </div>
  )
}
