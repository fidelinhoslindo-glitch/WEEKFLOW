import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import DayProgressWidget from '../components/DayProgressWidget'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useState } from 'react'

// ─── Daily Detail ─────────────────────────────────────────────────────────────
export function DailyDetailPage() {
  const { tasks, toggleTask, weekDays, categoryColors, setShowAddTask } = useApp()
  const [activeDay, setActiveDay] = useState('Monday')

  const todayTasks = tasks.filter(t => t.day === activeDay)
  const done = todayTasks.filter(t => t.completed).length
  const pct = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Daily Detail" subtitle={activeDay} />
        <main className="flex-1 flex overflow-hidden">
          {/* Left: day list */}
          <aside className="w-48 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-1">
            {weekDays.map(day => {
              const dt = tasks.filter(t => t.day === day)
              const dd = dt.filter(t => t.completed).length
              return (
                <button key={day} onClick={() => setActiveDay(day)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${activeDay === day ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <span>{day.slice(0,3)}</span>
                  <span className="text-xs">{dd}/{dt.length}</span>
                </button>
              )
            })}
          </aside>

          {/* Right: tasks */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Day header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black">{activeDay}</h3>
                <p className="text-slate-500 text-sm">{done}/{todayTasks.length} tasks · {pct}% complete</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 flex items-center justify-center" style={{ background: `conic-gradient(#6467f2 0% ${pct}%, #e2e8f0 ${pct}% 100%)`, borderRadius: '50%' }}>
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-black text-primary">{pct}%</span>
                  </div>
                </div>
                <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                  <span className="material-symbols-outlined text-sm">add</span> Add Task
                </button>
              </div>
            </div>

            {/* Progress widget */}
            <DayProgressWidget day={activeDay} />

            {/* Task list */}
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-primary/30 mb-4">event_available</span>
                <h3 className="text-xl font-bold mb-2">No tasks for {activeDay}</h3>
                <p className="text-slate-400 mb-6">Your day is wide open. Add some tasks to get started!</p>
                <button onClick={() => setShowAddTask(true)} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">Add First Task</button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.sort((a, b) => a.time.localeCompare(b.time)).map(task => {
                  const c = categoryColors[task.category]
                  return (
                    <div key={task.id} onClick={() => toggleTask(task.id)}
                      className={`group flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${task.completed ? `${c.bg} ${c.border} opacity-60` : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:${c.border} hover:${c.bg}`}`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${task.completed ? `${c.dot} border-transparent` : `border-slate-300 dark:border-slate-600 group-hover:border-primary`}`}>
                        {task.completed && <span className="material-symbols-outlined text-white text-sm fill-icon">check</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>{task.category}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{task.priority}</span>
                        </div>
                        <h4 className={`font-bold text-base ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span>{task.time}</span>
                          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">timer</span>{task.duration}m</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Routine Templates ─────────────────────────────────────────────────────────
const WEEK = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const WORK = WEEK.slice(0,5)

const TEMPLATES = [
  {
    id: 1, name: 'Morning Warrior', icon: 'wb_sunny', cat: 'Wellness', tasks: 5, hours: 2,
    color: 'bg-amber-100 dark:bg-amber-900/30', textColor: 'text-amber-700 dark:text-amber-300',
    desc: 'High-energy morning routine with exercise, meditation, and journaling.',
    taskList: [
      ...WORK.map(d => ({ title:'Morning Meditation 🧘', category:'Rest',  day:d, time:'06:30', duration:15, priority:'medium', recurring:true })),
      ...WORK.map(d => ({ title:'Morning Workout 💪',   category:'Gym',   day:d, time:'07:00', duration:45, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Journal Writing 📓',   category:'Other', day:d, time:'07:55', duration:10, priority:'low',    recurring:true })),
    ],
  },
  {
    id: 2, name: 'Deep Work Pro', icon: 'psychology', cat: 'Work', tasks: 6, hours: 8,
    color: 'bg-primary/10', textColor: 'text-primary',
    desc: 'Focused work blocks with Pomodoro cycles and strategic breaks.',
    taskList: [
      ...WORK.map(d => ({ title:'Deep Work Block 1 🧠',  category:'Work', day:d, time:'09:00', duration:90, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Email & Messages 📧',   category:'Work', day:d, time:'10:45', duration:30, priority:'medium', recurring:true })),
      ...WORK.map(d => ({ title:'Deep Work Block 2 🧠',  category:'Work', day:d, time:'11:15', duration:90, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Lunch Break 🍽️',       category:'Rest', day:d, time:'13:00', duration:60, priority:'low',    recurring:true })),
      ...WORK.map(d => ({ title:'Afternoon Focus ⚡',    category:'Work', day:d, time:'14:00', duration:90, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Daily Review 📋',       category:'Work', day:d, time:'16:30', duration:30, priority:'medium', recurring:true })),
    ],
  },
  {
    id: 3, name: 'Fitness First', icon: 'fitness_center', cat: 'Gym', tasks: 4, hours: 1.5,
    color: 'bg-emerald-100 dark:bg-emerald-900/30', textColor: 'text-emerald-700 dark:text-emerald-300',
    desc: 'Balanced workout schedule covering strength, cardio, and recovery.',
    taskList: [
      { title:'Chest & Triceps 💪', category:'Gym', day:'Monday',    time:'07:00', duration:60, priority:'high',   recurring:true },
      { title:'Cardio Run 🏃',      category:'Gym', day:'Tuesday',   time:'07:00', duration:40, priority:'medium', recurring:true },
      { title:'Back & Biceps 💪',   category:'Gym', day:'Wednesday', time:'07:00', duration:60, priority:'high',   recurring:true },
      { title:'Rest & Stretch 🧘',  category:'Rest',day:'Thursday',  time:'08:00', duration:30, priority:'low',    recurring:true },
      { title:'Legs Day 🦵',        category:'Gym', day:'Friday',    time:'07:00', duration:60, priority:'high',   recurring:true },
      { title:'HIIT Session 🔥',    category:'Gym', day:'Saturday',  time:'09:00', duration:45, priority:'medium', recurring:true },
      { title:'Active Recovery 🚶', category:'Rest',day:'Sunday',    time:'10:00', duration:60, priority:'low',    recurring:true },
    ],
  },
  {
    id: 4, name: 'Student Ace', icon: 'school', cat: 'Study', tasks: 5, hours: 4,
    color: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300',
    desc: 'Study sessions with active recall, breaks, and review cycles.',
    taskList: [
      ...WORK.map(d => ({ title:'Morning Review 📖',     category:'Study', day:d, time:'08:00', duration:30, priority:'medium', recurring:true })),
      ...WORK.map(d => ({ title:'Deep Study Block 📚',   category:'Study', day:d, time:'09:00', duration:90, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Active Recall Practice',category:'Study', day:d, time:'14:00', duration:60, priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Evening Review 🌙',     category:'Study', day:d, time:'19:00', duration:60, priority:'medium', recurring:true })),
      { title:'Weekly Summary 📝',  category:'Study', day:'Sunday',   time:'16:00', duration:90, priority:'medium', recurring:true },
    ],
  },
  {
    id: 5, name: 'Work-Life Balance', icon: 'balance', cat: 'Balance', tasks: 8, hours: 6,
    color: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-300',
    desc: 'The perfect mix of productive work and quality personal time.',
    taskList: [
      ...WORK.map(d => ({ title:'Morning Walk 🌅',        category:'Gym',   day:d, time:'07:30', duration:20, priority:'low',    recurring:true })),
      ...WORK.map(d => ({ title:'Work Focus Block 💼',    category:'Work',  day:d, time:'09:00', duration:120,priority:'high',   recurring:true })),
      ...WORK.map(d => ({ title:'Lunch + Break 🍽️',      category:'Rest',  day:d, time:'12:00', duration:60, priority:'low',    recurring:true })),
      ...WORK.map(d => ({ title:'Afternoon Work 📋',      category:'Work',  day:d, time:'13:00', duration:120,priority:'medium', recurring:true })),
      ...WORK.map(d => ({ title:'Personal Time 🎯',       category:'Other', day:d, time:'17:00', duration:60, priority:'medium', recurring:true })),
      { title:'Weekend Hobby 🎨',   category:'Other', day:'Saturday', time:'10:00', duration:120,priority:'medium', recurring:true },
      { title:'Family/Friends 👥',  category:'Other', day:'Sunday',   time:'14:00', duration:180,priority:'high',   recurring:true },
    ],
  },
  {
    id: 6, name: 'Digital Detox', icon: 'phone_disabled', cat: 'Wellness', tasks: 3, hours: 3,
    color: 'bg-rose-100 dark:bg-rose-900/30', textColor: 'text-rose-700 dark:text-rose-300',
    desc: 'Offline activities to recharge: nature, reading, and cooking.',
    taskList: [
      { title:'Morning Nature Walk 🌳',  category:'Gym',   day:'Saturday', time:'08:00', duration:60, priority:'medium', recurring:true },
      { title:'Reading Session 📚',      category:'Study', day:'Saturday', time:'10:00', duration:90, priority:'low',    recurring:true },
      { title:'Cook a New Recipe 🍳',    category:'Other', day:'Saturday', time:'15:00', duration:90, priority:'low',    recurring:true },
      { title:'Journaling 📓',           category:'Other', day:'Sunday',   time:'09:00', duration:30, priority:'low',    recurring:true },
      { title:'Yoga & Stretch 🧘',       category:'Rest',  day:'Sunday',   time:'10:00', duration:45, priority:'medium', recurring:true },
      { title:'Offline Social Time 👥',  category:'Other', day:'Sunday',   time:'15:00', duration:120,priority:'medium', recurring:true },
    ],
  },
]

export function RoutineTemplatesPage() {
  const { navigate, addTasks, pushToast } = useApp()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [applied, setApplied] = useState(null)

  const cats = ['All', 'Work', 'Gym', 'Study', 'Wellness', 'Balance']
  const shown = TEMPLATES.filter(t => (filter === 'All' || t.cat === filter) && (!search || t.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Routine Templates" subtitle="Discover weekly structures by productivity experts" />
        <main className="flex-1 p-6 lg:p-8">
          {/* Search + filter */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 w-72">
              <span className="material-symbols-outlined text-slate-400">search</span>
              <input className="bg-transparent border-none focus:outline-none text-sm w-full ml-2 placeholder:text-slate-400" placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === c ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary'}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
                <div className={`w-14 h-14 ${t.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <span className={`material-symbols-outlined text-3xl ${t.textColor}`}>{t.icon}</span>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${t.textColor} mb-2 block`}>{t.cat}</span>
                <h3 className="text-lg font-black mb-2">{t.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed">{t.desc}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">task_alt</span>{t.tasks} tasks</span>
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">schedule</span>{t.hours}h/day</span>
                </div>
                <button
                  onClick={() => {
                    if (t.taskList?.length) {
                      addTasks(t.taskList.map((task, i) => ({
                        ...task, notes: `From template: ${t.name}`,
                        color: '', id: undefined,
                      })))
                      pushToast(`✅ ${t.taskList.length} tasks from "${t.name}" added to your planner!`, 'success')
                    }
                    setApplied(t.id)
                    setTimeout(() => setApplied(null), 2500)
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${applied === t.id ? 'bg-emerald-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}>
                  {applied === t.id ? '✓ Template Applied!' : 'Use This Template'}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// ─── Calendar View ─────────────────────────────────────────────────────────────
export function CalendarPage() {
  const { tasks, categoryColors, setShowAddTask, setSelectedDay } = useApp()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showHolidays, setShowHolidays] = useState(true)

  const year  = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const DOW_TO_NAME = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  const HOLIDAYS = {
    '01-01': { name: "New Year's Day", emoji: '🎆', grad: 'from-yellow-400 to-amber-500'    },
    '02-14': { name: "Valentine's Day",emoji: '💖', grad: 'from-pink-400 to-rose-500'       },
    '04-21': { name: "Tiradentes",     emoji: '🇧🇷', grad: 'from-green-400 to-emerald-600'  },
    '05-01': { name: "Labour Day",     emoji: '👷', grad: 'from-orange-400 to-red-500'      },
    '06-12': { name: "Dia Namorados",  emoji: '💕', grad: 'from-pink-300 to-red-400'        },
    '09-07': { name: "Independência",  emoji: '🇧🇷', grad: 'from-yellow-400 to-green-500'   },
    '10-12': { name: "N.S. Aparecida", emoji: '🙏', grad: 'from-blue-300 to-indigo-500'     },
    '10-31': { name: "Halloween",      emoji: '🎃', grad: 'from-orange-500 to-gray-700'     },
    '11-02': { name: "Finados",        emoji: '🕯️', grad: 'from-slate-400 to-slate-700'    },
    '11-15': { name: "Rep. Brasileira",emoji: '🇧🇷', grad: 'from-green-500 to-yellow-500'   },
    '11-20': { name: "Consc. Negra",   emoji: '✊', grad: 'from-amber-600 to-yellow-500'    },
    '12-08': { name: "N.S. Conceição", emoji: '🙏', grad: 'from-blue-300 to-sky-400'        },
    '12-24': { name: "Christmas Eve",  emoji: '🎄', grad: 'from-green-500 to-red-500'       },
    '12-25': { name: "Christmas Day",  emoji: '🎅', grad: 'from-red-500 to-green-600'       },
    '12-31': { name: "New Year's Eve", emoji: '🥂', grad: 'from-yellow-300 to-amber-500'    },
    '2025-03-03': { name: "Carnaval",  emoji: '🎭', grad: 'from-purple-500 to-pink-500'     },
    '2025-03-04': { name: "Carnaval",  emoji: '🎭', grad: 'from-purple-500 to-pink-500'     },
    '2025-04-18': { name: "Sexta-feira Santa", emoji: '✝️', grad: 'from-slate-500 to-slate-700' },
    '2025-04-20': { name: "Easter",    emoji: '🐣', grad: 'from-yellow-300 to-pink-400'     },
    '2025-05-11': { name: "Dia das Mães", emoji: '💐', grad: 'from-pink-400 to-rose-500'   },
    '2025-08-10': { name: "Dia dos Pais", emoji: '👔', grad: 'from-blue-400 to-indigo-500'  },
    '2026-02-16': { name: "Carnaval",  emoji: '🎭', grad: 'from-purple-500 to-pink-500'     },
    '2026-02-17': { name: "Carnaval",  emoji: '🎭', grad: 'from-purple-500 to-pink-500'     },
    '2026-04-03': { name: "Sexta-feira Santa", emoji: '✝️', grad: 'from-slate-500 to-slate-700' },
    '2026-04-05': { name: "Easter",    emoji: '🐣', grad: 'from-yellow-300 to-pink-400'     },
    '2026-05-10': { name: "Dia das Mães", emoji: '💐', grad: 'from-pink-400 to-rose-500'   },
    '2026-08-09': { name: "Dia dos Pais", emoji: '👔', grad: 'from-blue-400 to-indigo-500'  },
  }

  const getHoliday = (date) => {
    const mm  = String(month + 1).padStart(2, '0')
    const dd  = String(date).padStart(2, '0')
    const full = `${year}-${mm}-${dd}`
    const mon  = `${mm}-${dd}`
    return HOLIDAYS[full] || HOLIDAYS[mon] || null
  }

  const getDayTasks = (date) => {
    const dow = new Date(year, month, date).getDay()
    return tasks.filter(t => t.day === DOW_TO_NAME[dow])
  }

  const today = new Date()
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7
  const selectedTasks   = selectedDate ? getDayTasks(selectedDate) : []
  const selectedHoliday = selectedDate ? getHoliday(selectedDate) : null

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Calendar" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">

          {/* Nav controls */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="text-xl lg:text-2xl font-black min-w-44 text-center">{monthName}</h2>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors">
              Today
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setShowHolidays(h => !h)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${showHolidays ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                <span className="material-symbols-outlined text-sm">celebration</span>
                <span className="hidden sm:inline">{showHolidays ? 'Holidays on' : 'Holidays off'}</span>
              </button>
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90 shadow-lg shadow-primary/25">
                <span className="material-symbols-outlined text-sm">add</span>
                <span className="hidden sm:inline">Add Task</span>
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-5">
            {/* Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-3 text-center text-xs font-black uppercase tracking-wider text-slate-400">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {Array.from({ length: totalCells }, (_, ci) => {
                const date    = ci - firstDayOfWeek + 1
                const inMonth = date >= 1 && date <= daysInMonth
                if (!inMonth) return <div key={ci} className="min-h-16 lg:min-h-24 border-b border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10" />

                const holiday  = showHolidays ? getHoliday(date) : null
                const dayTasks = getDayTasks(date)
                const sel      = selectedDate === date
                const isWknd   = ci % 7 === 0 || ci % 7 === 6

                return (
                  <div key={ci} onClick={() => setSelectedDate(date === selectedDate ? null : date)}
                    className={`relative min-h-16 lg:min-h-24 border-b border-r border-slate-100 dark:border-slate-800 cursor-pointer transition-all
                      ${sel ? 'ring-2 ring-inset ring-primary z-10' : ''}
                      ${!holiday && isWknd ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}
                      ${!holiday ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'hover:brightness-105'}
                    `}>

                    {/* Holiday gradient bg */}
                    {holiday && (
                      <div className={`absolute inset-0 bg-gradient-to-br ${holiday.grad} opacity-25 dark:opacity-35`} />
                    )}

                    <div className="relative p-1.5 lg:p-2 h-full flex flex-col">
                      {/* Date + emoji row */}
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`inline-flex w-6 h-6 lg:w-7 lg:h-7 items-center justify-center rounded-full text-xs lg:text-sm font-black
                          ${isToday(date) ? 'bg-primary text-white shadow-lg shadow-primary/40' : sel ? 'bg-primary/20 text-primary' : 'text-slate-700 dark:text-slate-300'}
                        `}>{date}</span>
                        {holiday && <span className="text-sm lg:text-lg leading-none">{holiday.emoji}</span>}
                      </div>

                      {/* Holiday label (desktop) */}
                      {holiday && (
                        <p className="hidden lg:block text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate mb-0.5">{holiday.name}</p>
                      )}

                      {/* Tasks */}
                      <div className="flex-1 space-y-0.5 overflow-hidden">
                        {dayTasks.slice(0, 2).map(t => {
                          const c = categoryColors[t.category] || categoryColors.Work
                          return (
                            <div key={t.id} className={`text-[9px] lg:text-[10px] font-semibold px-1 py-0.5 rounded truncate ${c.bg} ${c.text}`}>
                              {t.title}
                            </div>
                          )
                        })}
                        {dayTasks.length > 2 && <span className="text-[9px] text-slate-400 font-bold">+{dayTasks.length - 2}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Holiday legend for the month */}
          {showHolidays && (() => {
            const monthHolidays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
              .map(d => ({ date: d, h: getHoliday(d) }))
              .filter(x => x.h)
            if (monthHolidays.length === 0) return null
            return (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">Holidays this month</p>
                <div className="flex flex-wrap gap-2">
                  {monthHolidays.map(({ date, h }) => (
                    <button key={date} onClick={() => setSelectedDate(date)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105 border border-transparent"
                      style={{ background: 'linear-gradient(135deg, rgba(100,103,242,0.1), rgba(139,92,246,0.1))' }}>
                      <span>{h.emoji}</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {String(month + 1).padStart(2,'0')}/{String(date).padStart(2,'0')} · {h.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* Selected day detail */}
          {selectedDate && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className={`px-5 py-4 ${selectedHoliday ? `bg-gradient-to-r ${selectedHoliday.grad}` : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className={`font-black text-base lg:text-lg ${selectedHoliday ? 'text-white drop-shadow' : ''}`}>
                      {currentMonth.toLocaleString('en-US', { month: 'long' })} {selectedDate}, {year}
                    </h3>
                    {selectedHoliday && (
                      <p className="text-white/90 text-sm font-semibold">{selectedHoliday.emoji} {selectedHoliday.name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowAddTask(true); setSelectedDay(DOW_TO_NAME[new Date(year, month, selectedDate).getDay()]) }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold ${selectedHoliday ? 'bg-white/25 text-white hover:bg-white/40' : 'bg-primary text-white hover:opacity-90'}`}>
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Task
                  </button>
                </div>
              </div>
              <div className="p-5">
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 block mb-2">event_available</span>
                    <p className="text-slate-400 text-sm">No tasks for this day.</p>
                    {selectedHoliday && <p className="text-slate-300 text-xs mt-1">Enjoy the holiday!</p>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks.sort((a,b) => a.time.localeCompare(b.time)).map(t => {
                      const c = categoryColors[t.category] || categoryColors.Work
                      return (
                        <div key={t.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 ${c.bg} ${c.border}`}>
                          <span className={`material-symbols-outlined text-sm ${c.text}`}>
                            {t.category==='Work'?'work':t.category==='Gym'?'fitness_center':t.category==='Study'?'school':t.category==='Rest'?'spa':'category'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                            <p className="text-xs text-slate-400">{t.time} · {t.duration}min · {t.priority}</p>
                          </div>
                          {t.completed && <span className="material-symbols-outlined text-emerald-500" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export function AnalyticsPage() {
  const { tasks, weekDays, categoryColors, navigate, planLimits, isPro } = useApp()

  // ── Computed stats ────────────────────────────────────────────────────────
  const total        = tasks.length
  const completed    = tasks.filter(t => t.completed).length
  const completionPct= total ? Math.round((completed/total)*100) : 0
  const totalMins    = tasks.reduce((s,t) => s + (t.duration||0), 0)
  const highPriority = tasks.filter(t => t.priority==='high').length
  const recurring    = tasks.filter(t => t.recurring).length

  // By category
  const byCat = Object.entries(categoryColors).map(([cat, c]) => ({
    cat, c,
    count:    tasks.filter(t=>t.category===cat).length,
    done:     tasks.filter(t=>t.category===cat&&t.completed).length,
  })).filter(x=>x.count>0)

  // By day
  const byDay = weekDays.map(day => ({
    day: day.slice(0,3),
    total: tasks.filter(t=>t.day===day).length,
    done:  tasks.filter(t=>t.day===day&&t.completed).length,
  }))

  const maxDayCount = Math.max(...byDay.map(d=>d.total), 1)

  // By priority
  const byPriority = [
    { label:'High',   color:'bg-red-500',    count: tasks.filter(t=>t.priority==='high').length },
    { label:'Medium', color:'bg-amber-400',  count: tasks.filter(t=>t.priority==='medium').length },
    { label:'Low',    color:'bg-emerald-500',count: tasks.filter(t=>t.priority==='low').length },
  ]
  const maxPriCount = Math.max(...byPriority.map(p=>p.count), 1)

  // Busiest day
  const busiestDay = [...byDay].sort((a,b)=>b.total-a.total)[0]

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Analytics" subtitle="Insights from your real task data" />
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          {/* Free plan banner */}
          {!isPro && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="text-sm font-black">Mostrando últimos {planLimits.analyticsDays} dias</p>
                  <p className="text-xs text-slate-500">Ver 90 dias de histórico com o plano Pro</p>
                </div>
              </div>
              <button onClick={() => navigate('checkout')}
                className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl hover:opacity-90 shrink-0">
                Ver Pro →
              </button>
            </div>
          )}
          <div className="flex justify-end">
            <button onClick={() => navigate('settings')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40 hover:text-primary transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              Export Data
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">bar_chart</span>
              <p className="text-slate-400 font-medium text-lg">No tasks yet</p>
              <p className="text-slate-300 text-sm mt-1">Add some tasks to see your analytics</p>
            </div>
          ) : (
            <>
              {/* ── Top stats ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label:'Total Tasks',    value:total,         icon:'task_alt',     color:'bg-primary/10 text-primary' },
                  { label:'Completed',      value:completed,     icon:'check_circle',  color:'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
                  { label:'Completion Rate',value:completionPct+'%', icon:'percent',   color:'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
                  { label:'Total Hours',    value:Math.round(totalMins/60*10)/10+'h', icon:'schedule', color:'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                    <span className={`material-symbols-outlined p-2 rounded-xl text-sm block w-fit mb-3 ${s.color}`} style={{fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-black mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* ── Completion bar ── */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-base">Overall Progress</h3>
                  <span className="text-2xl font-black text-primary">{completionPct}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full transition-all duration-1000 ${completionPct===100?'bg-emerald-500':'bg-gradient-to-r from-primary to-purple-500'}`}
                    style={{width:`${completionPct}%`}}/>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{completed} completed</span>
                  <span>{total-completed} remaining</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ── Tasks by day (bar chart) ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-5">Tasks by Day</h3>
                  <div className="space-y-3">
                    {byDay.map(d => (
                      <div key={d.day} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-8 shrink-0">{d.day}</span>
                        <div className="flex-1 relative h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                          {/* Total bar */}
                          <div className="absolute inset-y-0 left-0 bg-primary/20 rounded-lg transition-all duration-700"
                            style={{width:`${(d.total/maxDayCount)*100}%`}}/>
                          {/* Done bar */}
                          <div className="absolute inset-y-0 left-0 bg-primary rounded-lg transition-all duration-700"
                            style={{width:`${d.total?(d.done/maxDayCount)*100:0}%`}}/>
                          <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                            {d.done}/{d.total}
                          </span>
                        </div>
                        {d.total>0&&d.done===d.total&&(
                          <span className="material-symbols-outlined text-emerald-500 text-sm shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {busiestDay&&busiestDay.total>0&&(
                    <p className="text-xs text-slate-400 mt-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs text-amber-500">star</span>
                      Busiest day: <strong className="text-slate-600 dark:text-slate-300 ml-1">{weekDays[byDay.findIndex(d=>d.day===busiestDay.day)]}</strong> with {busiestDay.total} tasks
                    </p>
                  )}
                </div>

                {/* ── Tasks by category (donut-style) ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-5">By Category</h3>
                  {byCat.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">No category data yet</p>
                  ) : (
                    <div className="space-y-4">
                      {byCat.map(({ cat, c, count, done }) => {
                        const pct = count ? Math.round((done/count)*100) : 0
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${c.dot}`}/>
                                <span className="text-sm font-semibold">{cat}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>{done}/{count}</span>
                                <span className="font-bold text-slate-600 dark:text-slate-300">{pct}%</span>
                              </div>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${c.dot.replace('bg-','bg-').replace('-500','-400')}`}
                                style={{width:`${pct}%`}}/>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ── Priority breakdown ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-5">Priority Breakdown</h3>
                  <div className="space-y-3">
                    {byPriority.map(p => (
                      <div key={p.label} className="flex items-center gap-3">
                        <span className="text-xs font-bold w-14 shrink-0 text-slate-500">{p.label}</span>
                        <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                          <div className={`absolute inset-y-0 left-0 ${p.color} rounded-lg transition-all duration-700 opacity-80`}
                            style={{width:`${(p.count/maxPriCount)*100}%`}}/>
                          <span className="absolute inset-0 flex items-center px-2 text-xs font-bold text-slate-700 dark:text-slate-200">{p.count} tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Quick insights ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-5">Quick Insights</h3>
                  <div className="space-y-3">
                    {[
                      { icon:'repeat',       color:'text-primary bg-primary/10',    label:'Recurring tasks', value:recurring },
                      { icon:'priority_high',color:'text-red-500 bg-red-100',       label:'High priority',   value:highPriority },
                      { icon:'schedule',     color:'text-amber-600 bg-amber-100',   label:'Avg task length', value:total?Math.round(totalMins/total)+'min':'—' },
                      { icon:'event_available',color:'text-emerald-600 bg-emerald-100', label:'Tasks completed', value:`${completed} / ${total}` },
                    ].map(ins => (
                      <div key={ins.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <span className={`material-symbols-outlined p-2 rounded-lg text-sm ${ins.color}`}>{ins.icon}</span>
                        <span className="flex-1 text-sm font-medium text-slate-600 dark:text-slate-400">{ins.label}</span>
                        <span className="font-black text-slate-800 dark:text-slate-100">{ins.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const { user, setUser, darkMode, setDarkMode, navigate, logout, deleteAccount, clearAllTasks, pushToast, tasks } = useApp()
  const { t, lang, setLang } = useLanguage()

  const dlCSV = () => {
    const header = 'Title,Category,Day,Time,Duration,Priority,Completed,Notes'
    const rows = tasks.map(t => `"${t.title}","${t.category}","${t.day}","${t.time}",${t.duration},"${t.priority}",${t.completed},"${t.notes||''}"`)
    const blob = new Blob([[header,...rows].join('\n')], {type:'text/csv'})
    const a = Object.assign(document.createElement('a'), {href:URL.createObjectURL(blob), download:'weekflow-tasks.csv'})
    a.click(); URL.revokeObjectURL(a.href)
    pushToast('CSV downloaded!','success')
  }
  const dlJSON = () => {
    const blob = new Blob([JSON.stringify(tasks,null,2)],{type:'application/json'})
    const a = Object.assign(document.createElement('a'),{href:URL.createObjectURL(blob),download:'weekflow-tasks.json'})
    a.click(); URL.revokeObjectURL(a.href)
    pushToast('JSON downloaded!','success')
  }
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState({ name: user.name, email: user.email })
  const [saved, setSaved] = useState(false)
  const [notifs, setNotifs] = useState({ email: true, push: true, reminders: true, weekly: false })
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [avatarColor, setAvatarColor] = useState(user.avatarColor || '#6467f2')

  const AVATAR_COLORS = ['#6467f2','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#f97316']

  const TABS = [
    { id: 'profile',      icon: 'person',        label: 'Profile'       },
    { id: 'notifications',icon: 'notifications',  label: 'Notifications' },
    { id: 'appearance',   icon: 'palette',        label: 'Appearance'    },
    { id: 'export',       icon: 'download',       label: 'Export'        },
    { id: 'danger',       icon: 'warning',        label: 'Danger Zone'   },
  ]

  const saveProfile = () => {
    setUser(prev => ({ ...prev, ...form, avatarColor }))
    setSaved(true)
    pushToast('Profile updated!', 'success')
    setTimeout(() => setSaved(false), 2000)
  }

  const doneTasks = tasks.filter(t => t.completed).length
  const totalHours = Math.round(tasks.reduce((s,t) => s + t.duration, 0) / 60)

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Profile & Settings" />

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* ── Sidebar tabs — horizontal on mobile, vertical on desktop ── */}
          <aside className="lg:w-56 shrink-0 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            {/* Mobile: horizontal scroll tabs */}
            <div className="lg:hidden flex overflow-x-auto scrollbar-hide px-4 py-2 gap-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${activeTab===t.id ? t.id==='danger' ? 'bg-red-500 text-white' : 'bg-primary text-white shadow' : t.id==='danger' ? 'text-red-400' : 'text-slate-500'}`}>
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
            {/* Desktop: vertical list */}
            <nav className="hidden lg:flex flex-col gap-1 p-3 pt-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 mb-2">Settings</p>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeTab===t.id ? t.id==='danger' ? 'bg-red-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/20' : t.id==='danger' ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <span className="material-symbols-outlined text-sm">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
              <button onClick={logout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4">
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6 max-w-2xl">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <>
                {/* Hero card */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                  {/* Gradient banner */}
                  <div className="h-28 lg:h-36 relative" style={{
                    background: `linear-gradient(135deg, ${avatarColor}cc 0%, ${avatarColor}44 50%, transparent 100%)`
                  }}>
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, ${avatarColor}55 0%, transparent 60%), radial-gradient(circle at 80% 20%, #ffffff11 0%, transparent 50%)`
                    }} />
                    {/* Edit avatar button — top right */}
                    <button onClick={() => setEditingAvatar(!editingAvatar)}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white rounded-xl text-xs font-semibold transition-all">
                      <span className="material-symbols-outlined text-xs">palette</span>
                      Customize
                    </button>
                  </div>

                  {/* Avatar + info */}
                  <div className="bg-white dark:bg-slate-900 px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-8 mb-4">
                      <div className="relative shrink-0">
                        <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 shadow-xl">
                          {user.avatarImg ? (
                            <img src={user.avatarImg} alt="Avatar" className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl object-cover" />
                          ) : (
                            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl flex items-center justify-center text-white text-4xl font-black"
                              style={{ backgroundColor: avatarColor }}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-white" />
                        </span>
                      </div>
                      <div className="pb-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-black truncate">{user.name}</h2>
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: avatarColor + '22', color: avatarColor }}>
                            <span className="material-symbols-outlined text-[10px]" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                            {user.plan}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Avatar editor inline */}
                    {editingAvatar && (
                      <div className="mb-5 p-4 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Customize Avatar</p>
                        <div>
                          <p className="text-xs text-slate-500 mb-2 font-medium">Avatar color</p>
                          <div className="flex gap-2 flex-wrap">
                            {AVATAR_COLORS.map(col => (
                              <button key={col} onClick={() => { setAvatarColor(col); setUser(prev => ({...prev, avatarColor: col, avatarImg: null})); setEditingAvatar(false) }}
                                className={`w-9 h-9 rounded-xl transition-all hover:scale-110 ${avatarColor===col ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                                style={{ backgroundColor: col }} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-2 font-medium">Upload photo</p>
                          <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:border-primary transition-colors w-fit">
                            <span className="material-symbols-outlined text-primary text-sm">upload</span>
                            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Choose image</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = ev => {
                                setUser(prev => ({ ...prev, avatarImg: ev.target.result }))
                                setEditingAvatar(false)
                                pushToast('Avatar updated!', 'success')
                              }
                              reader.readAsDataURL(file)
                            }} />
                          </label>
                        </div>
                        {user.avatarImg && (
                          <button onClick={() => { setUser(prev => ({...prev, avatarImg: null})); pushToast('Photo removed','info') }}
                            className="text-xs text-red-400 hover:text-red-600 font-semibold">
                            Remove photo
                          </button>
                        )}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total Tasks',    value: tasks.length, icon: 'task_alt'    },
                        { label: 'Completed',      value: doneTasks,    icon: 'check_circle' },
                        { label: 'Hours Planned',  value: totalHours,   icon: 'schedule'     },
                      ].map(s => (
                        <div key={s.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center group hover:bg-primary/5 transition-colors">
                          <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-primary transition-colors text-lg">{s.icon}</span>
                          <p className="text-2xl font-black mt-1" style={{ color: avatarColor }}>{s.value}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Edit form */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-slate-400">manage_accounts</span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Edit Profile</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Full Name</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5">Email</label>
                      <input type="email" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                  </div>
                  <button onClick={saveProfile}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/25'}`}>
                    <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
                    {saved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>

                {/* Subscription */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm text-slate-400">workspace_premium</span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Subscription</h3>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border-2"
                    style={{ borderColor: avatarColor + '33', backgroundColor: avatarColor + '08' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-black shrink-0"
                        style={{ backgroundColor: avatarColor }}>
                        ✦
                      </div>
                      <div>
                        <p className="font-black text-sm" style={{ color: avatarColor }}>{user.plan} Plan</p>
                        <p className="text-xs text-slate-500 mt-0.5">Billed monthly · $9/mo</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 border-2 rounded-xl text-sm font-bold transition-all hover:text-white"
                      style={{ borderColor: avatarColor + '44', color: avatarColor }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = avatarColor; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = avatarColor }}>
                      Manage
                    </button>
                  </div>
                </div>

                {/* Mobile sign out */}
                <div className="lg:hidden">
                  <button onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <span className="material-symbols-outlined text-sm">logout</span>
                    Sign Out
                  </button>
                </div>
              </>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-black text-base mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  {Object.entries(notifs).map(([key, val]) => {
                    const MAP = {
                      email:     ['Email notifications',  'Receive daily and weekly summaries by email'],
                      push:      ['Push notifications',   'Real-time alerts for task reminders'],
                      reminders: ['Task reminders',       '30 minutes before each scheduled task'],
                      weekly:    ['Weekly report',        'Every Monday morning — your week at a glance'],
                    }
                    return (
                      <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-semibold text-sm">{MAP[key][0]}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{MAP[key][1]}</p>
                        </div>
                        <button onClick={() => setNotifs(n => ({...n, [key]: !n[key]}))}
                          className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${val ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-5">{t.settings.appearance.darkMode.split(' ')[0]} Mode</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[{val:false,label:t.sidebar.lightMode,icon:'light_mode'},{val:true,label:t.sidebar.darkMode,icon:'dark_mode'}].map(opt => (
                      <button key={String(opt.val)} onClick={() => setDarkMode(opt.val)}
                        className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${darkMode===opt.val ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${darkMode===opt.val ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <span className="material-symbols-outlined text-3xl">{opt.icon}</span>
                        </div>
                        <span className={`text-sm font-black ${darkMode===opt.val ? 'text-primary' : 'text-slate-500'}`}>{opt.label}</span>
                        {darkMode===opt.val && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language switcher */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                  <h3 className="font-black text-base mb-1">{t.settings.appearance.language}</h3>
                  <p className="text-slate-400 text-sm mb-5">{t.settings.appearance.languageDesc}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { code: 'en', label: 'English',    flag: '🇺🇸' },
                      { code: 'pt', label: 'Português',  flag: '🇧🇷' },
                      { code: 'es', label: 'Español',    flag: '🇪🇸' },
                    ].map(opt => (
                      <button key={opt.code} onClick={() => setLang(opt.code)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${lang===opt.code ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40'}`}>
                        <span className="text-2xl">{opt.flag}</span>
                        <span className={`text-xs font-black ${lang===opt.code ? 'text-primary' : 'text-slate-500'}`}>{opt.label}</span>
                        {lang===opt.code && <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EXPORT TAB */}
            {activeTab === 'export' && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="font-black text-base mb-6">Export & Data</h3>
                <div className="space-y-3">
                  {[
                    { icon:'print',          label:'Print / PDF',        desc:'Print your weekly schedule', action:() => navigate('export'), color:'text-primary bg-primary/10' },
                    { icon:'table_chart',    label:'Export as CSV',       desc:'Download all tasks as spreadsheet', action: dlCSV, color:'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
                    { icon:'data_object',    label:'Export as JSON',      desc:'Full backup of all your data', action: dlJSON, color:'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
                    { icon:'calendar_month', label:'Sync to Calendar',    desc:'Export tasks to Google Calendar', action:() => pushToast('Calendar sync coming soon!','info'), color:'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
                  ].map((item,i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                          <span className="material-symbols-outlined text-sm">{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={item.action} className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                        Go
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-500 shrink-0">warning</span>
                  <div>
                    <p className="font-black text-amber-800 dark:text-amber-300 text-sm">Caution</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">These actions cannot be undone.</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 p-6">
                  <h4 className="font-black text-base mb-1">Clear All Tasks</h4>
                  <p className="text-slate-500 text-sm mb-4">Permanently delete all {tasks.length} tasks.</p>
                  <button onClick={() => { if (!confirmClear) { setConfirmClear(true); return }; clearAllTasks(); pushToast('All tasks deleted.','info'); setConfirmClear(false) }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${confirmClear ? 'bg-red-500 text-white border-red-500' : 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                    <span className="material-symbols-outlined text-sm">delete_sweep</span>
                    {confirmClear ? 'Confirm — delete all tasks' : 'Clear All Tasks'}
                  </button>
                  {confirmClear && <button onClick={() => setConfirmClear(false)} className="ml-3 text-sm text-slate-400 underline">Cancel</button>}
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900 p-6">
                  <h4 className="font-black text-base text-red-600 mb-1">Delete Account</h4>
                  <p className="text-slate-500 text-sm mb-4">Permanently delete your account and all data. You'll be logged out immediately.</p>
                  <button onClick={() => { if (!confirmDelete) { setConfirmDelete(true); return }; deleteAccount() }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${confirmDelete ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                    <span className="material-symbols-outlined text-sm">person_remove</span>
                    {confirmDelete ? '⚠️ Confirm Delete Account' : 'Delete Account'}
                  </button>
                  {confirmDelete && <button onClick={() => setConfirmDelete(false)} className="ml-3 text-sm text-slate-400 underline">Cancel</button>}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export function ExportPage() {
  const { tasks, navigate, weekDays, categoryColors } = useApp()
  const today = new Date()
  const weekStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'weekflow-tasks.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = () => {
    const header = 'Title,Category,Day,Time,Duration,Priority,Completed,Notes'
    const rows = tasks.map(t => `"${t.title}","${t.category}","${t.day}","${t.time}",${t.duration},"${t.priority}",${t.completed},"${t.notes || ''}"`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'weekflow-tasks.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } }`}</style>
      {/* Print toolbar */}
      <header className="no-print flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-10 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('settings')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold">Export / Print View</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">table_chart</span> CSV
          </button>
          <button onClick={downloadJSON} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">data_object</span> JSON
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all">
            <span className="material-symbols-outlined text-sm">print</span> Print PDF
          </button>
          <button onClick={() => navigate('settings')} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      {/* Printable content */}
      <main className="flex justify-center py-10 px-6">
        <div className="w-full max-w-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 shadow-sm border border-slate-100 dark:border-slate-800 rounded-xl">
          <div className="flex flex-col gap-2 border-b-2 border-slate-900 dark:border-slate-100 pb-6 mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-black uppercase">WeekFlow</h1>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weekly Export</span>
            </div>
            <p className="text-xl font-bold">Weekly Schedule</p>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Oct 23 – Oct 29, 2023</p>
          </div>

          <div className="space-y-10">
            {weekDays.map(day => {
              const dayTasks = tasks.filter(t => t.day === day)
              return (
                <section key={day}>
                  <h2 className="text-lg font-black border-b border-slate-200 dark:border-slate-700 pb-2 mb-4 uppercase tracking-wide">{day}</h2>
                  {dayTasks.length === 0 ? (
                    <p className="text-slate-400 text-sm italic">No tasks scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {dayTasks.sort((a, b) => a.time.localeCompare(b.time)).map(t => {
                        const c = categoryColors[t.category]
                        return (
                          <div key={t.id} className="flex items-start gap-3 py-2">
                            <div className={`mt-1 size-4 rounded-sm border ${t.completed ? c.dot + ' border-transparent' : 'border-slate-400 dark:border-slate-600'} flex-shrink-0 flex items-center justify-center`}>
                              {t.completed && <span className="material-symbols-outlined text-white text-[10px] fill-icon">check</span>}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-semibold ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                                <span className="text-xs text-slate-400">{t.time} · {t.duration}m</span>
                              </div>
                              <span className={`text-[10px] font-bold uppercase ${c.text}`}>{t.category}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Empty & Success States ────────────────────────────────────────────────────
export function EmptyStatesPage() {
  const { navigate, setShowAddTask } = useApp()
  const [state, setState] = useState('empty')

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="UI States" subtitle="Empty, Loading & Success states" />
        <main className="flex-1 p-6 lg:p-8 space-y-12">
          {/* State selector */}
          <div className="flex gap-2">
            {['empty', 'loading', 'success'].map(s => (
              <button key={s} onClick={() => setState(s)} className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all ${state === s ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{s}</button>
            ))}
          </div>

          {state === 'empty' && (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
              <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                <span className="material-symbols-outlined text-7xl text-primary/30">draw</span>
                <div className="absolute bottom-4 right-4 animate-bounce">
                  <span className="material-symbols-outlined text-primary">add_circle</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Your week is a blank canvas.</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-8">Start by adding a task or picking a template to build your perfect routine.</p>
              <div className="flex gap-4">
                <button onClick={() => setShowAddTask(true)} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> Create Task
                </button>
                <button onClick={() => navigate('templates')} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 transition-colors">
                  Pick Template
                </button>
              </div>
            </div>
          )}

          {state === 'loading' && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                  <div className="w-16 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              ))}
              <p className="text-center text-slate-400 text-sm">Loading your tasks...</p>
            </div>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center">
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative flex items-center justify-center w-full h-full bg-emerald-500 rounded-full text-white">
                  <span className="material-symbols-outlined text-6xl fill-icon">check_circle</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold mb-2">Week Complete! 🎉</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-2">You crushed it this week. All tasks completed!</p>
              <p className="text-primary font-bold mb-8">+250 Flow Points earned</p>
              <div className="flex gap-4">
                <button onClick={() => navigate('analytics')} className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-all">View Analytics</button>
                <button onClick={() => navigate('planner')} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold hover:bg-slate-200 transition-colors">Plan Next Week</button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
