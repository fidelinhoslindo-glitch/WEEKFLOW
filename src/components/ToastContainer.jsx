import { useApp } from '../context/AppContext'

export default function ToastContainer() {
  const { toasts, dismissToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-2xl min-w-72 max-w-sm border animate-[slideIn_0.3s_ease] ${
            toast.type === 'success'  ? 'bg-emerald-500 text-white border-emerald-400' :
            toast.type === 'warning'  ? 'bg-amber-500 text-white border-amber-400' :
            toast.type === 'error'    ? 'bg-red-500 text-white border-red-400' :
                                        'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200'
          }`}
          style={{ animation: 'slideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <span className="material-symbols-outlined text-lg shrink-0 mt-0.5 fill-icon">
            {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'schedule' : toast.type === 'error' ? 'error' : 'notifications'}
          </span>
          <p className="text-sm font-semibold flex-1 leading-snug">{toast.msg}</p>
          <button onClick={() => dismissToast(toast.id)} className="opacity-70 hover:opacity-100 transition-opacity shrink-0">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
