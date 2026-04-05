import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const CATEGORIES = ['All', 'Work', 'Gym', 'Study', 'Rest', 'Other']
const PRIORITIES  = ['All', 'high', 'medium', 'low']

// Compute current week dates for a given reference date
function buildWeekDates(now = new Date()) {
  const jsDay = now.getDay()
  const dayToIdx = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 }
  const weekDates = {}
  Object.entries(dayToIdx).forEach(([name, idx]) => {
    const diff = idx - jsDay
    const d = new Date(now)
    d.setDate(d.getDate() + diff)
    weekDates[name] = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })
  return weekDates
}

const TODAY_NAME = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
const DAY_SHORT  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function WeeklyPlannerPage() {
  const {
    weekDays, tasks, toggleTask, deleteTask, setShowAddTask,
    categoryColors, setSelectedDay, moveTask, setEditingTask,
    pushToast, weekOffset, goToPrevWeek, goToNextWeek, goToThisWeek,
    currentWeekLabel, TASK_COLORS, navigate,
  } = useApp()

  // ── View mode: 'week' | 'today' ─────────────────────────────────────────────
  const [view, setView] = useState('today')

  // ── Week view state ──────────────────────────────────────────────────────────
  const [filterCat,   setFilterCat]   = useState('All')
  const [filterPrio,  setFilterPrio]  = useState('All')
  const [filterDone,  setFilterDone]  = useState('All')
  const [search,      setSearch]      = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dragging,    setDragging]    = useState(null)
  const [dragOver,    setDragOver]    = useState(null)
  const [mobileDay,   setMobileDay]   = useState(TODAY_NAME)

  // ── Today view state ─────────────────────────────────────────────────────────
  const [activeDay, setActiveDay] = useState(TODAY_NAME)

  // ── Shared date map ──────────────────────────────────────────────────────────
  const _weekDates = buildWeekDates()

  const filterByDay = (day) => tasks.filter(t =>
    t.specificDate ? t.specificDate === _weekDates[day] : t.day === day
  )

  const filtered = (day) => filterByDay(day)
    .filter(t => filterCat  === 'All' || t.category === filterCat)
    .filter(t => filterPrio === 'All' || t.priority === filterPrio)
    .filter(t => filterDone === 'All' || (filterDone === 'Done' ? t.completed : !t.completed))
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  const activeFilters = [filterCat, filterPrio, filterDone].filter(f => f !== 'All').length

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  const handleDragStart = (e, taskId) => { setDragging({ taskId }); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e, day)    => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(day) }
  const handleDrop      = (e, day)    => {
    e.preventDefault()
    if (dragging?.taskId) {
      const task = tasks.find(t => t.id === dragging.taskId)
      if (task && task.day !== day) { moveTask(dragging.taskId, day); pushToast(`"${task.title}" movida para ${day}`, 'success') }
    }
    setDragging(null); setDragOver(null)
  }
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }

  // ── Week task card (compact, draggable) ──────────────────────────────────────
  const WeekTaskCard = ({ task }) => {
    const c = categoryColors[task.category] || categoryColors.Other
    const isDragging = dragging?.taskId === task.id
    return (
      <div
        draggable
        onDragStart={e => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        className={`group bg-white dark:bg-slate-800 rounded-xl p-3 border-2 cursor-grab active:cursor-grabbing transition-all select-none
          ${isDragging ? 'opacity-40 scale-95' : ''}
          ${task.completed ? 'opacity-60 border-slate-200 dark:border-slate-700' : `${c.border} hover:shadow-md`}`}
      >
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {task.color && (() => { const tc = TASK_COLORS?.find(x => x.id===task.color); return tc?.hex ? <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{backgroundColor:tc.hex}} /> : null })()}
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase ${c.bg} ${c.text}`}>{task.category}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditingTask(task)} className="p-1 hover:bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-[14px] text-primary">edit</span>
            </button>
            <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-50 rounded-lg">
              <span className="material-symbols-outlined text-[14px] text-red-400">delete</span>
            </button>
          </div>
        </div>
        <p className={`text-xs font-bold leading-snug mb-2 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
          {task.title}
        </p>
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[10px] flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px]">schedule</span>{task.time}
          </span>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded
            ${task.priority==='high' ? 'bg-red-100 text-red-600' : task.priority==='medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            {task.priority}
          </span>
        </div>
        <button
          onClick={() => toggleTask(task.id)}
          className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all
            ${task.completed
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-primary/10 hover:text-primary'}`}
        >
          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: task.completed ? "'FILL' 1" : "'FILL' 0" }}>
            {task.completed ? 'check_circle' : 'radio_button_unchecked'}
          </span>
          {task.completed ? 'Feito ✓' : 'Marcar feito'}
        </button>
      </div>
    )
  }

  // ── Today task card (larger, tap to toggle) ──────────────────────────────────
  const TodayTaskCard = ({ task }) => {
    const c = categoryColors[task.category] || categoryColors.Other
    return (
      <div
        onClick={() => toggleTask(task.id)}
        className={`group flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
          ${task.completed
            ? `${c.bg} ${c.border} opacity-60`
            : `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:${c.border} hover:${c.bg}`}`}
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
          ${task.completed ? `${c.dot} border-transparent` : 'border-slate-300 dark:border-slate-600 group-hover:border-primary'}`}>
          {task.completed && <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.bg} ${c.text}`}>{task.category}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
              ${task.priority==='high' ? 'bg-red-100 text-red-600' : task.priority==='medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              {task.priority}
            </span>
          </div>
          <h4 className={`font-bold text-sm leading-snug ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">schedule</span>{task.time}
            </span>
            {task.duration && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">timer</span>{task.duration}m
              </span>
            )}
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); setEditingTask(task) }}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-primary/10 rounded-lg transition-all shrink-0">
          <span className="material-symbols-outlined text-sm text-primary">edit</span>
        </button>
      </div>
    )
  }

  // ── Donut progress chart ─────────────────────────────────────────────────────
  const DonutChart = ({ pct }) => {
    const r = 28, circ = 2 * Math.PI * r
    const dash = (pct / 100) * circ
    return (
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
        <circle cx="36" cy="36" r={r} fill="none" stroke="#6467f2" strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
        <text x="36" y="40" textAnchor="middle" className="fill-primary font-black" style={{ fontSize: 13, fontWeight: 900, fill: '#6467f2' }}>
          {pct}%
        </text>
      </svg>
    )
  }

  // ── Today view ───────────────────────────────────────────────────────────────
  const todayTasks  = filterByDay(activeDay).sort((a, b) => a.time.localeCompare(b.time))
  const todayDone   = todayTasks.filter(t => t.completed).length
  const todayPct    = todayTasks.length ? Math.round((todayDone / todayTasks.length) * 100) : 0

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Planner" />

        {/* ── View tabs ──────────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center gap-1 pt-2">
          {[
            { id: 'today', icon: 'today',            label: 'Hoje'   },
            { id: 'week',  icon: 'calendar_view_week', label: 'Semana' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-xl border-b-2 transition-all
                ${view === tab.id
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
              <span className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: view === tab.id ? "'FILL' 1" : "'FILL' 0" }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TODAY VIEW                                                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {view === 'today' && (
          <div className="flex flex-1 min-h-0">
            {/* Day sidebar */}
            <aside className="hidden sm:flex w-44 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 gap-1 overflow-y-auto">
              {weekDays.map(day => {
                const dt   = filterByDay(day)
                const done = dt.filter(t => t.completed).length
                const isToday = day === TODAY_NAME
                return (
                  <button key={day} onClick={() => setActiveDay(day)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                      ${activeDay === day
                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <span className="font-bold">
                      {day.slice(0,3)}
                      {isToday && <span className={`ml-1 text-[10px] font-black ${activeDay === day ? 'text-white/70' : 'text-primary'}`}>●</span>}
                    </span>
                    <span className={`text-xs ${activeDay === day ? 'text-white/70' : 'text-slate-400'}`}>{done}/{dt.length}</span>
                  </button>
                )
              })}
            </aside>

            {/* Mobile day tabs */}
            <div className="sm:hidden w-full absolute" style={{ zIndex: 1 }}>
              <div className="flex overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 py-2 gap-1">
                {weekDays.map((day, i) => {
                  const dt   = filterByDay(day)
                  const done = dt.filter(t => t.completed).length
                  const isToday = day === TODAY_NAME
                  return (
                    <button key={day} onClick={() => setActiveDay(day)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all min-w-[52px]
                        ${activeDay === day ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      <span className="text-[11px] font-black">
                        {DAY_SHORT[i]}{isToday ? ' ●' : ''}
                      </span>
                      <span className={`text-[10px] mt-0.5 ${activeDay === day ? 'text-white/80' : 'text-slate-400'}`}>{done}/{dt.length}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden sm:pt-0 pt-[60px]">
              <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                {/* Day header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {activeDay}
                      {activeDay === TODAY_NAME && (
                        <span className="ml-2 text-sm font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">hoje</span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">{todayDone}/{todayTasks.length} tarefas · {todayPct}% concluído</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <DonutChart pct={todayPct} />
                    <button onClick={() => { setShowAddTask(true); setSelectedDay(activeDay) }}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                      <span className="material-symbols-outlined text-sm">add</span>
                      <span className="hidden sm:inline">Adicionar</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                {todayTasks.length > 0 && (
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500
                      ${todayPct === 100 ? 'bg-emerald-400' : 'bg-primary'}`}
                      style={{ width: `${todayPct}%` }} />
                  </div>
                )}

                {/* Task list */}
                {todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-primary/20 mb-4">event_available</span>
                    <h3 className="text-lg font-bold mb-2 text-slate-700 dark:text-slate-300">Nenhuma tarefa para {activeDay}</h3>
                    <p className="text-slate-400 text-sm mb-6">Dia livre! Adicione tarefas para começar.</p>
                    <button onClick={() => { setShowAddTask(true); setSelectedDay(activeDay) }}
                      className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
                      Adicionar tarefa
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map(task => <TodayTaskCard key={task.id} task={task} />)}
                    <button onClick={() => { setShowAddTask(true); setSelectedDay(activeDay) }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary text-sm font-semibold">
                      <span className="material-symbols-outlined text-base">add</span> Adicionar tarefa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* WEEK VIEW                                                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {view === 'week' && (
          <>
            {/* Week navigation */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-2 flex items-center gap-3">
              <button onClick={goToPrevWeek} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-500">chevron_left</span>
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 min-w-32 text-center">{currentWeekLabel}</span>
              <button onClick={goToNextWeek} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-slate-500">chevron_right</span>
              </button>
              {weekOffset !== 0 && (
                <>
                  <button onClick={goToThisWeek} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                    Hoje
                  </button>
                  <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    {weekOffset < 0 ? 'Semana passada' : 'Semana futura'}
                  </span>
                </>
              )}
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-32">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
                <input
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="Buscar…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${showFilters || activeFilters > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                <span className="material-symbols-outlined text-sm">tune</span>
                <span className="hidden sm:inline">Filtros</span>
                {activeFilters > 0 && <span className="w-5 h-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center">{activeFilters}</span>}
              </button>
              <button onClick={() => navigate('templates')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40 hover:text-primary">
                <span className="material-symbols-outlined text-sm">view_list</span>
                <span className="hidden sm:inline">Templates</span>
              </button>
              <button onClick={() => navigate('share')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40 hover:text-primary">
                <span className="material-symbols-outlined text-sm">share</span>
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">add</span>
                <span className="hidden sm:inline">Nova tarefa</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-full">{tasks.length} tarefas</span>
                <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1.5 rounded-full">{tasks.filter(t=>t.completed).length} feitas</span>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex flex-wrap gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Categoria</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setFilterCat(c)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${filterCat===c ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Prioridade</p>
                  <div className="flex gap-1.5">
                    {PRIORITIES.map(p => (
                      <button key={p} onClick={() => setFilterPrio(p)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${filterPrio===p ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>
                        {p==='All'?'Todos':p==='high'?'🔴 Alta':p==='medium'?'🟡 Média':'⚪ Baixa'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Status</p>
                  <div className="flex gap-1.5">
                    {['All','Pending','Done'].map(s => (
                      <button key={s} onClick={() => setFilterDone(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${filterDone===s ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>
                        {s==='Done'?'✓ Feitas':s==='Pending'?'○ Pendentes':'Todos'}
                      </button>
                    ))}
                  </div>
                </div>
                {activeFilters > 0 && (
                  <button onClick={() => { setFilterCat('All'); setFilterPrio('All'); setFilterDone('All') }}
                    className="self-end flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
                    <span className="material-symbols-outlined text-xs">close</span> Limpar
                  </button>
                )}
              </div>
            )}

            {/* ── MOBILE: Day tabs + single column ── */}
            <div className="lg:hidden flex flex-col flex-1">
              <div className="flex overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 py-2 gap-1">
                {weekDays.map((day, i) => {
                  const dt   = filtered(day)
                  const done = dt.filter(t => t.completed).length
                  const isToday = day === TODAY_NAME
                  return (
                    <button key={day} onClick={() => setMobileDay(day)}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all min-w-[52px] ${mobileDay === day ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                      <span className="text-[11px] font-black">{DAY_SHORT[i]}{isToday ? ' ●' : ''}</span>
                      <span className={`text-[10px] mt-0.5 ${mobileDay === day ? 'text-white/80' : 'text-slate-400'}`}>{done}/{dt.length}</span>
                    </button>
                  )
                })}
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-black">{mobileDay}</h3>
                    <p className="text-xs text-slate-400">{filtered(mobileDay).filter(t=>t.completed).length}/{filtered(mobileDay).length} tarefas</p>
                  </div>
                  <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                    className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90">
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
                {filtered(mobileDay).length > 0 && (
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.round((filtered(mobileDay).filter(t=>t.completed).length / filtered(mobileDay).length) * 100)}%` }} />
                  </div>
                )}
                {filtered(mobileDay).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">event_available</span>
                    <p className="text-slate-400 font-medium">Nenhuma tarefa para {mobileDay}</p>
                    <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                      className="mt-4 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">
                      Adicionar tarefa
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered(mobileDay).sort((a,b) => a.time.localeCompare(b.time)).map(task => (
                      <WeekTaskCard key={task.id} task={task} />
                    ))}
                    <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary text-sm font-semibold">
                      <span className="material-symbols-outlined text-base">add</span> Adicionar tarefa
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── DESKTOP: Full 7-column board ── */}
            <div className="hidden lg:flex flex-col flex-1">
              <div className="px-3 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">drag_indicator</span>
                <p className="text-xs text-primary font-medium">Arraste tarefas entre colunas para reorganizar</p>
              </div>
              <main className="flex-1 p-4 overflow-x-auto">
                <div className="min-w-[900px] flex gap-3" style={{ minHeight: 'calc(100vh - 320px)' }}>
                  {weekDays.map(day => {
                    const dayTasks = filtered(day)
                    const allDay   = tasks.filter(t => t.specificDate ? t.specificDate === _weekDates[day] : t.day === day)
                    const done     = allDay.filter(t => t.completed).length
                    const isOver   = dragOver === day
                    const isToday  = day === TODAY_NAME
                    return (
                      <div key={day} className="flex-1 flex flex-col"
                        onDragOver={e => handleDragOver(e, day)}
                        onDrop={e => handleDrop(e, day)}
                        onDragLeave={() => setDragOver(null)}>
                        <div className={`rounded-xl mb-2 px-3 py-2 transition-all ${isOver ? 'bg-primary/20' : isToday ? 'bg-primary/5 border border-primary/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                          <p className={`text-xs font-black uppercase tracking-wider ${isToday ? 'text-primary' : 'text-slate-500'}`}>
                            {day.slice(0,3)}{isToday ? ' ●' : ''}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs text-slate-400">{done}/{allDay.length}</span>
                            <div className="flex-1 mx-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: allDay.length ? `${(done/allDay.length)*100}%` : '0%' }} />
                            </div>
                          </div>
                        </div>
                        <div className={`flex-1 rounded-xl p-2 space-y-2 min-h-32 transition-all
                          ${isOver ? 'bg-primary/10 border-2 border-primary/30 border-dashed' : 'bg-slate-100/70 dark:bg-slate-800/30'}`}>
                          {dayTasks.map(task => <WeekTaskCard key={task.id} task={task} />)}
                          {isOver && dragging && (
                            <div className="flex flex-col items-center justify-center py-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5">
                              <span className="material-symbols-outlined text-primary text-2xl mb-1">add_circle</span>
                              <span className="text-xs font-bold text-primary">Soltar aqui</span>
                            </div>
                          )}
                          <button onClick={() => { setShowAddTask(true); setSelectedDay(day) }}
                            className="w-full flex items-center justify-center gap-1 py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all group">
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-lg">add</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
