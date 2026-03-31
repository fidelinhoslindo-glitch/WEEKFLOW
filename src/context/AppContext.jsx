import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { SUPABASE_ENABLED, sb, supabaseSignIn, supabaseSignUp, supabaseSignOut, supabaseRefreshToken } from '../utils/supabase'
import { TOAST_TIMEOUT, FREE_TASK_LIMIT, VALID_PAGES } from '../utils/constants'
import { ensureFirebaseAuth } from '../utils/firebase'
import { fbSubscribeToInvites } from '../utils/firebaseCircle'

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
  const [sbToken,    setSbToken]    = useState(() => {
    // On init: if token is expired or is a service/anon key, clear it
    const t = load(LS.TOKEN, null)
    if (!t) return null
    try {
      const payload = JSON.parse(atob(t.split('.')[1]))
      if (Date.now() > payload.exp * 1000) return null
      // Reject service_role and anon keys — only accept user JWTs
      if (payload.role === 'service_role' || payload.role === 'anon') {
        localStorage.removeItem(LS.TOKEN)
        return null
      }
    } catch {}
    return t
  })
  const [user, setUserState]        = useState(() => load(LS.USER, { name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' }))
  const [syncing, setSyncing]       = useState(false)

  const setUser = useCallback((updater) => {
    setUserState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; save(LS.USER, next); return next })
  }, [])

  const login = async (name, email, password) => {
    // password=null means OAuth already handled (token already in localStorage)
    if (password === null) {
      const existingToken = load(LS.TOKEN, null)
      const tokenId = (() => { try { return JSON.parse(atob((existingToken||'').split('.')[1])).sub||null } catch { return null } })()
      const u = { name: name || email?.split('@')[0] || 'User', email: email || '', plan:'Free', avatar:null, avatarColor:'#6467f2', id: tokenId }
      save(LS.USER, u); setUserState(u)
      save(LS.AUTH, true); setIsLoggedIn(true)
      if (existingToken) { setSbToken(existingToken); syncFromCloud(existingToken) }
      return { ok: true }
    }
    // Try Supabase with email+password
    if (SUPABASE_ENABLED && password) {
      try {
        const res = await supabaseSignIn(email, password)
        // Clear previous user data before loading new user's data
        localStorage.removeItem(LS.TASKS); localStorage.removeItem(LS.ONBOARD); localStorage.removeItem(LS.WEEK); localStorage.removeItem('wf_notes'); localStorage.removeItem('wf_completion_history')
        setTasksState([]); setOnboardingDataState({})
        const token = res.access_token
        save(LS.TOKEN, token); setSbToken(token)
        if (res.refresh_token) localStorage.setItem('wf_refresh_token', JSON.stringify(res.refresh_token))
        const u = { name: res.user?.user_metadata?.name || name || email.split('@')[0], email, plan:'Free', avatar:null, avatarColor:'#6467f2', id: res.user?.id }
        save(LS.USER, u); setUserState(u)
        save(LS.AUTH, true); setIsLoggedIn(true)
        ensureFirebaseAuth()
        syncFromCloud(token)
        const doneOnboard = load('wf_onboard_done', false) || (load(LS.ONBOARD,{}) && Object.keys(load(LS.ONBOARD,{})).length > 0)
        setPage(doneOnboard ? 'dashboard' : 'onboarding')
        return { ok: true }
      } catch (err) {
        return { ok: false, error: err.message }
      }
    }
    // Fallback: local-only (demo mode)
    const u = { name: name || 'Demo User', email: email || 'demo@weekflow.app', plan:'Pro', avatar:null, avatarColor:'#6467f2' }
    save(LS.USER, u); setUserState(u)
    save(LS.AUTH, true); setIsLoggedIn(true)
    return { ok: true }
  }

  const register = async (name, email, password) => {
    // Clean previous data so new account starts fresh
    localStorage.removeItem(LS.TASKS)
    localStorage.removeItem(LS.ONBOARD)
    localStorage.removeItem(LS.WEEK)
    setTasksState([])
    setOnboardingDataState({})

    if (SUPABASE_ENABLED && password) {
      try {
        const res = await supabaseSignUp(email, password, name)
        if (res?.session?.access_token) {
          const token = res.session.access_token
          save(LS.TOKEN, token); setSbToken(token)
          const u = { name, email, plan:'Free', avatar:null, avatarColor:'#6467f2', id: res.user?.id }
          save(LS.USER, u); setUserState(u)
          save(LS.AUTH, true); setIsLoggedIn(true)
          return { ok: true }
        }
        const u = { name, email, plan:'Free', avatar:null, avatarColor:'#6467f2' }
        save(LS.USER, u); setUserState(u)
        save(LS.AUTH, true); setIsLoggedIn(true)
        return { ok: true, needsConfirmation: true }
      } catch (err) { return { ok: false, error: err.message } }
    }
    return login(name, email)
  }

  const logout = async () => {
    if (sbToken) try { await supabaseSignOut(sbToken) } catch {}
    // Clear all user-specific data so next login starts clean
    localStorage.removeItem(LS.TASKS)
    localStorage.removeItem(LS.ONBOARD)
    localStorage.removeItem(LS.WEEK)
    localStorage.removeItem(LS.USER)
    localStorage.removeItem('wf_notes')
    localStorage.removeItem('wf_completion_history')
    setTasksState([])
    setOnboardingDataState({})
    setUserState({ name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' })
    save(LS.AUTH, false); localStorage.removeItem(LS.TOKEN); localStorage.removeItem('wf_refresh_token')
    setIsLoggedIn(false); setSbToken(null); setPage('landing')
  }

  // ── Auth aliases used by LoginPage ────────────────────────────────────────
  const signIn = async (email, password) => {
    const res = await login(null, email, password)
    if (res && res.ok === false) throw new Error(res.error || 'Sign in failed')
    return res
  }

  const signUp = async (name, email, password) => {
    const res = await register(name, email, password)
    if (res && res.ok === false) throw new Error(res.error || 'Sign up failed')
    return res
  }

  // Google OAuth via Supabase
  // In Electron: opens default browser (so OAuth popup doesn't freeze)
  // In browser: redirects normally
  const signInWithGoogle = async () => {
    const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
    if (!SB_URL) throw new Error('Supabase not configured')
    // Redirect back to app after Google login
    const redirectTo = window.location.origin + window.location.pathname
    const authUrl = `${SB_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`

    // Detect Electron desktop app — open OAuth in system browser
    if (window.electron?.openExternal) {
      window.electron.openExternal(authUrl)
    } else {
      window.location.href = authUrl
    }
  }

  // Apple OAuth via Supabase
  const signInWithApple = async () => {
    const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
    if (!SB_URL) throw new Error('Supabase not configured')
    const redirectTo = window.location.origin + window.location.pathname
    const authUrl = `${SB_URL}/auth/v1/authorize?provider=apple&redirect_to=${encodeURIComponent(redirectTo)}`
    if (window.electron?.openExternal) {
      window.electron.openExternal(authUrl)
    } else {
      window.location.href = authUrl
    }
  }

  const deleteAccount = () => { localStorage.clear(); setIsLoggedIn(false); setTasksState([]); setUserState({ name:'', email:'', plan:'Free', avatar:null, avatarColor:'#6467f2' }); setPage('landing') }

  // ── Cloud sync ────────────────────────────────────────────────────────────
  const syncFromCloud = useCallback(async (token) => {
    if (!SUPABASE_ENABLED || !token) return
    setSyncing(true)
    try {
      const cloudTasks = await sb.tasks.list(token)
      if (cloudTasks?.length > 0) { setTasksState(cloudTasks); save(LS.TASKS, cloudTasks) }
    } catch {}
    setSyncing(false)
  }, [])

  const syncToCloud = useCallback(async (tasks) => {
    if (!SUPABASE_ENABLED || !sbToken || !user.id) return
    const withUser = tasks.map(t => ({ ...t, user_id: user.id }))
    try { await sb.tasks.upsert(sbToken, withUser) } catch {}
  }, [sbToken, user.id])

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
    if (!user?.email) return
    // Ensure Firebase anonymous auth is active before subscribing
    ensureFirebaseAuth().then(() => {
      const sub = fbSubscribeToInvites(user.email, (invites) => {
        if (!invites?.length) return
        invites.forEach(inv => {
          setNotifications(prev => {
            if (prev.some(n => n.inviteId === inv.id)) return prev
            // Normalize fields so Header.jsx openInviteModal + joinCircle work correctly
            // inv.id = inboxId (e.g. "user_email__circleId")
            // safeEmailId = email part before __ separator (used by fbUpdateInviteStatus)
            const safeEmailId = inv.id?.split('__')[0] || inv.id
            const circleInvite = {
              id:           inv.id,
              circle_id:    inv.circleId,
              circle_name:  inv.circleName,
              circle_mode:  inv.circleMode,
              inviter_name: inv.inviterName,
              email:        inv.email,
              safeEmailId,              // needed to call fbUpdateInviteStatus
            }
            return [{ id: Date.now() + Math.random(), text: `📩 ${inv.inviterName} invited you to "${inv.circleName}"`, time: 'just now', read: false, inviteId: inv.id, circleInvite }, ...prev.slice(0, 9)]
          })
        })
        sendPushNotification('FlowCircle Invite', `You have ${invites.length} pending circle invite(s)!`)
      })
      return () => sub.unsubscribe()
    })
  }, [user?.email, sendPushNotification])

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

  // ── Auto-refresh JWT token (on load + every 5min) ────────────────────────
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const rt = localStorage.getItem('wf_refresh_token')
        if (!rt) return
        const refreshToken = JSON.parse(rt)
        // If token exists and still has > 5min, skip
        const currentToken = load(LS.TOKEN, null)
        if (currentToken) {
          try { const exp = JSON.parse(atob(currentToken.split('.')[1])).exp * 1000; if (exp - Date.now() > 5 * 60 * 1000) return } catch {}
        }
        const res = await supabaseRefreshToken(refreshToken)
        if (res.access_token) {
          save(LS.TOKEN, res.access_token); setSbToken(res.access_token)
          if (res.refresh_token) localStorage.setItem('wf_refresh_token', JSON.stringify(res.refresh_token))
        }
      } catch {}
    }
    tryRefresh() // run immediately on mount
    const interval = setInterval(tryRefresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, []) // only once on mount

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

  return (
    <AppContext.Provider value={{
      // auth
      isLoggedIn, login, register, logout, deleteAccount, syncing,
      signIn, signUp, signInWithGoogle, signInWithApple,
      sbEnabled: SUPABASE_ENABLED,
      sbToken,
      isSupabaseConfigured: () => SUPABASE_ENABLED,
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
