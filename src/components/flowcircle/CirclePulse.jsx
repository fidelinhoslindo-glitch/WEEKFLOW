import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const LS_LAST_SEEN = 'wf_last_seen'

function getStatus(member, myId, tasks) {
  // Current user: calculate from real tasks
  if (member.id === myId || member.id === 'me') {
    const now = new Date()
    const currentHour = now.getHours()
    const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]
    const todayTasks = tasks.filter(t => t.day === today)

    if (todayTasks.length === 0) return 'free'
    const allDone = todayTasks.every(t => t.completed)
    if (allDone) return 'free'

    // Check if there's a task at the current hour
    const hasCurrentTask = todayTasks.some(t => {
      if (t.completed) return false
      const [h] = (t.time || '09:00').split(':').map(Number)
      const endH = h + Math.ceil((t.duration || 60) / 60)
      return currentHour >= h && currentHour < endH
    })
    return hasCurrentTask ? 'focus' : 'free'
  }

  // Demo members: simulate based on member status
  const lastSeen = localStorage.getItem(`${LS_LAST_SEEN}_${member.id}`)
  if (lastSeen) {
    const diff = Date.now() - Number(lastSeen)
    if (diff > 2 * 60 * 60 * 1000) return 'offline'
  }
  // Mock: use member's existing status field as hint
  if (member.status === 'offline') return 'offline'
  if (member.status === 'busy') return 'focus'
  return Math.random() > 0.4 ? 'free' : 'focus'
}

const PULSE_STYLES = {
  focus:   { ring: 'ring-blue-500', bg: 'bg-blue-500', label: 'Focusing', dot: 'bg-blue-500', animate: true },
  free:    { ring: 'ring-emerald-500', bg: 'bg-emerald-500', label: 'Free', dot: 'bg-emerald-500', animate: false },
  offline: { ring: 'ring-slate-400', bg: 'bg-slate-400', label: 'Offline', dot: 'bg-slate-400', animate: false },
}

export default function CirclePulse({ circle }) {
  const { tasks, user, pushToast } = useApp()
  const myId = user?.id || 'me'
  const members = circle.members || []

  // Update last seen timestamp
  useEffect(() => {
    localStorage.setItem(LS_LAST_SEEN, String(Date.now()))
    const interval = setInterval(() => {
      localStorage.setItem(LS_LAST_SEEN, String(Date.now()))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate statuses
  const [statuses, setStatuses] = useState({})

  useEffect(() => {
    const calc = {}
    members.forEach(m => {
      calc[m.id] = getStatus(m, myId, tasks)
    })
    setStatuses(calc)
  }, [members, myId, tasks])

  // Notify when someone becomes free (demo: on mount for demo members)
  const [notified, setNotified] = useState(new Set())
  useEffect(() => {
    members.forEach(m => {
      if ((m.id === myId || m.id === 'me') || notified.has(m.id)) return
      if (statuses[m.id] === 'free' && m.status === 'online') {
        setNotified(prev => new Set([...prev, m.id]))
      }
    })
  }, [statuses, members, myId, notified])

  if (members.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">radio_button_checked</span>
        Circle Pulse
      </p>
      <div className="flex flex-wrap gap-4">
        {members.map(m => {
          const s = statuses[m.id] || 'offline'
          const style = PULSE_STYLES[s]
          return (
            <div key={m.id} className="flex flex-col items-center gap-1.5 min-w-[56px]">
              <div className={`relative ${style.animate ? 'animate-pulse' : ''}`}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm ring-3 ${style.ring} transition-all`}
                  style={{ backgroundColor: m.avatar || '#6467f2' }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${style.dot}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[56px]">{m.name}</span>
              <span className={`text-[9px] font-black uppercase tracking-wider ${
                s === 'focus' ? 'text-blue-500' : s === 'free' ? 'text-emerald-500' : 'text-slate-400'
              }`}>{style.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
