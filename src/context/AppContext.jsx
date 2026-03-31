import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { TOAST_TIMEOUT, FREE_TASK_LIMIT, VALID_PAGES } from '../utils/constants'
import { isFirebaseConfigured } from '../utils/firebase'
import {
  fbSignIn, fbSignUp, fbSignOut, fbSignInWithGoogle,
  fbGetRedirectResult, fbOnAuthStateChanged,
} from '../utils/firebaseAuth'
import { dbGetTasks, dbSaveTasks, dbGetProfile } from '../utils/firebaseDB'
import { fbSubscribeToInvites } from '../utils/firebaseCircle'
import { seedDemoData, DEMO_USER } from '../utils/demoData'

const AppContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const save = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const LS = { TASKS:'wf_tasks', USER:'wf_user', DARK:'wf_dark', AUTH:'wf_auth', TOKEN:'wf_token', ONBOARD:'wf_onboard', WEEK:'wf_week_offset' }

// ── Seed tasks ─────────────────────────────────────────────────────────────---
const SEED = []

export const categoryColors = {
  Work:  { bg:'bg-primary/10',  text:'text-primary',     border:'border-primary/30',  dot:'bg-primary'     },
  Gym:   { bg:'bg-emerald-100', text:'text-emerald-700', border:'border-emerald-300', dot:'bg-emerald-500' },
  Study: { bg:'bg-blue-100',    text:'text-blue-700',    border:'border-blue-300',    dot:'bg-blue-500'    },
  Rest:  { bg:'bg-purple-100',  text:'text-purple-700',  border:'border-purple-300',  dot:'bg-purple-500'  },
  Other: { bg:'bg-orange-100',  text:'text-orange-700',  border:'border-orange-300',  dot:'bg-orange-500'  },
}

export const TASK_COLORS = [
  { id:'',        label:'Default',  hex:''        },
  { id:'indigo',  label:'Indigo',   hex:'#6467f2' },
  { id:'emerald', label:'Green',    hex:'#10b981' },
  { id:'amber',   label:'Yellow',   hex:'#f59e0b' },
  { id:'red',     label:'Red',      hex:'#ef4444' },
  { id:'purple',  label:'Purple',   hex:'#8b5cf6' },
  { id:'pink',    label:'Pink',     hex:'#ec4899' },
  { id:'cyan',    label:'Cyan',     hex:'#06b6d4' },
  { id:'orange',  label:'Orange',   hex:'#f97316' },
]

const WEEK_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

