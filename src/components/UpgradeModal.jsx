import { useApp } from '../context/AppContext'

export default function UpgradeModal({ feature, onClose }) {
  const { navigate } = useApp()

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-7 text-center space-y-5">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-4xl">🔒</span>
        </div>
        <div>
          <h2 className="text-xl font-black mb-1">Recurso Pro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Faça upgrade para desbloquear{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">{feature}</span>
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left space-y-2">
          {['Tarefas ilimitadas','IA ilimitada (Groq)','Circles ilimitados','Sync na nuvem','Analytics 90 dias','Smart Calendar AI'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <span className="text-primary font-bold">✓</span>
              <span className="text-slate-600 dark:text-slate-300">{f}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { onClose(); navigate('checkout') }}
            className="w-full py-3 bg-primary text-white font-black rounded-xl hover:opacity-90 shadow-lg shadow-primary/25 transition-all">
            Ver planos →
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
