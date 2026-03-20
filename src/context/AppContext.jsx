import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { SUPABASE_ENABLED, sb, supabaseSignIn, supabaseSignUp, supabaseSignOut, isSupabaseConfigured } from '../utils/supabase'
import { TOAST_TIMEOUT, FREE_TASK_LIMIT, VALID_PAGES } from '../utils/constants'

const AppContext = createContext(null)

// ── localStorage helpers ──────────────────────────────────────────────────────
const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
const save = (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

const LS = { TASKS:'wf_tasks', USER:'wf_user', DARK:'wf_dark', AUTH:'wf_auth', TOKEN:'wf_token', ONBOARD:'wf_onboard', WEEK:'wf_week_offset' }

// ── Seed tasks ─────────────────────────────────────────────────────────────---
const SEED = [
  { id:1,  title:'Draft Q4 Roadmap',     category:'Work',  day:'Monday',    time:'09:00', duration:90,  completed:true,  priority:'high',   notes:'', recurring:true,  color:'' },
  { id:2,  title:'Morning Workout',       category:'Gym',   day:'Monday',    time:'07:00', duration:60,  completed:true,  priority:'medium', notes:'', recurring:true,  color:'' },
  { id:3,  title:'Team Standup',          category:'Work',  day:'Tuesday',   time:'10:00', duration:30,  completed:false, priority:'medium', notes:'', recurring:true,  color:'' },
  { id:4,  title:'Study React Patterns',  category:'Study', day:'Tuesday',   time:'19:00', duration:90,  completed:false, priority:'high',   notes:'', recurring:false, color:'' },
  { id:5,  title:'Yoga Session',          category:'Gym',   day:'Wednesday', time:'07:30', duration:45,  completed:false, priority:'low',    notes:'', recurring:true,  color:'' },
  { id:6,  title:'Client Call',           category:'Work',  day:'Wednesday', time:'14:00', duration:60,  completed:false, priority:'high',   notes:'', recurring:false, color:'' },
  { id:7,  title:'Read Design Book',      category:'Study', day:'Thursday',  time:'20:00', duration:60,  completed:false, priority:'low',    notes:'', recurring:false, color:'' },
  { id:8,  title:'Gym – Chest Day',       category:'Gym',   day:'Thursday',  time:'18:00', duration:75,  completed:false, priority:'medium', notes:'', recurring:true,  color:'' },
  { id:9,  title:'Weekly Review',         category:'Work',  day:'Friday',    time:'16:00', duration:60,  completed:false, priority:'medium', notes:'', recurring:true,  color:'' },
  { id:10, title:'Rest & Recovery',       category:'Rest',  day:'Saturday',  time:'10:00', duration:120, completed:false, priority:'low',    notes:'', recurring:false, color:'' },
  { id:11, title:'Meal Prep',             category:'Rest',  day:'Sunday',    time:'15:00', duration:90,  completed:false, priority:'medium', notes:'', recurring:false, color:'' },
]

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
  const { goal='', activities=[], workStart='09:00', workEnd='17:00', wakeUp='07:00', daysOff=['Saturday','Sunday'] } = data
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

  // Work blocks — every work day
  if (activities.includes('work') || goal==='productivity' || goal==='organized')
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
  const [sbToken,    setSbToken]    = useState(() => load(LS.TOKEN, null))
  const [user, setUserState]        = useState(() => load(LS.USER, { name:'Alex Rivers', email:'alex@weekflow.app', plan:'Pro', avatar:null, avatarColor:'#6467f2' }))
  const [syncing, setSyncing]       = useState(false)

  const setUser = useCallback((updater) => {
    setUserState(prev => { const next = typeof updater === 'function' ? updater(prev) : updater; save(LS.USER, next); return next })
  }, [])

  const login = async (name, email, password) => {
    // password=null means OAuth already handled (token already in localStorage)
    if (password === null) {
      const existingToken = localStorage.getItem('wf_token')
      const u = { name: name || email?.split('@')[0] || 'User', email: email || '', plan:'Free', avatar:null, avatarColor:'#6467f2' }
      save(LS.USER, u); setUserState(u)
      save(LS.AUTH, true); setIsLoggedIn(true)
      if (existingToken) { setSbToken(existingToken); syncFromCloud(existingToken) }
      return { ok: true }
    }
    // Try Supabase with email+password
    if (SUPABASE_ENABLED && password) {
      try {
        const res = await supabaseSignIn(email, password)
        const token = res.access_token
        save(LS.TOKEN, token); setSbToken(token)
        const u = { name: res.user?.user_metadata?.name || name || email.split('@')[0], email, plan:'Free', avatar:null, avatarColor:'#6467f2', id: res.user?.id }
        save(LS.USER, u); setUserState(u)
        save(LS.AUTH, true); setIsLoggedIn(true)
        syncFromCloud(token)
        const ob = load(LS.ONBOARD, {})
        setPage(ob && Object.keys(ob).length > 0 ? 'dashboard' : 'onboarding')
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
    if (SUPABASE_ENABLED && password) {
      try {
        const res = await supabaseSignUp(email, password, name)
        // If Supabase returns a session immediately (email confirmation disabled),
        // use it. Otherwise, fall through to local login.
        if (res?.session?.access_token) {
          const token = res.session.access_token
          save(LS.TOKEN, token); setSbToken(token)
          const u = { name, email, plan:'Free', avatar:null, avatarColor:'#6467f2', id: res.user?.id }
          save(LS.USER, u); setUserState(u)
          save(LS.AUTH, true); setIsLoggedIn(true)
          syncFromCloud(token)
          return { ok: true }
        }
        // Email confirmation required: log in locally so they can use the app
        const u = { name, email, plan:'Pro', avatar:null, avatarColor:'#6467f2' }
        save(LS.USER, u); setUserState(u)
        save(LS.AUTH, true); setIsLoggedIn(true)
        return { ok: true, needsConfirmation: true }
      } catch (err) { return { ok: false, error: err.message } }
    }
    return login(name, email)
  }

  const logout = async () => {
    if (sbToken) try { await supabaseSignOut(sbToken) } catch {}
    save(LS.AUTH, false); save(LS.TOKEN, null)
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

    // Detect Electron desktop app
    const isElectron = typeof window !== 'undefined' && window.__WEEKFLOW_DESKTOP__?.isDesktop
    if (isElectron && window.__WEEKFLOW_DESKTOP__?.openUrl) {
      // Open in the user's default browser (Chrome, Edge, etc.)
      window.__WEEKFLOW_DESKTOP__.openUrl(authUrl)
    } else {
      // Normal web browser redirect
      window.location.href = authUrl
    }
  }

  // Apple OAuth via Supabase
  const signInWithApple = async () => {
    const SB_URL = import.meta.env.VITE_SUPABASE_URL || ''
    if (!SB_URL) throw new Error('Supabase not configured')
    const redirectTo = window.location.origin + window.location.pathname
    const authUrl = `${SB_URL}/auth/v1/authorize?provider=apple&redirect_to=${encodeURIComponent(redirectTo)}`
    const isElectron = typeof window !== 'undefined' && window.__WEEKFLOW_DESKTOP__?.isDesktop
    if (isElectron && window.__WEEKFLOW_DESKTOP__?.openUrl) {
      window.__WEEKFLOW_DESKTOP__.openUrl(authUrl)
    } else {
      window.location.href = authUrl
    }
  }

  const deleteAccount = () => { localStorage.clear(); setIsLoggedIn(false); setTasksState(SEED); setUserState({ name:'Alex Rivers', email:'', plan:'Pro', avatar:null, avatarColor:'#6467f2' }); setPage('landing') }

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

  const addTask   = (task)      => persistTasks(p => [...p, { ...task, id:nextId(), completed:false, notes:task.notes||'', recurring:task.recurring||false, color:task.color||'' }])
  const addTasks  = (list)      => persistTasks(p => [...p, ...list.map(t => ({ ...t, id:nextId(), completed:false, notes:t.notes||'', recurring:t.recurring||false, color:t.color||'' }))])
  const updateTask= (id,ch)     => persistTasks(p => p.map(t => t.id===id ? {...t,...ch} : t))
  const toggleTask= (id)        => persistTasks(p => p.map(t => t.id===id ? {...t,completed:!t.completed} : t))
  const deleteTask= (id)        => persistTasks(p => p.filter(t => t.id!==id))
  const moveTask  = (id,day)    => persistTasks(p => p.map(t => t.id===id ? {...t,day} : t))
  const clearAllTasks = ()      => persistTasks([])
  const generateRecurring = ()  => { persistTasks(p => p.map(t => t.recurring ? {...t,completed:false} : t)); pushToast('♻️ Recurring tasks reset for new week!','info') }

  // ── Onboarding ────────────────────────────────────────────────────────────
  const [onboardingData, setOnboardingDataState] = useState(() => load(LS.ONBOARD, {}))
  const setOnboardingData = (data) => { save(LS.ONBOARD, data); setOnboardingDataState(data); const gen = genOnboardingTasks(data); if (gen.length) persistTasks(() => gen); setPage('planner') }

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
    if (isElectron) {
      const hash = window.location.hash.replace('#', '')
      return hash && VALID_PAGES.includes(hash) ? hash : null
    }
    const path = window.location.pathname.replace(/^\//, '')
    return path && VALID_PAGES.includes(path) ? path : null
  }

  const [page, setPage] = useState(() => {
    const urlPage = getPageFromUrl()
    if (urlPage) return urlPage
    if (!load(LS.AUTH, false)) return 'landing'
    const ob = load(LS.ONBOARD, {})
    const doneOnboarding = ob && Object.keys(ob).length > 0
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
      setPage(pg)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Plan helpers ──────────────────────────────────────────────────────────
  const isPro      = user?.plan === 'Pro'
  const FREE_LIMIT = FREE_TASK_LIMIT

  const canAddTask = () => {
    if (isPro) return true
    return tasksState.length < FREE_LIMIT
  }


  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([
    { id:1, text:'Morning Workout starting in 30 min', time:'2m ago',  read:false },
    { id:2, text:'Team Standup in 1 hour',             time:'15m ago', read:false },
    { id:3, text:'Weekly review completed!',           time:'1h ago',  read:true  },
  ])
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

  // Send notification — Tauri → Service Worker → Web Notification
  const sendPushNotification = useCallback((title, body, icon = '/icon-192.png') => {
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
      isSupabaseConfigured: () => SUPABASE_ENABLED,
      // nav
      page, navigate,
      isPro, FREE_LIMIT, canAddTask,
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
