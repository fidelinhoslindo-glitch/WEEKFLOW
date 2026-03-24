import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useLanguage } from '../context/LanguageContext'
import UpgradeModal from './UpgradeModal'

const CATEGORIES = ['Work', 'Gym', 'Study', 'Rest', 'Other']
const PRIORITIES = ['low', 'medium', 'high']

const CAT_ICONS = { Work: 'work', Gym: 'fitness_center', Study: 'school', Rest: 'spa', Other: 'category' }
const CAT_COLORS = {
  Work:  { border: 'border-primary/40',   bg: 'bg-primary/10',   text: 'text-primary' },
  Gym:   { border: 'border-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-900/20',  text: 'text-emerald-600' },
  Study: { border: 'border-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20',     text: 'text-blue-600' },
  Rest:  { border: 'border-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/20',   text: 'text-purple-600' },
  Other: { border: 'border-orange-400',   bg: 'bg-orange-50 dark:bg-orange-900/20',   text: 'text-orange-600' },
}

// Custom time picker wheel component
function TimePicker({ value, onChange, labels = { hour: 'Hour', minute: 'Minute' } }) {
  const [h, m] = value.split(':').map(Number)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

  const fmt = (n) => String(n).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h

  const setHour = (newH) => onChange(`${fmt(newH)}:${fmt(m)}`)
  const setMin = (newM) => onChange(`${fmt(h)}:${fmt(newM)}`)
  const toggleAmPm = () => {
    const newH = h >= 12 ? h - 12 : h + 12
    onChange(`${fmt(newH)}:${fmt(m)}`)
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      {/* Display */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="bg-primary/10 rounded-xl px-4 py-2 text-center">
          <span className="text-2xl font-black text-primary">{fmt(h12)}</span>
        </div>
        <span className="text-2xl font-black text-slate-400">:</span>
        <div className="bg-primary/10 rounded-xl px-4 py-2 text-center">
          <span className="text-2xl font-black text-primary">{fmt(m)}</span>
        </div>
        <button onClick={toggleAmPm} className="bg-primary text-white rounded-xl px-3 py-2 text-sm font-black hover:opacity-90 transition-all">
          {ampm}
        </button>
      </div>

      {/* Scrollable wheels */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hours */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">{labels.hour}</p>
          <div className="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            {hours.map(hr => {
              const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
              const isSelected = hr === h
              return (
                <button key={hr} onClick={() => setHour(hr)}
                  className={`w-full py-1.5 text-sm font-semibold transition-all ${isSelected ? 'bg-primary text-white font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}>
                  {fmt(hr12)} {hr >= 12 ? 'PM' : 'AM'}
                </button>
              )
            })}
          </div>
        </div>
        {/* Minutes */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2">{labels.minute}</p>
          <div className="h-28 overflow-y-auto scrollbar-hide rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            {minutes.map(mn => {
              const isSelected = mn === m || (m % 5 !== 0 && mn === Math.round(m / 5) * 5)
              return (
                <button key={mn} onClick={() => setMin(mn)}
                  className={`w-full py-1.5 text-sm font-semibold transition-all ${isSelected ? 'bg-primary text-white font-black' : 'text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'}`}>
                  :{fmt(mn)}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AddTaskModal() {
  const { setShowAddTask, addTasks, TASK_COLORS, tasks, planLimits, isPro } = useApp()
  const { t } = useLanguage()
  // EN_DAYS = English keys stored in tasks; DAYS/DAY_SHORT = translated display labels only
  const EN_DAYS_LIST = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const DAY_SHORT = t.common.weekdaysShort
  const todayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
  const [form, setForm] = useState({
    title: '', category: 'Work', days: [todayName], time: '09:00', duration: 60, priority: 'medium', notes: '', color: '', recurring: false
  })
  const [saved, setSaved] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day]
    }))
  }

  const handleSubmit = () => {
    if (!form.title.trim() || form.days.length === 0) return
    if (!isPro && tasks.length >= planLimits.tasks) {
      setShowUpgrade(true)
      return
    }
    // Create one task per selected day
    // Build one independent task per day — each gets its own unique id via addTasks
    const newTasks = form.days.map(day => ({ ...form, day }))
    addTasks(newTasks)
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowAddTask(false) }, 1200)
  }

  const h = parseInt(form.time.split(':')[0])
  const m = form.time.split(':')[1]
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  const displayTime = `${String(h12).padStart(2,'0')}:${m} ${ampm}`

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold">{t.addTask.title}</h2>
            <p className="text-slate-500 text-sm mt-1">{t.addTask.subtitle}</p>
          </div>
          <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar">

          {/* Task Name */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold mb-2">{t.addTask.taskName}</label>
            <input
              id="task-title"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder={t.addTask.taskPlaceholder}
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Category — 5 items */}
          <div>
            <label className="block text-sm font-semibold mb-3">{t.addTask.category}</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(cat => {
                const c = CAT_COLORS[cat]
                const selected = form.category === cat
                return (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${selected ? `${c.border} ${c.bg}` : 'border-slate-200 dark:border-slate-700 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <span className={`material-symbols-outlined text-xl ${selected ? c.text : 'text-slate-400'}`}>{CAT_ICONS[cat]}</span>
                    <span className={`text-[11px] font-bold ${selected ? c.text : 'text-slate-500'}`}>{t.common.categories[cat] || cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Days — multi-select pills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold">{t.addTask.dayOfWeek}</label>
              <span className="text-xs text-slate-400 font-medium">
                {form.days.length === 0 ? t.addTask.selectAtLeast : `${form.days.length} ${t.addTask.daysSelected}`}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {EN_DAYS_LIST.map((enDay, i) => {
                const sel = form.days.includes(enDay)
                const isWeekend = i >= 5
                return (
                  <button key={enDay} onClick={() => toggleDay(enDay)}
                    className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 font-bold text-xs transition-all ${
                      sel
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/30 scale-105'
                        : isWeekend
                          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:border-primary/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary/40 hover:bg-primary/5'
                    }`}>
                    {DAY_SHORT[i]}
                    {sel && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white fill-icon" style={{ fontSize: 8 }}>check</span>
                      </span>
                    )}
                  </button>
                )
              })}
              <button onClick={() => setForm(f => ({ ...f, days: EN_DAYS_LIST.slice(0, 5) }))}
                className="h-12 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-[10px] font-bold text-slate-400 hover:border-primary hover:text-primary transition-all whitespace-nowrap">
                {t.addTask.weekdaysBtn}
              </button>
              <button onClick={() => setForm(f => ({ ...f, days: EN_DAYS_LIST }))}
                className="h-12 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-[10px] font-bold text-slate-400 hover:border-primary hover:text-primary transition-all whitespace-nowrap">
                {t.addTask.allBtn}
              </button>
            </div>
          </div>

          {/* Time picker */}
          <div>
            <label className="block text-sm font-semibold mb-2">{t.addTask.startTime}</label>
            <button onClick={() => setShowTimePicker(!showTimePicker)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${showTimePicker ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/40'}`}>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined ${showTimePicker ? 'text-primary' : 'text-slate-400'}`}>schedule</span>
                <span className={`text-base font-black ${showTimePicker ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{displayTime}</span>
              </div>
              <span className={`material-symbols-outlined text-sm transition-transform ${showTimePicker ? 'rotate-180 text-primary' : 'text-slate-400'}`}>expand_more</span>
            </button>
            {showTimePicker && (
              <div className="mt-2">
                <TimePicker value={form.time} onChange={v => setForm({ ...form, time: v })} labels={{ hour: t.addTask.hour, minute: t.addTask.minute }} />
              </div>
            )}
          </div>

          {/* Duration & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-duration" className="block text-sm font-semibold mb-2">{t.addTask.duration}</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm(f => ({ ...f, duration: Math.max(15, f.duration - 15) }))}
                  aria-label="Decrease duration"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <input id="task-duration" type="number" min={15} max={480} step={15}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-center font-bold focus:outline-none focus:border-primary transition-all"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: Number(e.target.value) })} />
                <button onClick={() => setForm(f => ({ ...f, duration: Math.min(480, f.duration + 15) }))}
                  aria-label="Increase duration"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 text-center">{Math.floor(form.duration / 60)}h {form.duration % 60}m</p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t.addTask.priority}</label>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all border-2 ${
                      form.priority === p
                        ? p === 'high'   ? 'bg-red-500 text-white border-red-500 shadow-md'
                        : p === 'medium' ? 'bg-amber-400 text-white border-amber-400 shadow-md'
                        :                  'bg-slate-400 text-white border-slate-400 shadow-md'
                        : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                    }`}>
                    {p === 'high' ? '🔴' : p === 'medium' ? '🟡' : '⚪'} {t.common.priorities[p] || p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color + Recurring */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t.addTask.taskColor}</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                {TASK_COLORS.map(c => (
                  <button key={c.id} onClick={() => setForm({...form, color: c.id})} title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${form.color === c.id ? 'border-slate-600 dark:border-white scale-125' : 'border-transparent'}`}
                    style={{ backgroundColor: c.hex || '#94a3b8' }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t.addTask.recurring}</label>
              <button onClick={() => setForm(f => ({...f, recurring: !f.recurring}))}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${form.recurring ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700'}`}>
                <div className={`w-10 h-5 rounded-full transition-all relative ${form.recurring ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.recurring ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className={`text-sm font-semibold ${form.recurring ? 'text-primary' : 'text-slate-500'}`}>
                  {form.recurring ? t.addTask.weeklyRepeat : t.addTask.oneTime}
                </span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="task-notes" className="block text-sm font-semibold mb-2">{t.addTask.notes} <span className="text-slate-400 font-normal">{t.addTask.notesOptional}</span></label>
            <textarea id="task-notes" rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder={t.addTask.notesPlaceholder}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button onClick={() => setShowAddTask(false)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {t.common.cancel}
          </button>
          <button onClick={handleSubmit}
            disabled={!form.title.trim() || form.days.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saved ? 'bg-emerald-500 text-white'
              : !form.title.trim() || form.days.length === 0 ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90'
            }`}>
            <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'add'}</span>
            {saved ? t.addTask.taskAdded : form.days.length > 1 ? t.addTask.createTasks.replace('{n}', form.days.length) : t.addTask.createTask}
          </button>
        </div>
      </div>
    </div>

    {showUpgrade && (
      <UpgradeModal feature={`mais de ${planLimits.tasks} tarefas`} onClose={() => setShowUpgrade(false)} />
    )}
    </>
  )
}
