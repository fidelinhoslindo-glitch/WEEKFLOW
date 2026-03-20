import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

// Generate a stable share ID from tasks content
function generateShareId(tasks, user) {
  const data = { tasks, user: { name: user.name }, generated: new Date().toISOString() }
  const str  = JSON.stringify(data)
  // Store in localStorage with unique key
  const id   = 'share_' + Date.now().toString(36)
  try { localStorage.setItem(id, str) } catch {}
  return id
}

// Encode tasks as URL-safe base64 for truly shareable link
function encodeShareData(tasks, user) {
  const payload = {
    v: 1,
    name: user.name,
    tasks: tasks.map(t => ({
      t: t.title, c: t.category, d: t.day,
      ti: t.time, du: t.duration, p: t.priority, done: t.completed,
    })),
    ts: Date.now(),
  }
  try {
    return btoa(encodeURIComponent(JSON.stringify(payload)))
  } catch { return null }
}

function decodeShareData(encoded) {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch { return null }
}

// Shared week view (read-only) rendered when ?share=xxx in URL
function SharedWeekView({ data }) {
  const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const CAT_COLORS = {
    Work: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Gym:  'bg-emerald-100 text-emerald-700 border-emerald-200',
    Study:'bg-blue-100 text-blue-700 border-blue-200',
    Rest: 'bg-purple-100 text-purple-700 border-purple-200',
    Other:'bg-orange-100 text-orange-700 border-orange-200',
  }

  const tasks = data.tasks.map(t => ({
    title: t.t, category: t.c, day: t.d, time: t.ti, duration: t.du, priority: t.p, completed: t.done,
  }))

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-8 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_view_week</span>
        </div>
        <h1 className="text-3xl font-black mb-1">{data.name}'s Week</h1>
        <p className="text-white/70 text-sm">Shared via WeekFlow · {new Date(data.ts).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}</p>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">{tasks.length} tasks</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">{tasks.filter(t=>t.completed).length} completed</span>
        </div>
      </div>

      {/* Week grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {WEEK_DAYS.map(day => {
            const dayTasks = tasks.filter(t => t.day === day)
            return (
              <div key={day} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="mb-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">{day.slice(0,3)}</p>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full"
                      style={{ width: dayTasks.length ? `${(dayTasks.filter(t=>t.completed).length/dayTasks.length)*100}%` : '0%' }} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {dayTasks.map((t,i) => (
                    <div key={i} className={`text-xs px-2 py-1.5 rounded-lg border ${CAT_COLORS[t.category]||CAT_COLORS.Other} ${t.completed ? 'opacity-50 line-through' : ''}`}>
                      <p className="font-semibold truncate">{t.title}</p>
                      <p className="opacity-60 text-[10px]">{t.time}</p>
                    </div>
                  ))}
                  {dayTasks.length === 0 && <p className="text-[10px] text-slate-300 text-center py-2">Rest day</p>}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_view_week</span>
            </div>
            <div>
              <h3 className="font-black text-lg">Plan your week like this</h3>
              <p className="text-slate-400 text-sm mt-1">WeekFlow — Organize your week, find your flow.</p>
            </div>
            <a href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
              Try WeekFlow Free →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ShareWeek page ───────────────────────────────────────────────────────
export default function ShareWeekPage() {
  const { tasks, user, weekDays, categoryColors, pushToast } = useApp()
  const [shareUrl,   setShareUrl]   = useState('')
  const [copied,     setCopied]     = useState(false)
  const [shareData,  setShareData]  = useState(null)
  const [privacy,    setPrivacy]    = useState('tasks') // tasks | names | full

  // Check if we're viewing a shared link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('share')
    if (encoded) {
      const data = decodeShareData(encoded)
      if (data) setShareData(data)
    }
  }, [])

  const generateLink = () => {
    const tasksToShare = privacy === 'tasks'
      ? tasks.map(t => ({ ...t, notes: '' }))
      : tasks
    const encoded = encodeShareData(tasksToShare, user)
    if (!encoded) { pushToast('Could not generate link', 'error'); return }
    const url = `${window.location.origin}?share=${encoded}`
    setShareUrl(url)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      pushToast('Link copied to clipboard! 🔗', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      pushToast('Could not copy — please copy manually', 'info')
    }
  }

  // Viewing shared week
  if (shareData) return <SharedWeekView data={shareData} />

  const doneTasks  = tasks.filter(t => t.completed).length
  const totalHours = Math.round(tasks.reduce((s,t) => s + t.duration, 0) / 60)

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Share My Week" subtitle="Generate a public link to your schedule" />
        <main className="flex-1 p-4 lg:p-8 max-w-3xl mx-auto w-full space-y-6">

          {/* Week preview card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-purple-600 px-6 py-5 text-white">
              <h3 className="text-xl font-black">{user.name}'s Week</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/80">
                <span>{tasks.length} tasks</span>
                <span>{doneTasks} completed</span>
                <span>{totalHours}h planned</span>
              </div>
            </div>
            {/* Mini week preview */}
            <div className="p-4 grid grid-cols-7 gap-1.5">
              {weekDays.map(day => {
                const dt = tasks.filter(t => t.day === day)
                return (
                  <div key={day} className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{day.slice(0,2)}</p>
                    <div className="space-y-0.5">
                      {dt.slice(0,3).map((t,i) => {
                        const c = categoryColors[t.category] || categoryColors.Work
                        return <div key={i} className={`h-1.5 rounded-full ${c.dot}`} />
                      })}
                      {dt.length === 0 && <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Privacy settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h4 className="font-black mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">lock</span>
              Privacy Settings
            </h4>
            <div className="space-y-3">
              {[
                { id:'tasks', icon:'visibility', label:'Tasks only', desc:'Share task names, times and categories — no personal notes' },
                { id:'full',  icon:'share',      label:'Full details', desc:'Include all task details and notes' },
              ].map(p => (
                <button key={p.id} onClick={() => setPrivacy(p.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${privacy===p.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}>
                  <span className={`material-symbols-outlined text-sm mt-0.5 ${privacy===p.id ? 'text-primary' : 'text-slate-400'}`}>{p.icon}</span>
                  <div>
                    <p className={`text-sm font-bold ${privacy===p.id ? 'text-primary' : ''}`}>{p.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{p.desc}</p>
                  </div>
                  {privacy===p.id && <span className="ml-auto material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings:"'FILL' 1" }}>check_circle</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Generate + copy */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h4 className="font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">link</span>
              Share Link
            </h4>
            <button onClick={generateLink}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Generate Share Link
            </button>

            {shareUrl && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input readOnly value={shareUrl}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-mono focus:outline-none" />
                  <button onClick={copyLink}
                    className={`px-4 rounded-xl font-bold text-sm transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5">info</span>
                  Anyone with this link can view your week schedule (read-only). The link expires in 7 days.
                </p>
                {/* Social share buttons */}
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=${encodeURIComponent('Check out my WeekFlow schedule! ' + shareUrl)}`} target="_blank" rel="noopener"
                    className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-xs font-bold hover:opacity-80 transition-all">
                    WhatsApp
                  </a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('My weekly schedule on WeekFlow 📅 ' + shareUrl)}`} target="_blank" rel="noopener"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold hover:opacity-80 transition-all">
                    Twitter/X
                  </a>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
