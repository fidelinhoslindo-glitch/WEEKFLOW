import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const CATEGORIES = ['All', 'Work', 'Gym', 'Study', 'Rest', 'Other']
const PRIORITIES  = ['All', 'high', 'medium', 'low']

export default function WeeklyPlannerPage() {
  const { weekDays, tasks, toggleTask, deleteTask, setShowAddTask, categoryColors, setSelectedDay, moveTask, setEditingTask, pushToast, weekOffset, goToPrevWeek, goToNextWeek, goToThisWeek, currentWeekLabel, TASK_COLORS, navigate } = useApp()

  const [filterCat,  setFilterCat]  = useState('All')
  const [filterPrio, setFilterPrio] = useState('All')
  const [filterDone, setFilterDone] = useState('All')
  const [search,     setSearch]     = useState('')
  const [showFilters,setShowFilters]= useState(false)
  const [dragging,   setDragging]   = useState(null)
  const [dragOver,   setDragOver]   = useState(null)
  // Mobile: which day is selected in single-day view
  const [mobileDay,  setMobileDay]  = useState('Monday')

  // Compute actual dates for each day name in the current week (Mon-Sun)
  const _now = new Date()
  const _jsDay = _now.getDay() // 0=Sun
  const _weekDates = {}
  const _dayToIdx = { Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6, Sunday:0 }
  Object.entries(_dayToIdx).forEach(([name, idx]) => {
    const diff = idx - _jsDay
    const d = new Date(_now)
    d.setDate(d.getDate() + diff)
    _weekDates[name] = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })

  const filtered = (day) => tasks
    .filter(t => {
      if (t.specificDate) return t.specificDate === _weekDates[day]
      return t.day === day
    })
    .filter(t => filterCat  === 'All' || t.category === filterCat)
    .filter(t => filterPrio === 'All' || t.priority === filterPrio)
    .filter(t => filterDone === 'All' || (filterDone === 'Done' ? t.completed : !t.completed))
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  const activeFilters = [filterCat, filterPrio, filterDone].filter(f => f !== 'All').length

  const handleDragStart = (e, taskId) => { setDragging({ taskId }); e.dataTransfer.effectAllowed = 'move' }
  const handleDragOver  = (e, day)    => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(day) }
  const handleDrop      = (e, day)    => {
    e.preventDefault()
    if (dragging?.taskId) {
      const task = tasks.find(t => t.id === dragging.taskId)
      if (task && task.day !== day) { moveTask(dragging.taskId, day); pushToast(`"${task.title}" moved to ${day}`, 'success') }
    }
    setDragging(null); setDragOver(null)
  }
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }

  const DAY_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  // Shared task card component
  const TaskCard = ({ task }) => {
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
            <button onClick={() => setEditingTask(task)} className="p-1 hover:bg-primary/10 rounded-lg" title="Edit">
              <span className="material-symbols-outlined text-[14px] text-primary">edit</span>
            </button>
            <button onClick={() => deleteTask(task.id)} className="p-1 hover:bg-red-50 rounded-lg" title="Delete">
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
        {/* Individual toggle — each task has its own button */}
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
          {task.completed ? 'Done ✓' : 'Mark done'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Weekly Planner" />
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
            <button onClick={goToThisWeek} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
              Today
            </button>
          )}
          {weekOffset !== 0 && (
            <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">info</span>
              {weekOffset < 0 ? 'Viewing past week' : 'Viewing future week'}
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-32">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="Filter…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${showFilters || activeFilters > 0 ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
            <span className="material-symbols-outlined text-sm">tune</span>
            <span className="hidden sm:inline">Filters</span>
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
            <span className="hidden sm:inline">Share</span>
          </button>

          <button onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="hidden sm:inline">New Task</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-full">{tasks.length} tasks</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1.5 rounded-full">{tasks.filter(t=>t.completed).length} done</span>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-4 flex flex-wrap gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Category</p>
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCat(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${filterCat===c ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Priority</p>
              <div className="flex gap-1.5">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setFilterPrio(p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all border ${filterPrio===p ? 'bg-primary text-white border-primary' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40'}`}>
                    {p==='All'?'All':p==='high'?'🔴 High':p==='medium'?'🟡 Med':'⚪ Low'}
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
                    {s==='Done'?'✓ Done':s==='Pending'?'○ Pending':'All'}
                  </button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { setFilterCat('All'); setFilterPrio('All'); setFilterDone('All') }}
                className="self-end flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors">
                <span className="material-symbols-outlined text-xs">close</span> Clear
              </button>
            )}
          </div>
        )}

        {/* ── MOBILE: Day selector tabs + single column ── */}
        <div className="lg:hidden flex flex-col flex-1">
          {/* Day tabs */}
          <div className="flex overflow-x-auto scrollbar-hide bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 py-2 gap-1">
            {weekDays.map((day, i) => {
              const dt = filtered(day)
              const done = dt.filter(t => t.completed).length
              const active = mobileDay === day
              return (
                <button key={day} onClick={() => setMobileDay(day)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all min-w-[52px] ${active ? 'bg-primary text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <span className="text-[11px] font-black">{DAY_SHORT[i]}</span>
                  <span className={`text-[10px] mt-0.5 ${active ? 'text-white/80' : 'text-slate-400'}`}>{done}/{dt.length}</span>
                </button>
              )
            })}
          </div>

          {/* Single day column */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black">{mobileDay}</h3>
                <p className="text-xs text-slate-400">{filtered(mobileDay).filter(t=>t.completed).length}/{filtered(mobileDay).length} tasks complete</p>
              </div>
              <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-xl text-sm font-bold hover:opacity-90">
                <span className="material-symbols-outlined text-sm">add</span> Add
              </button>
            </div>

            {/* Progress bar */}
            {filtered(mobileDay).length > 0 && (
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.round((filtered(mobileDay).filter(t=>t.completed).length / filtered(mobileDay).length) * 100)}%` }} />
              </div>
            )}

            {filtered(mobileDay).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">event_available</span>
                <p className="text-slate-400 font-medium">No tasks for {mobileDay}</p>
                <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                  className="mt-4 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90">
                  Add First Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered(mobileDay).sort((a,b) => a.time.localeCompare(b.time)).map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                <button onClick={() => { setShowAddTask(true); setSelectedDay(mobileDay) }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:bg-primary/5 transition-all text-slate-400 hover:text-primary text-sm font-semibold">
                  <span className="material-symbols-outlined text-base">add</span> Add task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP: Full 7-column board ── */}
        <div className="hidden lg:flex flex-col flex-1">
          <div className="px-3 py-2 bg-primary/5 border-b border-primary/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">drag_indicator</span>
            <p className="text-xs text-primary font-medium">Drag tasks between columns to reschedule · Click a task to edit</p>
          </div>

          <main className="flex-1 p-4 overflow-x-auto">
            <div className="min-w-[900px] flex gap-3" style={{ minHeight: 'calc(100vh - 280px)' }}>
              {weekDays.map(day => {
                const dayTasks = filtered(day)
                const allDay   = tasks.filter(t => t.specificDate ? t.specificDate === _weekDates[day] : t.day === day)
                const done     = allDay.filter(t => t.completed).length
                const isOver   = dragOver === day

                return (
                  <div key={day} className="flex-1 flex flex-col"
                    onDragOver={e => handleDragOver(e, day)}
                    onDrop={e => handleDrop(e, day)}
                    onDragLeave={() => setDragOver(null)}>

                    {/* Day header */}
                    <div className={`rounded-xl mb-2 px-3 py-2 transition-all ${isOver ? 'bg-primary/20' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'}`}>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{day.slice(0,3)}</p>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-slate-400">{done}/{allDay.length}</span>
                        <div className="flex-1 mx-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: allDay.length ? `${(done/allDay.length)*100}%` : '0%' }} />
                        </div>
                      </div>
                    </div>

                    {/* Task column */}
                    <div className={`flex-1 rounded-xl p-2 space-y-2 min-h-32 transition-all
                      ${isOver ? 'bg-primary/10 border-2 border-primary/30 border-dashed' : 'bg-slate-100/70 dark:bg-slate-800/30'}`}>
                      {dayTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}

                      {isOver && dragging && (
                        <div className="flex flex-col items-center justify-center py-4 rounded-xl border-2 border-dashed border-primary/50 bg-primary/5">
                          <span className="material-symbols-outlined text-primary text-2xl mb-1">add_circle</span>
                          <span className="text-xs font-bold text-primary">Drop here</span>
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
      </div>
    </div>
  )
}
