import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function timeToMin(t) {
  const [h, m] = (t || '09:00').split(':').map(Number)
  return h * 60 + m
}

function minToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

// Generate mock busy slots for demo members
function mockBusySlots(member, weekDays) {
  const slots = []
  weekDays.forEach(day => {
    const count = Math.floor(Math.random() * 4) + 1
    const used = new Set()
    for (let i = 0; i < count; i++) {
      const h = 8 + Math.floor(Math.random() * 12) // 8h-20h
      if (used.has(h)) continue
      used.add(h)
      slots.push({ day, start: h * 60, end: h * 60 + [60, 90, 120][Math.floor(Math.random() * 3)] })
    }
  })
  return slots
}

export default function FreeWindow({ circle, onCreateEvent }) {
  const { tasks, weekDays, user, pushToast } = useApp()
  const myId = user?.id || 'me'
  const members = circle.members || []
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedWindow, setSelectedWindow] = useState(null)
  const [eventTitle, setEventTitle] = useState('')
  const [eventDesc, setEventDesc] = useState('')
  const [dismissed, setDismissed] = useState(new Set())

  // Find free windows across all members
  const windows = useMemo(() => {
    if (members.length < 2) return []

    const MIN_HOUR = 8 * 60   // 8:00
    const MAX_HOUR = 22 * 60  // 22:00
    const MIN_BLOCK = 60      // minimum 1 hour

    const results = []

    weekDays.forEach(day => {
      // Build busy intervals per member
      const allBusy = []

      members.forEach(m => {
        if (m.id === myId || m.id === 'me') {
          // Real user tasks
          tasks.filter(t => t.day === day && !t.completed).forEach(t => {
            const start = timeToMin(t.time)
            allBusy.push({ start, end: start + (t.duration || 60) })
          })
        } else {
          // Demo: mock busy slots
          mockBusySlots(m, [day]).forEach(s => allBusy.push(s))
        }
      })

      // Merge overlapping busy intervals
      const sorted = allBusy.filter(b => b.end > MIN_HOUR && b.start < MAX_HOUR).sort((a, b) => a.start - b.start)
      const merged = []
      for (const interval of sorted) {
        const s = Math.max(interval.start, MIN_HOUR)
        const e = Math.min(interval.end, MAX_HOUR)
        if (merged.length > 0 && s <= merged[merged.length - 1].end) {
          merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, e)
        } else {
          merged.push({ start: s, end: e })
        }
      }

      // Find gaps
      let cursor = MIN_HOUR
      for (const interval of merged) {
        if (interval.start - cursor >= MIN_BLOCK) {
          results.push({ day, start: cursor, end: interval.start })
        }
        cursor = Math.max(cursor, interval.end)
      }
      if (MAX_HOUR - cursor >= MIN_BLOCK) {
        results.push({ day, start: cursor, end: MAX_HOUR })
      }
    })

    return results.slice(0, 5) // top 5 windows
  }, [members, myId, tasks, weekDays])

  const handleCreate = () => {
    if (!eventTitle.trim() || !selectedWindow) return
    if (onCreateEvent) {
      onCreateEvent({
        title: eventTitle.trim(),
        description: eventDesc.trim(),
        date: new Date().toISOString().split('T')[0],
        day: selectedWindow.day,
        time: minToTime(selectedWindow.start),
        duration: selectedWindow.end - selectedWindow.start,
      })
    }
    pushToast('Event created for everyone!', 'success')
    setShowCreateModal(false)
    setEventTitle('')
    setEventDesc('')
    setSelectedWindow(null)
  }

  const memberNames = members.map(m => (m.id === myId || m.id === 'me') ? 'you' : m.name).join(', ')

  return (
    <div className="space-y-3">
      {/* Free window cards */}
      {windows.filter(w => !dismissed.has(`${w.day}_${w.start}`)).length > 0 ? (
        windows.filter(w => !dismissed.has(`${w.day}_${w.start}`)).map(w => (
          <div key={`${w.day}_${w.start}`}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">🟢</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Free Window found — {w.day} {minToTime(w.start)}–{minToTime(w.end)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {memberNames} are all free
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { setSelectedWindow(w); setShowCreateModal(true) }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-white hover:opacity-80 transition-all">
                    Create event for all
                  </button>
                  <button onClick={() => setDismissed(prev => new Set([...prev, `${w.day}_${w.start}`]))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                    Ignore this week
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 text-center">
          <p className="text-sm text-slate-400">
            {members.length < 2
              ? 'Add more members to find free windows'
              : 'Busy week for the group. Next window: next week.'}
          </p>
        </div>
      )}

      {/* Create event modal */}
      {showCreateModal && selectedWindow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-lg">Create Group Event</h3>
              <button onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 text-sm">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">
                  {selectedWindow.day} {minToTime(selectedWindow.start)}–{minToTime(selectedWindow.end)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Everyone is free</p>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Event Title</label>
                <input
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="Movie night, Team lunch..."
                  value={eventTitle} onChange={e => setEventTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Description (optional)</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  rows={2} placeholder="Any details..."
                  value={eventDesc} onChange={e => setEventDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">Cancel</button>
              <button onClick={handleCreate} disabled={!eventTitle.trim()}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:opacity-90 disabled:opacity-40">
                Create for All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