// Generate onboarding tasks — real, personalized based on all answers
function genOnboardingTasks(data) {
  const list = []
  let counter = 200000
  const uid = () => { counter++; return Date.now() * 10000 + counter }
  const { goal='', activities=[], workStart='09:00', workEnd='17:00', wakeUp='07:00', daysOff=['Saturday','Sunday'], noWork=false } = data
  const workDays = WEEK_DAYS.filter(d => !daysOff.includes(d)).slice(0,5)
  const add = (t) => list.push({ completed:false, priority:'medium', notes:'✨ Created from your onboarding answers', recurring:true, color:'', ...t, id:uid() })

  // Morning routine based on wakeUp
  if (activities.includes('meditation'))
    [workDays[0], workDays[2], workDays[4]].filter(Boolean).forEach(day =>
      add({ title:'Morning Meditation 🧘', category:'Rest', day, time:wakeUp, duration:10, priority:'medium' }))

  // Gym — 3x per week on alternating days
  if (activities.includes('gym')) {
    const gymDays = goal==='productivity' ? [workDays[0],workDays[2],workDays[4]] : [workDays[1],workDays[3],daysOff[0]||workDays[4]]
    gymDays.filter(Boolean).forEach(day =>
      add({ title:'Workout 💪', category:'Gym', day, time:'07:00', duration:60, priority:'medium' }))
  }

  // Work blocks — only if user works (not skipped) AND explicitly selected work activity or work-focused goal
  if (!noWork && workStart && activities.includes('work'))
    workDays.forEach(day =>
      add({ title:'Deep Work Block 💼', category:'Work', day, time:workStart, duration:90, priority:'high' }))

  // Study
  if (activities.includes('study'))
    workDays.slice(0,4).forEach(day =>
      add({ title:'Study Session 📚', category:'Study', day, time:'19:00', duration:60, priority:'medium' }))

  // Reading
  if (activities.includes('reading'))
    add({ title:'Evening Reading 📖', category:'Study', day:daysOff[0]||'Saturday', time:'21:00', duration:30, priority:'low' })

  // Cooking
  if (activities.includes('cooking'))
    add({ title:'Meal Prep 🍳', category:'Rest', day:daysOff[0]||'Sunday', time:'15:00', duration:90, priority:'low' })

  // Social
  if (activities.includes('social'))
    add({ title:'Social Time 👥', category:'Other', day:daysOff[1]||daysOff[0]||'Saturday', time:'18:00', duration:120, priority:'medium' })

  // Rest days
  daysOff.forEach(day =>
    add({ title:'Rest & Recharge 😴', category:'Rest', day, time:'10:00', duration:120, priority:'low' }))

  // Less stress goal — add extra rest
  if (goal==='stress')
    workDays.slice(0,2).forEach(day =>
      add({ title:'Wind-Down Routine 🌙', category:'Rest', day, time:workEnd, duration:30, priority:'low' }))

  return list.slice(0, 18)
}

// Week offset → date range label
function weekLabel(offset) {
  const now = new Date()
  const monday = new Date(now)
  const dow = now.getDay() === 0 ? 6 : now.getDay() - 1
  monday.setDate(now.getDate() - dow + offset * 7)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6)
  const fmt = d => d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
  if (offset === 0) return 'This week'
  if (offset === -1) return 'Last week'
  if (offset === 1) return 'Next week'
  return `${fmt(monday)} – ${fmt(sunday)}`
}

