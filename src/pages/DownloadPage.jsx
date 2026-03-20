import { useState } from 'react'
import { useApp } from '../context/AppContext'

const DOWNLOAD_URL = 'https://github.com/fidelinhoslindo-glitch/WEEKFLOW/releases/download/2.5.0/WeekFlow.Setup.2.5.0.exe'
const VERSION = '2.5.0'
const RELEASE_DATE = 'March 2026'
const SIZE = '~97 MB'

export default function DownloadPage() {
  const { navigate, darkMode } = useApp()
  const [downloading, setDownloading] = useState(false)
  const [downloaded,  setDownloaded]  = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      setDownloaded(true)
    }, 1500)
  }

  const platforms = [
    { name:'Windows', icon:'window', version:'10/11 (x64)', available:true,  badge:'', primary:true },
    { name:'macOS',   icon:'laptop_mac', version:'Coming soon', available:false, badge:'Soon', primary:false },
    { name:'Linux',   icon:'terminal',   version:'Coming soon', available:false, badge:'Soon', primary:false },
  ]

  const features = [
    { icon:'notifications_active', title:'Native Notifications', desc:'Get reminders even when the browser is closed' },
    { icon:'wifi_off',             title:'Works Offline',        desc:'Full access without internet connection' },
    { icon:'system_update',        title:'Auto Updates',         desc:'Always up to date automatically' },
    { icon:'keyboard_command_key', title:'Keyboard Shortcuts',   desc:'Power user shortcuts for everything' },
    { icon:'minimize',             title:'System Tray',          desc:'Quick access from your taskbar' },
    { icon:'speed',                title:'Faster Performance',   desc:'Native app experience, no browser overhead' },
  ]

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Nav */}
      <nav className="border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('landing')} className="flex items-center gap-2.5">
            <img src="./favicon.png" alt="WeekFlow" className="w-8 h-8 rounded-xl" onError={e=>e.target.style.display='none'}/>
            <span className="font-black text-lg">WeekFlow</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('landing')} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Home</button>
            <button onClick={() => navigate('login')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90">Sign In</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_40%,rgba(100,103,242,0.08)_0%,transparent_100%)]"/>
        <div className="max-w-3xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
            <span className="material-symbols-outlined text-sm">new_releases</span>
            Version {VERSION} — {RELEASE_DATE}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight">
            WeekFlow for<br/><span className="text-primary">Desktop</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The full WeekFlow experience as a native desktop app. Faster, smarter, with offline support and system notifications.
          </p>

          {/* Platform cards */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            {platforms.map(p => (
              <div key={p.name} className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all w-full sm:w-44 ${p.available?'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10':' border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'}`}>
                {p.badge && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                    {p.badge}
                  </span>
                )}
                <span className={`material-symbols-outlined text-3xl ${p.available?'text-primary':'text-slate-400'}`}>{p.icon}</span>
                <div>
                  <p className="font-black text-sm">{p.name}</p>
                  <p className="text-[11px] text-slate-400">{p.version}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Main download button */}
          <div className="flex flex-col items-center gap-3">
            <a href={DOWNLOAD_URL} target="_blank" rel="noreferrer" onClick={handleDownload}
              className={`group inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-black text-lg shadow-2xl transition-all ${downloaded?'bg-emerald-500 shadow-emerald-500/30':downloading?'bg-primary/70 cursor-wait':'bg-primary shadow-primary/30 hover:scale-105 hover:shadow-primary/50'}`}>
              <span className="material-symbols-outlined text-xl" style={{fontVariationSettings:"'FILL' 1"}}>
                {downloaded ? 'check_circle' : downloading ? 'downloading' : 'download'}
              </span>
              {downloaded ? 'Download Started!' : downloading ? 'Preparing...' : `Download for Windows`}
            </a>
            <p className="text-sm text-slate-400">
              WeekFlow v{VERSION} · {SIZE} · Free to download
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-emerald-500">verified_user</span>Virus-free</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-emerald-500">lock</span>No admin required</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-emerald-500">update</span>Auto-updates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Install instructions */}
      {downloaded && (
        <section className="py-10 bg-emerald-50 dark:bg-emerald-900/10 border-y border-emerald-200 dark:border-emerald-800">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h3 className="font-black text-lg mb-4 text-emerald-700 dark:text-emerald-300">🎉 Download started! Here's what to do next:</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { step:'1', title:'Open the file', desc:'Find WeekFlow-Setup-2.5.0.exe in your Downloads' },
                { step:'2', title:'Run installer',  desc:'Follow the beautiful setup wizard (takes 30 seconds)' },
                { step:'3', title:'Launch WeekFlow',desc:'WeekFlow opens automatically after install' },
              ].map(s => (
                <div key={s.step} className="bg-white dark:bg-slate-900 rounded-xl p-4 text-left">
                  <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-black mb-2">{s.step}</div>
                  <p className="font-bold text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-black text-center mb-12">Why the desktop app?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary/30 transition-all">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings:"'FILL' 1"}}>{f.icon}</span>
                </div>
                <h3 className="font-black mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Web app CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <p className="text-slate-500 dark:text-slate-400 mb-4">Prefer to use the web version?</p>
          <button onClick={() => navigate('dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm hover:border-primary/40 transition-all">
            <span className="material-symbols-outlined text-primary text-sm">open_in_browser</span>
            Open WeekFlow Web App
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center">
        <p className="text-sm text-slate-400">© 2026 WeekFlow · v{VERSION}</p>
      </footer>
    </div>
  )
}
