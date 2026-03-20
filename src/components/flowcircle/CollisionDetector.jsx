import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

// Generate mock tasks for demo members (non-current-user)
function mockMemberTasks(member, weekDays) {
  const slots = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00']
  const titles = ['Meeting','Workout','Study session','Lunch prep','Project work','Call','Review']
  const tasks = []
  weekDays.forEach(day => {
    const count = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: `${member.id}_${day}_${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        day,
        time: slots[Math.floor(Math.random() * slots.length)],
        duration: [30, 60, 90][Math.floor(Math.random() * 3)],
        completed: Math.random() > 0.5,
        memberId: member.id,
        memberName: member.name,
      })
    }
  })
  return tasks
}

function timeToMin(t) {
  const [h, m] = (t || '09:00').split(':').map(Number)
  return h * 60 + m
}

function timeOverlaps(t1, d1, t2, d2) {
  const s1 = timeToMin(t1), e1 = s1 + (d1 || 60)
  const s2 = timeToMin(t2), e2 = s2 + (d2 || 60)
  return s1 < e2 && s2 < e1
}

export default function CollisionDetector({ circle }) {
  const { tasks, weekDays, user, pushToast, setEditingTask } = useApp()
  const [dismissed, setDismissed] = useState(new Set())
  const [resources, setResources] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`wf_resources_${circle.id}`) || '[]') } catch { return [] }
  })
  const [newRes, setNewRes] = useState({ name: '', icon: '📦' })
  const [showResources, setShowResources] = useState(false)
  const ICONS = ['📦','🚗','🍳','🏠','💻','📺','🎮','🏋️','📷','🔑']

  const members = circle.members || []
  const myId = user?.id || 'me'

  // Build task map per member
  const memberTasks = useMemo(() => {
    const map = {}
    members.forEach(m => {
      if (m.id === myId || m.id === 'me') {
        map[m.id] = tasks.map(t => ({ ...t, memberId: m.id, memberName: m.name }))
      } else {
        map[m.id] = mockMemberTasks(m, weekDays)
      }
    })
    return map
  }, [members, myId, tasks, weekDays])

  // Detect time collisions
  const collisions = useMemo(() => {
    const hits = []
    const ids = Object.keys(memberTasks)
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const aId = ids[i], bId = ids[j]
        const aTasks = memberTasks[aId], bTasks = memberTasks[bId]
        for (const a of aTasks) {
          for (const b of bTasks) {
            if (a.day === b.day && timeOverlaps(a.time, a.duration, b.time, b.duration)) {
              const key = `${a.id}_${b.id}`
              if (!dismissed.has(key)) {
                hits.push({
                  key,
                  memberA: members.find(m => m.id === aId),
                  memberB: members.find(m => m.id === bId),
                  taskA: a,
                  taskB: b,
                  day: a.day,
                  time: a.time,
                  type: 'time',
                })
              }
            }
          }
        }
      }
    }
    return hits.slice(0, 5)
  }, [memberTasks, members, dismissed])

  const addResource = () => {
    if (!newRes.name.trim()) return
    const next = [...resources, { id: Date.now(), ...newRes }]
    setResources(next)
    localStorage.setItem(`wf_resources_${circle.id}`, JSON.stringify(next))
    setNewRes({ name: '', icon: '📦' })
    pushToast('Resource added!', 'success')
  }

  const removeResource = (id) => {
    const next = resources.filter(r => r.id !== id)
    setResources(next)
    localStorage.setItem(`wf_resources_${circle.id}`, JSON.stringify(next))
  }

  const handleResolve = (collision, action) => {
    setDismissed(prev => new Set([...prev, collision.key]))
    if (action === 'me' && (collision.taskA.memberId === myId || collision.taskA.memberId === 'me')) {
      const realTask = tasks.find(t => t.id === collision.taskA.id)
      if (realTask) setEditingTask(realTask)
    }
    pushToast(action === 'me' ? 'Opening your task to adjust...' : action === 'other' ? 'Notified the other member!' : 'Resolution requested!', 'info')
  }

  if (collisions.length === 0 && !showResources) return null

  return (
    <div className="space-y-3">
      {/* Collision alerts */}
      {collisions.map(c => (
        <div key={c.key} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {c.memberA?.name} and {c.memberB?.name} have tasks at the same time
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                {c.day} {c.time} — "{c.taskA.title}" vs "{c.taskB.title}"
              </p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleResolve(c, 'me')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:opacity-80 transition-all">
                  I'll adjust
                </button>
                <button onClick={() => handleResolve(c, 'other')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 hover:opacity-80 transition-all">
                  Other adjusts
                </button>
                <button onClick={() => handleResolve(c, 'together')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-primary hover:bg-primary/10 transition-all">
                  Resolve together
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Shared Resources section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <button onClick={() => setShowResources(!showResources)}
          className="w-full flex items-center justify-between text-left">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">inventory_2</span>
            Shared Resources ({resources.length})
          </p>
          <span className={`material-symbols-outlined text-sm text-slate-400 transition-transform ${showResources ? 'rotate-180' : ''}`}>expand_more</span>
        </button>

        {showResources && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewRes(r => ({ ...r, icon: ic }))}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${newRes.icon === ic ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                placeholder="Resource name (e.g. Car, Kitchen...)"
                value={newRes.name} onChange={e => setNewRes(r => ({ ...r, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addResource()}
              />
              <button onClick={addResource} disabled={!newRes.name.trim()}
                className="px-3 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-40">
                Add
              </button>
            </div>
            {resources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resources.map(r => (
                  <div key={r.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm">
                    <span>{r.icon}</span>
                    <span className="font-semibold">{r.name}</span>
                    <button onClick={() => removeResource(r.id)} className="text-slate-400 hover:text-red-400 ml-1">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
