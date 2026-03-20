import { useState } from 'react'
import { useApp } from '../context/AppContext'

const CATEGORIES = ['Work', 'Gym', 'Study', 'Rest', 'Other']
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PRIORITIES = ['low', 'medium', 'high']
const CAT_ICONS = { Work: 'work', Gym: 'fitness_center', Study: 'school', Rest: 'spa', Other: 'category' }
const CAT_COLORS = {
  Work:  { border: 'border-primary/40',  bg: 'bg-primary/10',                           text: 'text-primary'     },
  Gym:   { border: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20',    text: 'text-emerald-600' },
  Study: { border: 'border-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',          text: 'text-blue-600'    },
  Rest:  { border: 'border-purple-400',  bg: 'bg-purple-50 dark:bg-purple-900/20',      text: 'text-purple-600'  },
  Other: { border: 'border-orange-400',  bg: 'bg-orange-50 dark:bg-orange-900/20',      text: 'text-orange-600'  },
}

const fmt2 = n => String(n).padStart(2, '0')
const fmtDisp = val => {
  const [h, m] = val.split(':').map(Number)
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${fmt2(h12)}:${fmt2(m)} ${h >= 12 ? 'PM' : 'AM'}`
}

function MiniTimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [h, m] = value.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hours24 = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const setHour = hr => onChange(`${fmt2(hr)}:${fmt2(m)}`)
  const setMin  = mn => onChange(`${fmt2(h)}:${fmt2(mn)}`)
  const toggleAmPm = () => onChange(`${fmt2(h >= 12 ? h - 12 : h + 12)}:${fmt2(m)}`)

  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${open ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/40'}`}>
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${open ? 'text-primary' : 'text-slate-400'}`}>schedule</span>
          <span className={`font-black ${open ? 'text-primary' : ''}`}>{fmtDisp(value)}</span>
        </div>
        <span className={`material-symbols-outlined text-sm transition-transform ${open ? 'rotate-180 text-primary' : 'text-slate-400'}`}>expand_more</span>
      </button>
      {open && (
        <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
          <div className="flex justify-center mb-3">
            <div className="flex gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {['AM','PM'].map(p => (
                <button key={p} onClick={() => { if ((p==='PM') !== (h>=12)) toggleAmPm() }}
                  className={`px-4 py-1 rounded-md text-xs font-black transition-all ${ampm===p ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center mb-1">Hour</p>
              <div className="h-28 overflow-y-auto scrollbar-hide rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                {hours24.filter(hr => ampm==='AM' ? hr<12 : hr>=12).map(hr => {
                  const hr12 = hr===0 ? 12 : hr>12 ? hr-12 : hr
                  return (
                    <button key={hr} onClick={() => setHour(hr)}
                      className={`w-full py-1.5 text-xs font-semibold transition-all ${hr===h ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary/10 hover:text-primary'}`}>{fmt2(hr12)}</button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 text-center mb-1">Min</p>
              <div className="h-28 overflow-y-auto scrollbar-hide rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                {minutes.map(mn => (
                  <button key={mn} onClick={() => setMin(mn)}
                    className={`w-full py-1.5 text-xs font-semibold transition-all ${mn===m ? 'bg-primary text-white' : 'text-slate-500 hover:bg-primary/10 hover:text-primary'}`}>:{fmt2(mn)}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="mt-2 w-full py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">
            ✓ Confirm {fmtDisp(value)}
          </button>
        </div>
      )}
    </div>
  )
}

export default function EditTaskModal() {
  const { editingTask, setEditingTask, updateTask, deleteTask, pushToast } = useApp()
  const [form, setForm] = useState({ ...editingTask })
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!editingTask) return null

  const handleSave = () => {
    if (!form.title.trim()) return
    updateTask(form.id, form)
    pushToast('Task updated successfully!', 'success')
    setSaved(true)
    setTimeout(() => { setSaved(false); setEditingTask(null) }, 1000)
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    deleteTask(form.id)
    pushToast('Task deleted.', 'info')
    setEditingTask(null)
  }

  const toggleDay = (day) => {
    // For edit mode, task has a single day — we just change it
    setForm(f => ({ ...f, day }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black">Edit Task</h2>
            <p className="text-slate-400 text-xs mt-0.5">Last saved: {editingTask.title}</p>
          </div>
          <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-5 space-y-5 custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Task Name</label>
            <input className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORIES.map(cat => {
                const c = CAT_COLORS[cat]
                const sel = form.category === cat
                return (
                  <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 transition-all ${sel ? `${c.border} ${c.bg}` : 'border-slate-200 dark:border-slate-700 hover:border-primary/30'}`}>
                    <span className={`material-symbols-outlined text-lg ${sel ? c.text : 'text-slate-400'}`}>{CAT_ICONS[cat]}</span>
                    <span className={`text-[11px] font-bold ${sel ? c.text : 'text-slate-500'}`}>{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block text-sm font-semibold mb-2">Day of Week</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => toggleDay(day)}
                  className={`w-12 h-10 rounded-xl border-2 font-bold text-xs transition-all ${form.day === day ? 'bg-primary border-primary text-white shadow-md' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary/40 hover:text-primary'}`}>
                  {DAY_SHORT[i]}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold mb-2">Start Time</label>
            <MiniTimePicker value={form.time} onChange={t => setForm({ ...form, time: t })} />
          </div>

          {/* Duration & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Duration (min)</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setForm(f => ({ ...f, duration: Math.max(15, f.duration - 15) }))}
                  className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="flex-1 text-center font-black text-lg">{form.duration}</span>
                <button onClick={() => setForm(f => ({ ...f, duration: Math.min(480, f.duration + 15) }))}
                  className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <div className="flex gap-1.5">
                {PRIORITIES.map(p => (
                  <button key={p} onClick={() => setForm({ ...form, priority: p })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all border-2 ${
                      form.priority === p
                        ? p==='high'   ? 'bg-red-500 text-white border-red-500'
                        : p==='medium' ? 'bg-amber-400 text-white border-amber-400'
                        :                'bg-slate-400 text-white border-slate-400'
                        : 'bg-transparent text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>{p==='high' ? '🔴' : p==='medium' ? '🟡' : '⚪'} {p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Any details or reminders..."
              value={form.notes || ''}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button onClick={handleDelete}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${confirmDelete ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
            <span className="material-symbols-outlined text-sm">delete</span>
            {confirmDelete ? 'Confirm Delete' : 'Delete'}
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditingTask(null)} className="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90'}`}>
              <span className="material-symbols-outlined text-sm">{saved ? 'check' : 'save'}</span>
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
