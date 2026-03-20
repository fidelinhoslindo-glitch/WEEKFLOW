import { useApp } from '../context/AppContext'

export default function UpgradeModal({ feature, requiredPlan = 'pro', onClose }) {
  const { navigate } = useApp()

  const isBiz = requiredPlan === 'business'
  const planLabel = isBiz ? 'Business' : 'Pro'
  const accentColor = isBiz ? 'purple-600' : 'primary'

  const features = isBiz
    ? ['Tudo do Pro incluso','Membros ilimitados por círculo','Painel admin do time','Delegar tarefas por membro','Relatório semanal do time','Suporte prioritário']
    : ['Tarefas ilimitadas','IA ilimitada (Groq)','Circles ilimitados','Sync na nuvem','Analytics 90 dias','Smart Calendar AI']

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-7 text-center space-y-5">
        <div className={`w-16 h-16 ${isBiz ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-primary/10'} rounded-2xl flex items-center justify-center mx-auto`}>
          <span className="text-4xl">🔒</span>
        </div>
        <div>
          <h2 className="text-xl font-black mb-1">Recurso {planLabel}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Faça upgrade para desbloquear{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200">{feature}</span>
          </p>
        </div>
        <div className={`${isBiz ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-primary/5 border-primary/20'} border rounded-xl p-4 text-left space-y-2`}>
          {features.map(f => (
            <div key={f} className="flex items-center gap-2 text-sm">
              <span className={`${isBiz ? 'text-purple-600' : 'text-primary'} font-bold`}>✓</span>
              <span className="text-slate-600 dark:text-slate-300">{f}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { localStorage.setItem('wf_selected_plan', requiredPlan); onClose(); navigate('checkout') }}
            className={`w-full py-3 text-white font-black rounded-xl hover:opacity-90 shadow-lg transition-all ${isBiz ? 'bg-purple-600 shadow-purple-500/25' : 'bg-primary shadow-primary/25'}`}>
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