export function AppProvider({ children }) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(() => load(LS.AUTH, false))
  const [user, setUserState]        = useState(() => load(LS.USER, { name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' }))
  const [syncing, setSyncing]       = useState(false)

  const setUser = useCallback((updater) => {
    setUserState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; save(LS.USER, next); return next })
  }, [])

  // ── Firebase auth state listener — source of truth ───────────────────────
  useEffect(() => {
    const unsub = fbOnAuthStateChanged(async (fbUser) => {
      if (!fbUser) return
      // Block unverified email/password accounts
      if (!fbUser.emailVerified && fbUser.providerData[0]?.providerId === 'password') return
      // Already logged in via listener — sync user state
      const existing = load(LS.USER, null)
      if (existing?.id === fbUser.uid) return
      const u = {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        plan: 'Free',
        avatar: fbUser.photoURL || null,
        avatarColor: existing?.avatarColor || '#6467f2',
      }
      save(LS.USER, u); setUserState(u)
      save(LS.AUTH, true); setIsLoggedIn(true)
      await syncFromCloud(fbUser.uid)
    })
    // Handle Google redirect result on mount
    fbGetRedirectResult().then(fbUser => {
      if (fbUser) _finishLogin(fbUser)
    })
    return unsub
  }, []) // eslint-disable-line

  const _finishLogin = async (fbUser, displayName) => {
    localStorage.removeItem(LS.TASKS); localStorage.removeItem(LS.ONBOARD)
    localStorage.removeItem(LS.WEEK); localStorage.removeItem('wf_notes')
    setTasksState([]); setOnboardingDataState({})
    const u = {
      id: fbUser.uid,
      email: fbUser.email || '',
      name: displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
      plan: 'Free',
      avatar: fbUser.photoURL || null,
      avatarColor: '#6467f2',
    }
    // Merge saved avatar color if exists
    const prev = load(LS.USER, null)
    if (prev?.avatarColor) u.avatarColor = prev.avatarColor
    save(LS.USER, u); setUserState(u)
    save(LS.AUTH, true); setIsLoggedIn(true)
    await syncFromCloud(fbUser.uid)
    const doneOnboard = load('wf_onboard_done', false) || Object.keys(load(LS.ONBOARD, {})).length > 0
    setPage(doneOnboard ? 'dashboard' : 'onboarding')
  }

  const signIn = async (email, password) => {
    const fbUser = await fbSignIn(email, password)
    // Block unverified email/password accounts — Google accounts are always verified
    if (!fbUser.emailVerified && fbUser.providerData[0]?.providerId === 'password') {
      await fbSignOut()
      throw new Error('email-not-verified')
    }
    await _finishLogin(fbUser)
  }

  const signUp = async (_name, email, password) => {
    await fbSignUp(email, password)
    // Do NOT log in — user must verify email first
    await fbSignOut()
  }

  const signInWithGoogle = async () => {
    const fbUser = await fbSignInWithGoogle()
    if (fbUser) await _finishLogin(fbUser)
    // if null → redirect flow, fbGetRedirectResult handles it on next mount
  }

  // Apple not supported by Firebase without extra setup — keep stub
  const signInWithApple = async () => {
    throw new Error('Apple Sign-In not configured yet')
  }

  // Keep login/register aliases for any internal callers
  const login    = signIn
  const register = signUp

  // ── Demo login (sem Firebase — dados locais para gravação de vídeo) ──────────
  const loginDemo = useCallback(() => {
    // Limpa dados anteriores
    localStorage.removeItem(LS.TASKS)
    localStorage.removeItem(LS.ONBOARD)
    localStorage.removeItem(LS.WEEK)
    localStorage.removeItem('wf_notes')
    // Popula com dados de demo
    const demoTasks = seedDemoData()
    save(LS.TASKS, demoTasks)
    setTasksState(demoTasks)
    // Define usuário demo com plano Pro (para mostrar todas as features)
    const demoOnboard = { goal: 'productivity', activities: ['work','gym'], wakeUp: '06:30', workStart: '09:00', workEnd: '18:00', daysOff: ['Saturday','Sunday'] }
    save(LS.ONBOARD, demoOnboard)
    setOnboardingDataState(demoOnboard)
    save(LS.USER, DEMO_USER)
    setUserState(DEMO_USER)
    save(LS.AUTH, true)
    setIsLoggedIn(true)
    // Skip tour for demo mode
    localStorage.setItem('wf_tour_done', 'true')
    setPage('dashboard')
    // Expose for Playwright recorder
    if (typeof window !== 'undefined') window.__weekflowDemoReady = true
  }, []) // eslint-disable-line

  const logout = async () => {
    await fbSignOut().catch(() => {})
    localStorage.removeItem(LS.TASKS); localStorage.removeItem(LS.ONBOARD)
    localStorage.removeItem(LS.WEEK);  localStorage.removeItem(LS.USER)
    localStorage.removeItem('wf_notes'); localStorage.removeItem('wf_completion_history')
    setTasksState([]); setOnboardingDataState({})
    setUserState({ name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' })
    save(LS.AUTH, false); setIsLoggedIn(false); setPage('landing')
  }

  const deleteAccount = () => {
    fbSignOut().catch(() => {})
    localStorage.clear()
    setIsLoggedIn(false); setTasksState([])
    setUserState({ name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' })
    setPage('landing')
  }

  // ── Cloud sync (Firestore) ────────────────────────────────────────────────
  const syncFromCloud = useCallback(async (uid) => {
    if (!isFirebaseConfigured() || !uid) return
    setSyncing(true)
    try {
      const [cloudTasks, profile] = await Promise.all([
        dbGetTasks(uid),
        dbGetProfile(uid),
      ])
      if (cloudTasks?.length > 0) { setTasksState(cloudTasks); save(LS.TASKS, cloudTasks) }
      if (profile) {
        setUserState(prev => {
          const merged = { ...prev, ...profile }
          save(LS.USER, merged)
          return merged
        })
      }
    } catch {}
    setSyncing(false)
  }, [])

  const syncToCloud = useCallback(async (tasks) => {
    if (!isFirebaseConfigured() || !user?.id) return
    try { await dbSaveTasks(user.id, tasks) } catch {}
  }, [user?.id])

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const [tasks, setTasksState] = useState(() => load(LS.TASKS, SEED))

  const persistTasks = useCallback((updater) => {
    setTasksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      save(LS.TASKS, next)
      syncToCloud(next)
      return next
    })
  }, [syncToCloud])

  const _id = useRef(Date.now())
  const nextId = () => { _id.current = Math.max(_id.current + 1, Date.now()); return _id.current }

  const addTask   = (task)      => persistTasks(p => [...p, { ...task, id:nextId(), completed:false, notes:task.notes||'', recurring:task.recurring||false, color:task.color||'', ...(task.specificDate ? { specificDate: task.specificDate } : {}) }])
  const addTasks  = (list)      => persistTasks(p => [...p, ...list.map(t => ({ ...t, id:nextId(), completed:false, notes:t.notes||'', recurring:t.recurring||false, color:t.color||'', ...(t.specificDate ? { specificDate: t.specificDate } : {}) }))])
  const updateTask= (id,ch)     => persistTasks(p => p.map(t => t.id===id ? {...t,...ch} : t))
  const toggleTask= (id)        => persistTasks(p => p.map(t => t.id===id ? {...t,completed:!t.completed} : t))
  const deleteTask= (id)        => persistTasks(p => p.filter(t => t.id!==id))
  const moveTask  = (id,day)    => persistTasks(p => p.map(t => t.id===id ? {...t,day} : t))
  const clearAllTasks = ()      => persistTasks([])
  const generateRecurring = ()  => { persistTasks(p => p.map(t => t.recurring ? {...t,completed:false} : t)); pushToast('♻️ Recurring tasks reset for new week!','info') }

  // ── Onboarding ────────────────────────────────────────────────────────────
  const [onboardingData, setOnboardingDataState] = useState(() => load(LS.ONBOARD, {}))
  const setOnboardingData = (data) => { save(LS.ONBOARD, data); save('wf_onboard_done', true); setOnboardingDataState(data); const gen = genOnboardingTasks(data); if (gen.length) persistTasks(() => gen); setPage('planner') }

  // ── Week navigation ───────────────────────────────────────────────────────
  const [weekOffset, setWeekOffset] = useState(() => load(LS.WEEK, 0))
  const goToPrevWeek = () => setWeekOffset(o => { const n=o-1; save(LS.WEEK,n); return n })
  const goToNextWeek = () => setWeekOffset(o => { const n=o+1; save(LS.WEEK,n); return n })
  const goToThisWeek = () => { save(LS.WEEK,0); setWeekOffset(0) }
  const currentWeekLabel = weekLabel(weekOffset)

  // ── UI ────────────────────────────────────────────────────────────────────
  // ── Routing helpers (path-based on web, hash-based on Electron) ─────────
  const isElectron = typeof window !== 'undefined' && !!window.electron

  const getPageFromUrl = () => {
    const params = new URLSearchParams(window.location.search)
    // Stripe checkout return
    if (params.get('checkout') === 'success' || params.get('checkout') === 'canceled') {
      return 'checkout'
    }
    // Join-circle invite link
    if (params.get('join-circle')) {
      return 'flowcircle'
    }
    if (isElectron) {
      const hash = window.location.hash.replace('#', '')
      return hash && VALID_PAGES.includes(hash) ? hash : null
    }
    const path = window.location.pathname.replace(/^\//, '')
    return path && VALID_PAGES.includes(path) ? path : null
  }

  const [page, setPage] = useState(() => {
    const urlPage = getPageFromUrl()
    if (urlPage === 'admin') return 'admin'
    
    // Auth Guard
    const PUBLIC_PAGES = ['landing', 'login', 'faq', 'download', 'share']
    const isPublic = !urlPage || PUBLIC_PAGES.includes(urlPage)
    if (!load(LS.AUTH, false) && !isPublic) return 'landing'

    if (urlPage) return urlPage
    if (!load(LS.AUTH, false)) return 'landing'
    const doneOnboarding = load('wf_onboard_done', false) || (()=>{ const ob=load(LS.ONBOARD,{}); return ob&&Object.keys(ob).length>0 })()
    return doneOnboarding ? 'dashboard' : 'onboarding'
  })
  const [darkMode,    setDarkModeRaw] = useState(() => load(LS.DARK, false))
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch,  setShowSearch]  = useState(false)
  const [confetti,    setConfetti]    = useState(false)
  const [showAIChat,  setShowAIChat]  = useState(false)
  const [pendingCircleInvite, setPendingCircleInvite] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const encoded = params.get('join-circle')
      if (!encoded) return null
      const data = JSON.parse(atob(encoded))
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('join-circle')
      window.history.replaceState({}, '', url.pathname + url.search)
      return data
    } catch { return null }
  })

  const setDarkMode = (v) => { setDarkModeRaw(v); save(LS.DARK,v) }
  const navigate    = (to) => {
    setPage(to)
    if (isElectron) {
      window.history.pushState({ page: to }, '', `#${to}`)
    } else {
      const url = to === 'landing' ? '/' : `/${to}`
      window.history.pushState({ page: to }, '', url)
    }
  }

  // Sync initial state into history so the first "back" works correctly
  useEffect(() => {
    if (isElectron) {
      window.history.replaceState({ page }, '', `#${page}`)
    } else {
      const url = page === 'landing' ? '/' : `/${page}`
      window.history.replaceState({ page }, '', url)
    }
    const onPop = (e) => {
      const pg = e.state?.page || getPageFromUrl() || 'landing'
      // Guard: if not logged in, don't allow internal pages from history
      const PUBLIC_PAGES = ['landing', 'login', 'faq', 'download', 'share']
      if (!load(LS.AUTH, false) && !PUBLIC_PAGES.includes(pg)) {
        setPage('landing')
        return
      }
      setPage(pg)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Plan helpers ──────────────────────────────────────────────────────────
  const userPlan   = user?.plan?.toLowerCase() || 'free'
  const isPro      = userPlan === 'pro' || userPlan === 'business'
  const isBusiness = userPlan === 'business'
  const FREE_LIMIT = FREE_TASK_LIMIT

  const canAddTask = () => {
    if (isPro) return true
    return tasks.length < FREE_LIMIT
  }

  const PLAN_LIMITS = {
    free: {
      tasks: 15,
      notes: 10,
      circles: 1,
      circleMembers: 3,
      aiMessagesPerDay: 5,
      analyticsDays: 7,
      pomodoroHistory: false,
      cloudSync: false,
      smartCalendarAI: false,
      googleCalSync: false,
      collisionDetector: false,
      freeWindow: false,
      flowStreakShields: false,
      weekPact: false,
      weekPreview: false,
      exportPDF: false,
      teamPanel: false,
      delegateTasks: false,
      teamReport: false,
    },
    pro: {
      tasks: Infinity,
      notes: Infinity,
      circles: Infinity,
      circleMembers: 10,
      aiMessagesPerDay: Infinity,
      analyticsDays: 90,
      pomodoroHistory: true,
      cloudSync: true,
      smartCalendarAI: true,
      googleCalSync: true,
      collisionDetector: true,
      freeWindow: true,
      flowStreakShields: true,
      weekPact: true,
      weekPreview: true,
      exportPDF: true,
      teamPanel: false,
      delegateTasks: false,
      teamReport: false,
    },
    business: {
      tasks: Infinity,
      notes: Infinity,
      circles: Infinity,
      circleMembers: Infinity,
      aiMessagesPerDay: Infinity,
      analyticsDays: 90,
      pomodoroHistory: true,
      cloudSync: true,
      smartCalendarAI: true,
      googleCalSync: true,
      collisionDetector: true,
      freeWindow: true,
      flowStreakShields: true,
      weekPact: true,
      weekPreview: true,
      exportPDF: true,
      teamPanel: true,
      delegateTasks: true,
      teamReport: true,
    }
  }

  const planLimits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free


  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((msg, type='info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id!==id)), TOAST_TIMEOUT)
  }, [])
  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id!==id))

  // Request push notification permission
  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    const perm = await Notification.requestPermission()
    return perm === 'granted'
  }, [])

  // Send notification — Electron → Tauri → Service Worker → Web Notification
  const sendPushNotification = useCallback((title, body, icon = '/icon-192.png') => {
    // Electron desktop
    if (typeof window !== 'undefined' && window.electron?.notify) {
      try { window.electron.notify(title, body); return } catch {}
    }
    // Tauri desktop
    if (typeof window !== 'undefined' && window.__TAURI__) {
      try { window.__TAURI__.notification?.sendNotification({ title, body }); return } catch {}
    }
    // Try via Service Worker (works when app is backgrounded)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body })
        return
      } catch {}
    }
    // Fallback: direct Web Notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(title, { body, icon }) } catch {}
    }
  }, [])

  // ── Service Worker registration + alarm push ─────────────────────────────────
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => {
          // Push current tasks to SW for background alarm checks
          const sendAlarms = () => {
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'STORE_ALARMS',
                alarms: tasks.map(t => ({ id: t.id, title: t.title, day: t.day, time: t.time }))
              })
            }
          }
          navigator.serviceWorker.ready.then(sendAlarms)
          // Re-send when tasks change
          const timer = setTimeout(sendAlarms, 2000)
          return () => clearTimeout(timer)
        })
        .catch(() => {})
    }
  }, [tasks])

  // ── Alarm: check every minute ─────────────────────────────────────────────
  // tasksRef keeps the interval callback up-to-date without recreating it on every task change.
  const tasksRef = useRef(tasks)
  useEffect(() => { tasksRef.current = tasks }, [tasks])

  useEffect(() => {
    const check = () => {
      const now   = new Date()
      const hh    = now.getHours(); const mm = now.getMinutes()
      const dayMap= ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const today = dayMap[now.getDay()]

      tasksRef.current.forEach(task => {
        if (task.day !== today || task.completed) return
        const [th,tm] = task.time.split(':').map(Number)
        const diff = (th*60+tm)-(hh*60+mm)
        if (diff === 5) {
          pushToast(`⏰ "${task.title}" starts in 5 minutes!`, 'warning')
          sendPushNotification('WeekFlow Reminder', `"${task.title}" starts in 5 minutes!`)
          setNotifications(prev => [{ id:Date.now(), text:`"${task.title}" in 5 min`, time:'just now', read:false }, ...prev.slice(0,9)])
        }
        if (diff === 0) {
          pushToast(`🚀 Time for "${task.title}"!`, 'success')
          sendPushNotification('WeekFlow', `Time for: ${task.title}`)
        }
      })
    }
    const iv = setInterval(check, 60000)
    return () => clearInterval(iv)
  }, [pushToast, sendPushNotification])

  // ── Check for pending circle invites (global — Firebase realtime) ───────────
  useEffect(() => {
    if (!user?.email || !user?.id) return
    const sub = fbSubscribeToInvites(user.email, (invites) => {
      if (!invites?.length) return
      invites.forEach(inv => {
        setNotifications(prev => {
          if (prev.some(n => n.inviteId === inv.id)) return prev
          const safeEmailId = inv.id?.split('__')[0] || inv.id
          const circleInvite = {
            id:           inv.id,
            circle_id:    inv.circleId,
            circle_name:  inv.circleName,
            circle_mode:  inv.circleMode,
            inviter_name: inv.inviterName,
            email:        inv.email,
            safeEmailId,
          }
          return [{ id: Date.now() + Math.random(), text: `📩 ${inv.inviterName} invited you to "${inv.circleName}"`, time: 'just now', read: false, inviteId: inv.id, circleInvite }, ...prev.slice(0, 9)]
        })
      })
      sendPushNotification('FlowCircle Invite', `You have ${invites.length} pending circle invite(s)!`)
    })
    return () => sub.unsubscribe()
  }, [user?.email, user?.id, sendPushNotification])

  // Confetti when all today's tasks done
  useEffect(() => {
    const dayMap = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const today  = dayMap[new Date().getDay()]
    const todays = tasks.filter(t => t.day === today)
    if (todays.length > 0 && todays.every(t => t.completed)) { setConfetti(true); pushToast("🎉 All tasks for today completed! Amazing!", 'success') }
  }, [tasks])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setShowSearch(s=>!s); return }
      if (e.ctrlKey || e.metaKey || e.altKey) return
      switch (e.key.toLowerCase()) {
        case 'n': setShowAddTask(true); break
        case 'd': navigate('dashboard'); break
        case 'p': navigate('planner');   break
        case 't': navigate('daily');     break
        case 'a': navigate('analytics'); break
        case 'f': navigate('pomodoro');  break
        case 's': navigate('settings');  break
        case 'escape':
          setShowAddTask(false); setEditingTask(null); setShowSearch(false); setShowAIChat(false)
          break
        default: break
      }
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  // Firebase handles token refresh automatically — no manual refresh needed

  // ── Search ────────────────────────────────────────────────────────────────
  const searchResults = searchQuery.trim().length > 1
    ? tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  // ── Derived ───────────────────────────────────────────────────────────────
  const getTasksForDay = (day) => tasks.filter(t => t.day === day)
  const completionRate = tasks.length ? Math.round((tasks.filter(t=>t.completed).length / tasks.length) * 100) : 0

  // Expose loginDemo globally for Playwright recorder
  if (typeof window !== 'undefined') {
    window.__loginDemo = loginDemo
    window.__navigate = navigate
  }

  return (
    <AppContext.Provider value={{
      // auth
      isLoggedIn, login, register, logout, deleteAccount, syncing,
      signIn, signUp, signInWithGoogle, signInWithApple, loginDemo,
      // nav
      page, navigate,
      isPro, isBusiness, FREE_LIMIT, canAddTask, planLimits,
      // theme
      darkMode, setDarkMode,
      // tasks
      tasks, addTask, addTasks, updateTask, toggleTask, deleteTask, moveTask, clearAllTasks, generateRecurring,
      // user
      user, setUser,
      // ui
      showAddTask, setShowAddTask,
      editingTask, setEditingTask,
      showAIChat, setShowAIChat,
      onboardingData, setOnboardingData,
      selectedDay, setSelectedDay,
      // week nav
      weekOffset, goToPrevWeek, goToNextWeek, goToThisWeek, currentWeekLabel,
      // search
      searchQuery, setSearchQuery, showSearch, setShowSearch, searchResults,
      // notifications
      notifications, setNotifications, toasts, pushToast, dismissToast,
      requestPushPermission, sendPushNotification,
      // flowcircle invite
      pendingCircleInvite, setPendingCircleInvite,
      // misc
      confetti, setConfetti,
      categoryColors,
      TASK_COLORS,
      weekDays: WEEK_DAYS,
      getTasksForDay,
      completionRate,
    }}>
      <div className={darkMode ? 'dark' : ''}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
