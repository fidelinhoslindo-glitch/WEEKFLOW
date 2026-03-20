import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { AnimatedStat } from '../hooks/useAnimatedStats'
import { downloadICS } from '../utils/googleCalendar'

export default function DashboardPage() {
  const { tasks, navigate, setShowAddTask, weekDays, getTasksForDay, completionRate, categoryColors, user, setShowAIChat } = useApp()
  const [timer, setTimer] = useState(25 * 60)
  const [timerRunning, setTimerRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setTimerRunning(false); return 25 * 60 }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning])

  const completed = tasks.filter(t => t.completed).length
  const high = tasks.filter(t => t.priority === 'high').length

  const stats = [
    { icon: 'task_alt', label: 'Weekly Completion', value: `${completionRate}%`, trend: '+5%', up: true },
    { icon: 'list_alt', label: 'Total Tasks', value: tasks.length, trend: '+3', up: true },
    { icon: 'event_repeat', label: 'Busiest Day', value: 'Tuesday', trend: 'Peak', neutral: true },
    { icon: 'psychology', label: 'Focus Score', value: '85', trend: '+12%', up: true },
  ]

  const reminders = tasks.filter(t => t.priority === 'high' && !t.completed).slice(0, 2)

  const dayProgress = weekDays.slice(0, 5).map(day => {
    const dayTasks = getTasksForDay(day)
    const done = dayTasks.filter(t => t.completed).length
    return { day, pct: dayTasks.length ? Math.round((done / dayTasks.length) * 100) : 0 }
  })

  const mins = Math.floor(timer / 60)
  const secs = timer % 60

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={`Good morning, ${user.name.split(' ')[0]}.`} subtitle="Ready for your flow?" />

        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap justify-end">
            <button onClick={() => setShowAIChat(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 hover:opacity-90 transition-all">
              <span className="material-symbols-outlined text-base" style={{fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
              AI Assistant
            </button>
            <button onClick={() => downloadICS(tasks)}
              className="hidden sm:flex px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="material-symbols-outlined text-base text-emerald-500">calendar_month</span> Export to Calendar
            </button>
            <button onClick={() => setShowAddTask(true)}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/25 hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-base">add</span> Add Task
            </button>
          </div>

          {/* Stats — animated */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
            {stats.map((s, i) => (
              <AnimatedStat key={s.label} icon={s.icon} label={s.label} value={s.value}
                trend={s.trend} up={s.up} neutral={s.neutral} delay={i * 150} />
            ))}
          </div>

          {/* Weekly Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold">Current Week Overview</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('planner')} className="text-sm font-semibold text-primary hover:underline">View full planner →</button>
              </div>
            </div>
            <div className="space-y-5">
              {dayProgress.map(({ day, pct }) => (
                <div key={day} className="flex items-center gap-3 sm:gap-6">
                  <div className="w-20 sm:w-28 shrink-0">
                    <p className="text-sm font-bold">{day}</p>
                    <p className="text-xs text-slate-400">{getTasksForDay(day).length} tasks</p>
                  </div>
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-400' : pct > 50 ? 'bg-primary' : pct > 0 ? 'bg-amber-400' : 'bg-slate-200'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-16 text-right">
                    <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}>{pct === 100 ? 'Done ✓' : `${pct}%`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Smart Reminders */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">priority_high</span> Smart Reminders
              </h4>
              <div className="space-y-4">
                {reminders.length > 0 ? reminders.map(t => {
                  const c = categoryColors[t.category]
                  return (
                    <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 group hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('daily')}>
                      <div className="flex items-center gap-4">
                        <div className={`${c.bg} ${c.text} w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <span className="material-symbols-outlined">{t.category === 'Work' ? 'work' : t.category === 'Gym' ? 'fitness_center' : t.category === 'Study' ? 'school' : 'spa'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold">{t.title}</p>
                          <p className="text-xs text-slate-400">{t.day} at {t.time} • High Priority</p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                  )
                }) : (
                  <div className="text-center py-8 text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">check_circle</span>
                    <p className="text-sm">All high-priority tasks are completed!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Focus Session */}
            <div className="bg-gradient-to-br from-primary to-indigo-700 p-5 sm:p-8 rounded-3xl text-white flex flex-col justify-between overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Focus Session</h4>
                <p className="text-white/80 text-sm leading-relaxed mb-6">Maximize productivity with a deep work session.</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-black">{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
                  <span className="text-sm font-medium mb-2 opacity-80">min</span>
                </div>
              </div>
              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setTimerRunning(r => !r)}
                  className="flex-1 bg-white text-primary py-3 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  {timerRunning ? '⏸ Pause' : '▶ Start Session'}
                </button>
                <button onClick={() => { setTimerRunning(false); setTimer(25 * 60) }} className="bg-white/20 text-white px-3 py-3 rounded-xl hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>
          </div>

          {/* Category distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
            <h4 className="font-bold mb-6">Tasks by Category</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(categoryColors).map(([cat, c]) => {
                const catTasks = tasks.filter(t => t.category === cat)
                const catDone = catTasks.filter(t => t.completed).length
                return (
                  <div key={cat} className={`p-4 rounded-xl ${c.bg} border ${c.border}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${c.text} mb-2`}>{cat}</p>
                    <p className={`text-2xl font-black ${c.text}`}>{catTasks.length}</p>
                    <p className="text-xs text-slate-500 mt-1">{catDone}/{catTasks.length} done</p>
                    <div className="h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full ${c.dot} rounded-full`} style={{ width: catTasks.length ? `${(catDone/catTasks.length)*100}%` : '0%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
