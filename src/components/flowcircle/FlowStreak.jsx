import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../../context/AppContext'

const LS_FLAME = 'wf_circle_flame'
const LS_SHIELDS = 'wf_member_shields'
const LS_STREAKS = 'wf_flow_streaks'

function loadJSON(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function todayDayName() {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
}

// Simulate if a demo member completed tasks today
function demoMemberCompleted(memberId) {
  // Deterministic per day + member so it doesn't flicker
  const seed = (todayStr() + memberId).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (seed % 3) !== 0 // ~66% chance of completing
}

function demoMemberTaskCount(memberId) {
  const seed = (todayStr() + memberId + 'count').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return (seed % 6) + 1 // 1-6 tasks
}

export default function FlowStreak({ circle }) {
  const { tasks, user, pushToast } = useApp()
  const myId = user?.id || 'me'
  const members = circle.members || []
  const circleKey = circle.id

  // ── Circle Flame ──
  const [flame, setFlame] = useState(() => loadJSON(`${LS_FLAME}_${circleKey}`, { streakDays: 0, lastDate: null }))
  // ── Shields ──
  const [shields, setShields] = useState(() => loadJSON(`${LS_SHIELDS}_${circleKey}`, {}))
  // ── Bilateral streaks ──
  const [streaks, setStreaks] = useState(() => loadJSON(`${LS_STREAKS}_${circleKey}`, {}))
  // ── Shield modal ──
  const [shieldTarget, setShieldTarget] = useState(null)

  const today = todayStr()
  const dayName = todayDayName()

  // My completed tasks today
  const myTodayTasks = tasks.filter(t => t.day === dayName)
  const myCompletedToday = myTodayTasks.filter(t => t.completed).length
  const myDidComplete = myCompletedToday >= 1
  const myExceptional = myCompletedToday >= 4

  // Member completion map
  const memberCompletion = useMemo(() => {
    const map = {}
    members.forEach(m => {
      if (m.id === myId || m.id === 'me') {
        map[m.id] = { completed: myDidComplete, count: myCompletedToday, exceptional: myExceptional }
      } else {
        const did = demoMemberCompleted(m.id)
        const cnt = did ? demoMemberTaskCount(m.id) : 0
        map[m.id] = { completed: did || (shields[m.id]?.protected), count: cnt, exceptional: cnt >= 4 }
      }
    })
    return map
  }, [members, myId, myDidComplete, myCompletedToday, myExceptional, shields])

  // Update flame daily
  useEffect(() => {
    if (flame.lastDate === today) return
    const totalMembers = members.length
    if (totalMembers === 0) return
    const completedCount = members.filter(m => memberCompletion[m.id]?.completed).length
    const majority = completedCount >= Math.ceil(totalMembers * 0.5)

    const newFlame = {
      streakDays: majority ? (flame.lastDate ? flame.streakDays + 1 : 1) : 0,
      lastDate: today,
    }
    setFlame(newFlame)
    saveJSON(`${LS_FLAME}_${circleKey}`, newFlame)

    if (!majority && flame.streakDays > 0) {
      pushToast('The circle flame died... Start again tomorrow!', 'warning')
    }
  }, [today, flame, members, memberCompletion, circleKey, pushToast])

  // Award shields for exceptional days
  useEffect(() => {
    if (myExceptional) {
      const myShields = shields[myId] || { count: 0, lastAwarded: null }
      if (myShields.lastAwarded !== today && myShields.count < 3) {
        const newShields = {
          ...shields,
          [myId]: { count: Math.min(3, myShields.count + 1), lastAwarded: today, expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }
        }
        setShields(newShields)
        saveJSON(`${LS_SHIELDS}_${circleKey}`, newShields)
        pushToast('You earned a Shield for completing 4+ tasks today!', 'success')
      }
    }
  }, [myExceptional, today, shields, myId, circleKey, pushToast])

  // Update bilateral streaks daily
  useEffect(() => {
    const newStreaks = { ...streaks }
    let changed = false
    members.forEach(m => {
      if (m.id === myId || m.id === 'me') return
      const key = [myId, m.id].sort().join('_')
      const existing = newStreaks[key] || { days: 0, lastDate: null }
      if (existing.lastDate === today) return

      const bothDone = myDidComplete && memberCompletion[m.id]?.completed
      newStreaks[key] = {
        days: bothDone ? (existing.lastDate ? existing.days + 1 : 1) : 0,
        lastDate: today,
      }
      changed = true
    })
    if (changed) {
      setStreaks(newStreaks)
      saveJSON(`${LS_STREAKS}_${circleKey}`, newStreaks)
    }
  }, [today, members, myId, myDidComplete, memberCompletion, streaks, circleKey])

  // Clean expired shields
  useEffect(() => {
    const now = Date.now()
    let changed = false
    const cleaned = { ...shields }
    Object.keys(cleaned).forEach(k => {
      if (cleaned[k].expires && cleaned[k].expires < now) {
        cleaned[k] = { ...cleaned[k], count: 0 }
        changed = true
      }
    })
    if (changed) {
      setShields(cleaned)
      saveJSON(`${LS_SHIELDS}_${circleKey}`, cleaned)
    }
  }, [shields, circleKey])

  const myShieldCount = shields[myId]?.count || 0

  const donateShield = (targetId) => {
    if (myShieldCount <= 0) return
    const newShields = {
      ...shields,
      [myId]: { ...shields[myId], count: shields[myId].count - 1 },
      [targetId]: { ...(shields[targetId] || { count: 0 }), protected: true, protectedBy: user?.name || 'You' },
    }
    setShields(newShields)
    saveJSON(`${LS_SHIELDS}_${circleKey}`, newShields)
    const target = members.find(m => m.id === targetId)
    pushToast(`You protected ${target?.name} with a Shield! The flame lives on.`, 'success')
    setShieldTarget(null)
  }

  const useShieldForStreak = (targetMemberId) => {
    if (myShieldCount <= 0) return
    const key = [myId, targetMemberId].sort().join('_')
    const existing = streaks[key] || { days: 0, lastDate: null }

    const newShields = { ...shields, [myId]: { ...shields[myId], count: shields[myId].count - 1 } }
    const newStreaks = { ...streaks, [key]: { days: existing.days + 1, lastDate: today } }

    setShields(newShields)
    setStreaks(newStreaks)
    saveJSON(`${LS_SHIELDS}_${circleKey}`, newShields)
    saveJSON(`${LS_STREAKS}_${circleKey}`, newStreaks)

    const target = members.find(m => m.id === targetMemberId)
    pushToast(`Shield used to protect your streak with ${target?.name}!`, 'success')
    setShieldTarget(null)
  }

  return (
    <div className="space-y-4">
      {/* ── Circle Flame ── */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className={`text-5xl ${flame.streakDays > 0 ? 'animate-pulse' : 'opacity-30 grayscale'}`}>
            {flame.streakDays > 0 ? '🔥' : '💨'}
          </div>
          <div className="flex-1">
            <p className="font-black text-lg text-orange-800 dark:text-orange-200">
              {flame.streakDays > 0
                ? `${flame.streakDays} day${flame.streakDays !== 1 ? 's' : ''} — your flame is strong`
                : 'No active flame'}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
              {flame.streakDays > 0
                ? `50%+ of members must complete 1 task daily to keep the flame alive`
                : 'Complete tasks together to light the flame!'}
            </p>
          </div>
          {myShieldCount > 0 && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-lg">🛡️</span>
              <span className="text-sm font-black">{myShieldCount}</span>
            </div>
          )}
        </div>

        {/* Member completion status */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/50">
          {members.map(m => {
            const comp = memberCompletion[m.id]
            const isShielded = shields[m.id]?.protected
            return (
              <button key={m.id} onClick={() => m.id !== myId && m.id !== 'me' && myShieldCount > 0 && setShieldTarget(m)}
                className="flex flex-col items-center gap-1 min-w-[52px] group">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 transition-all ${
                    comp?.completed ? 'border-emerald-400' : isShielded ? 'border-blue-400' : 'border-slate-300 dark:border-slate-600 opacity-50'
                  }`} style={{ backgroundColor: m.avatar || '#6467f2' }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  {comp?.completed && <span className="absolute -top-1 -right-1 text-xs">✅</span>}
                  {isShielded && !comp?.completed && <span className="absolute -top-1 -right-1 text-xs">🛡️</span>}
                  {comp?.exceptional && <span className="absolute -bottom-1 -right-1 text-[10px]">⭐</span>}
                </div>
                <span className="text-[9px] font-bold text-slate-500 truncate max-w-[52px]">{m.name}</span>
                {/* Bilateral streak */}
                {m.id !== myId && m.id !== 'me' && (() => {
                  const key = [myId, m.id].sort().join('_')
                  const s = streaks[key]?.days || 0
                  return s > 0 ? (
                    <span className="text-[9px] font-black text-orange-500 flex items-center gap-0.5">🔥 {s}</span>
                  ) : null
                })()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Shield donation modal */}
      {shieldTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-black text-xl mx-auto"
                style={{ backgroundColor: shieldTarget.avatar || '#6467f2' }}>
                {shieldTarget.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-black text-lg mt-3">{shieldTarget.name}</h3>
              <p className="text-sm text-slate-400 mt-1">Use a Shield to protect</p>
            </div>

            <div className="space-y-2">
              <button onClick={() => donateShield(shieldTarget.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary/40 transition-all text-left">
                <span className="text-xl">🛡️</span>
                <div>
                  <p className="text-sm font-bold">Protect with Shield</p>
                  <p className="text-[10px] text-slate-400">Counts as "completed" for the circle flame</p>
                </div>
              </button>

              {(() => {
                const key = [myId, shieldTarget.id].sort().join('_')
                const s = streaks[key]?.days || 0
                return s > 0 ? (
                  <button onClick={() => useShieldForStreak(shieldTarget.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-all text-left">
                    <span className="text-xl">🔥</span>
                    <div>
                      <p className="text-sm font-bold">Protect FlowStreak ({s} days)</p>
                      <p className="text-[10px] text-slate-400">Keep your bilateral streak alive</p>
                    </div>
                  </button>
                ) : null
              })()}
            </div>

            <button onClick={() => setShieldTarget(null)}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
