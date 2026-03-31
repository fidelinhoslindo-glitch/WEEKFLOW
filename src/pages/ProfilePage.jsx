import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { dbGetProfile, dbSaveProfile } from '../utils/firebaseDB'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * Calculate weekly streak: count how many consecutive weeks (going backwards
 * from the current week) had at least one completed task.
 */
function calcWeeklyStreak(tasks) {
  const completed = tasks.filter(t => t.completed && t.completedAt)
  if (!completed.length) return 0

  // Build a set of "YYYY-Www" strings for each completed task
  const weekKeys = new Set()
  for (const t of completed) {
    const d = new Date(t.completedAt)
    if (isNaN(d)) continue
    // ISO week number approximation
    const jan4 = new Date(d.getFullYear(), 0, 4)
    const dayOfYear = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
    const weekNum = Math.ceil((dayOfYear + jan4.getDay()) / 7)
    weekKeys.add(`${d.getFullYear()}-${weekNum}`)
  }

  // Check current week backwards until a gap
  const now = new Date()
  let streak = 0
  let year = now.getFullYear()
  const jan4 = new Date(year, 0, 4)
  const dayOfYear = Math.floor((now - new Date(year, 0, 0)) / 86400000)
  let week = Math.ceil((dayOfYear + jan4.getDay()) / 7)

  while (weekKeys.has(`${year}-${week}`)) {
    streak++
    week--
    if (week < 1) {
      year--
      week = 52
    }
    if (streak > 104) break // safety cap
  }

  return streak
}

// ── Plan badge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }) {
  const isPro     = plan === 'Pro'
  const isBusiness = plan === 'Business'
  if (isPro) return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
      Pro <span className="text-sm">✨</span>
    </span>
  )
  if (isBusiness) return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
      Business <span className="text-sm">🔥</span>
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 border border-slate-600/40">
      Free
    </span>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser, tasks, navigate, pushToast } = useApp()

  const [editMode, setEditMode]   = useState(false)
  const [saving, setSaving]       = useState(false)
  const [nameInput, setNameInput] = useState(user.name || '')
  const [bioInput, setBioInput]   = useState('')
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#6467f2')
  const [profileLoaded, setProfileLoaded] = useState(false)

  const AVATAR_COLORS = ['#6467f2','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316']

  // Computed stats
  const tasksCompleted = tasks.filter(t => t.completed).length
  const weeklyStreak   = calcWeeklyStreak(tasks)

  // Load bio and avatarColor from Firestore on mount
  useEffect(() => {
    if (!user?.id) return
    dbGetProfile(user.id).then(profile => {
      if (profile?.bio)         setBioInput(profile.bio)
      if (profile?.avatarColor) setAvatarColor(profile.avatarColor)
      setProfileLoaded(true)
    }).catch(() => setProfileLoaded(true))
  }, [user?.id])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      await dbSaveProfile(user.id, {
        name:           nameInput.trim() || user.name,
        bio:            bioInput.trim(),
        avatarColor,
        tasksCompleted,
        weeklyStreak,
        publicProfile:  true,
      })
      // Sync name + avatarColor to local user state
      setUser(prev => ({ ...prev, name: nameInput.trim() || prev.name, avatarColor }))
      pushToast('Perfil salvo!', 'success')
      setEditMode(false)
    } catch {
      pushToast('Erro ao salvar perfil.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setNameInput(user.name || '')
    setAvatarColor(user.avatarColor || '#6467f2')
    setEditMode(false)
  }

  const displayName = editMode ? nameInput : (user.name || 'User')

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Meu Perfil" />

        <main className="flex-1 p-4 lg:p-8 max-w-2xl mx-auto w-full">

          {/* ── Profile card ── */}
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">

            {/* Avatar + name row */}
            <div className="flex items-start gap-5">

              {/* Avatar circle */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg select-none"
                style={{ background: avatarColor }}
              >
                {getInitials(displayName) || '?'}
              </div>

              {/* Name + plan + email */}
              <div className="flex-1 min-w-0">
                {editMode ? (
                  <input
                    className="w-full text-xl font-bold bg-transparent border-b-2 border-primary outline-none text-slate-900 dark:text-white pb-1 mb-2"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    maxLength={60}
                    placeholder="Seu nome"
                    autoFocus
                  />
                ) : (
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">{displayName}</h1>
                )}

                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <PlanBadge plan={user.plan} />
                </div>

                {user.email && (
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                )}
              </div>

              {/* Edit / Save buttons */}
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Editar
                </button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>

            {/* ── Avatar color picker (edit mode) ── */}
            {editMode && (
              <div className="mt-5">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Cor do avatar</p>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, outline: avatarColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Bio ── */}
            <div className="mt-6">
              {editMode ? (
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Bio</label>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-primary resize-none transition-colors"
                    rows={3}
                    maxLength={160}
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">{bioInput.length}/160</p>
                </div>
              ) : (
                bioInput ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{bioInput}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Nenhuma bio ainda. Clique em Editar para adicionar.</p>
                )
              )}
            </div>

            {/* ── Stats ── */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{tasksCompleted}</p>
                  <p className="text-xs text-slate-500">tarefas concluídas</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <div>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{weeklyStreak}</p>
                  <p className="text-xs text-slate-500">semanas de streak</p>
                </div>
              </div>
            </div>

            {/* ── FlowCircle CTA ── */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => navigate('flowcircle')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm transition-colors"
              >
                <span className="material-symbols-outlined text-lg">hub</span>
                Meu FlowCircle
              </button>
            </div>
          </div>

          {/* ── Tip about public profile ── */}
          <p className="text-xs text-slate-400 text-center mt-4">
            Seu perfil ficará visível para membros do seu FlowCircle.
          </p>
        </main>
      </div>
    </div>
  )
}
