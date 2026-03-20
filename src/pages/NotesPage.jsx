import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import UpgradeModal from '../components/UpgradeModal'

// ── localStorage helpers ──────────────────────────────────────────────────────
const LS_NOTES = 'wf_notes'
const loadNotes = () => {
  try { const v = localStorage.getItem(LS_NOTES); return v ? JSON.parse(v) : defaultNotes }
  catch { return defaultNotes }
}
const saveNotes = (notes) => {
  try { localStorage.setItem(LS_NOTES, JSON.stringify(notes)) } catch {}
}

const COLORS = [
  { id: 'default', bg: 'bg-white dark:bg-slate-800',          border: 'border-slate-200 dark:border-slate-700',  dot: 'bg-slate-400'   },
  { id: 'purple',  bg: 'bg-purple-50 dark:bg-purple-900/20',  border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500'  },
  { id: 'blue',    bg: 'bg-blue-50 dark:bg-blue-900/20',      border: 'border-blue-200 dark:border-blue-800',     dot: 'bg-blue-500'    },
  { id: 'green',   bg: 'bg-emerald-50 dark:bg-emerald-900/20',border: 'border-emerald-200 dark:border-emerald-800',dot: 'bg-emerald-500' },
  { id: 'yellow',  bg: 'bg-amber-50 dark:bg-amber-900/20',    border: 'border-amber-200 dark:border-amber-800',   dot: 'bg-amber-400'   },
  { id: 'red',     bg: 'bg-red-50 dark:bg-red-900/20',        border: 'border-red-200 dark:border-red-800',       dot: 'bg-red-500'     },
  { id: 'primary', bg: 'bg-primary/5 dark:bg-primary/10',     border: 'border-primary/30',                        dot: 'bg-primary'     },
]

const TYPES = [
  { id: 'note',    icon: 'sticky_note_2', label: 'Note'       },
  { id: 'idea',    icon: 'lightbulb',     label: 'Idea'       },
  { id: 'todo',    icon: 'checklist',     label: 'To-do list' },
  { id: 'goal',    icon: 'flag',          label: 'Goal'       },
  { id: 'journal', icon: 'book',          label: 'Journal'    },
]

const defaultNotes = [
  {
    id: 1, type: 'idea', title: 'App redesign concept', color: 'primary',
    content: 'What if we added a visual heatmap of the week? Colors intensity based on how packed the schedule is.',
    pinned: true, createdAt: new Date().toISOString(), todos: [],
  },
  {
    id: 2, type: 'todo', title: 'Weekly goals', color: 'green',
    content: '', pinned: false, createdAt: new Date().toISOString(),
    todos: [
      { id: 1, text: 'Finish the WeekFlow project', done: true },
      { id: 2, text: 'Work out 3x this week', done: false },
      { id: 3, text: 'Read 30 min daily', done: false },
    ],
  },
  {
    id: 3, type: 'note', title: 'Meeting notes', color: 'blue',
    content: 'Discussed Q4 roadmap. Key decisions:\n- Launch mobile app by December\n- Add team collaboration features\n- Improve onboarding flow',
    pinned: false, createdAt: new Date().toISOString(), todos: [],
  },
]

function getColor(id) { return COLORS.find(c => c.id === id) || COLORS[0] }
function getType(id)  { return TYPES.find(t  => t.id === id) || TYPES[0]  }

// ── Note card ─────────────────────────────────────────────────────────────────
function NoteCard({ note, onClick, onPin, onDelete }) {
  const col  = getColor(note.color)
  const type = getType(note.type)
  const todoDone = note.todos?.filter(t => t.done).length || 0
  const todoTotal = note.todos?.length || 0

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border-2 ${col.bg} ${col.border} p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
    >
      {/* Pin + delete buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onPin(note.id) }}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title={note.pinned ? 'Unpin' : 'Pin'}>
          <span className={`material-symbols-outlined text-sm ${note.pinned ? 'text-amber-500' : 'text-slate-400'}`}
            style={{ fontVariationSettings: note.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
        </button>
        <button onClick={e => { e.stopPropagation(); onDelete(note.id) }}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Delete">
          <span className="material-symbols-outlined text-sm text-red-400">delete</span>
        </button>
      </div>

      {/* Type + pin indicator */}
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-sm text-slate-400">{type.icon}</span>
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{type.label}</span>
        {note.pinned && <span className="material-symbols-outlined text-amber-500 text-xs ml-auto fill-icon" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>}
      </div>

      {/* Title */}
      {note.title && <h3 className="font-black text-sm mb-2 leading-snug line-clamp-2">{note.title}</h3>}

      {/* Content or todos */}
      {note.type === 'todo' && todoTotal > 0 ? (
        <div className="space-y-1.5 mt-2">
          {note.todos.slice(0, 4).map(todo => (
            <div key={todo.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${todo.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {todo.done && <span className="material-symbols-outlined text-white text-[10px] fill-icon">check</span>}
              </div>
              <span className={`text-xs ${todo.done ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>{todo.text}</span>
            </div>
          ))}
          {todoTotal > 4 && <p className="text-[10px] text-slate-400">+{todoTotal - 4} more</p>}
          <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: todoTotal ? `${(todoDone/todoTotal)*100}%` : '0%' }} />
          </div>
          <p className="text-[10px] text-slate-400">{todoDone}/{todoTotal} done</p>
        </div>
      ) : note.content ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4 whitespace-pre-line">{note.content}</p>
      ) : (
        <p className="text-xs text-slate-300 dark:text-slate-600 italic">Empty note…</p>
      )}

      {/* Footer */}
      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-3">
        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
    </div>
  )
}

// ── Note editor modal ─────────────────────────────────────────────────────────
function NoteEditor({ note, onSave, onClose }) {
  const [form, setForm] = useState({ ...note })
  const [newTodo, setNewTodo] = useState('')

  const addTodo = () => {
    if (!newTodo.trim()) return
    setForm(f => ({ ...f, todos: [...(f.todos || []), { id: Date.now(), text: newTodo.trim(), done: false }] }))
    setNewTodo('')
  }
  const toggleTodo = (id) => setForm(f => ({ ...f, todos: f.todos.map(t => t.id === id ? { ...t, done: !t.done } : t) }))
  const removeTodo = (id) => setForm(f => ({ ...f, todos: f.todos.filter(t => t.id !== id) }))

  const col = getColor(form.color)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border-2 ${col.bg} ${col.border} shadow-2xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 dark:border-white/5">
          {/* Type selector */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${form.type === t.id ? 'bg-primary text-white' : 'text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <span className="material-symbols-outlined text-sm">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
              className={`p-2 rounded-xl transition-colors ${form.pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-black/5'}`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: form.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-black/5 transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-slate-400 mr-1">Color:</span>
          {COLORS.map(c => (
            <button key={c.id} onClick={() => setForm(f => ({ ...f, color: c.id }))}
              className={`w-5 h-5 rounded-full ${c.dot} transition-all ${form.color === c.id ? 'scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600' : 'opacity-60 hover:opacity-100'}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {/* Title */}
          <input
            className="w-full bg-transparent text-xl font-black focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
            placeholder="Title…"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />

          {/* Todo list */}
          {form.type === 'todo' ? (
            <div className="space-y-2">
              {(form.todos || []).map(todo => (
                <div key={todo.id} className="flex items-center gap-3 group/todo">
                  <button onClick={() => toggleTodo(todo.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${todo.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-primary'}`}>
                    {todo.done && <span className="material-symbols-outlined text-white text-xs fill-icon">check</span>}
                  </button>
                  <span className={`flex-1 text-sm ${todo.done ? 'line-through text-slate-400' : ''}`}>{todo.text}</span>
                  <button onClick={() => removeTodo(todo.id)} className="opacity-0 group-hover/todo:opacity-100 text-red-400 hover:text-red-600 transition-all">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              {/* Add todo input */}
              <div className="flex items-center gap-3 mt-2">
                <div className="w-5 h-5 rounded border-2 border-dashed border-slate-300 dark:border-slate-600 shrink-0" />
                <input
                  className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="Add item…"
                  value={newTodo}
                  onChange={e => setNewTodo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTodo()}
                />
                <button onClick={addTodo} className="text-primary hover:text-primary/80">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                </button>
              </div>
            </div>
          ) : (
            <textarea
              className="w-full bg-transparent text-sm leading-relaxed focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none min-h-48"
              placeholder="Write your note here…"
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-black/5 dark:border-white/5">
          <p className="text-xs text-slate-400">
            {new Date(form.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <button onClick={() => onSave(form)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25">
            <span className="material-symbols-outlined text-sm">save</span>
            Save Note
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Notes page ───────────────────────────────────────────────────────────
export default function NotesPage() {
  const { planLimits, isPro } = useApp()
  const [notes,     setNotes]     = useState(loadNotes)
  const [editing,   setEditing]   = useState(null)
  const [search,    setSearch]    = useState('')
  const [filterType,setFilterType]= useState('all')
  const [view,      setView]      = useState('grid') // grid | list
  const [showUpgrade, setShowUpgrade] = useState(false)

  const persist = (updated) => { setNotes(updated); saveNotes(updated) }

  const createNote = (type = 'note') => {
    if (!isPro && notes.length >= planLimits.notes) {
      setShowUpgrade(true)
      return
    }
    const note = {
      id: Date.now(), type, title: '', color: 'default',
      content: '', pinned: false, createdAt: new Date().toISOString(), todos: [],
    }
    setEditing(note)
  }

  const saveNote = (updated) => {
    setNotes(prev => {
      const exists = prev.find(n => n.id === updated.id)
      const next = exists ? prev.map(n => n.id === updated.id ? updated : n) : [updated, ...prev]
      saveNotes(next)
      return next
    })
    setEditing(null)
  }

  const pinNote    = (id) => persist(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  const deleteNote = (id) => persist(notes.filter(n => n.id !== id))

  const filtered = notes
    .filter(n => filterType === 'all' || n.type === filterType)
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.createdAt) - new Date(a.createdAt)
    })

  const pinned   = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Notes & Ideas" subtitle={`${notes.length} notes`} />

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 py-3 flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
            <input className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            <button onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${filterType==='all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}>
              All
            </button>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setFilterType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${filterType===t.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}>
                <span className="material-symbols-outlined text-xs">{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            {['grid','list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`p-1.5 rounded-md transition-all ${view===v ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}>
                <span className="material-symbols-outlined text-sm">{v === 'grid' ? 'grid_view' : 'view_list'}</span>
              </button>
            ))}
          </div>

          {/* New note button */}
          <button onClick={() => createNote()}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/25 shrink-0">
            <span className="material-symbols-outlined text-sm">add</span>
            <span className="hidden sm:inline">New Note</span>
          </button>
        </div>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Quick create buttons */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
            {TYPES.map(t => (
              <button key={t.id} onClick={() => createNote(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-all shrink-0 hover:shadow-md">
                <span className="material-symbols-outlined text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">sticky_note_2</span>
              <h3 className="text-xl font-black mb-2">{search ? 'No notes found' : 'No notes yet'}</h3>
              <p className="text-slate-400 mb-6">{search ? `No notes matching "${search}"` : 'Start capturing your ideas, goals and thoughts.'}</p>
              {!search && (
                <button onClick={() => createNote()}
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all">
                  Create your first note
                </button>
              )}
            </div>
          )}

          {/* Pinned section */}
          {pinned.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-500 text-sm fill-icon" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Pinned</h4>
              </div>
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'}>
                {pinned.map(note => (
                  <NoteCard key={note.id} note={note}
                    onClick={() => setEditing(note)}
                    onPin={pinNote}
                    onDelete={deleteNote} />
                ))}
              </div>
            </div>
          )}

          {/* All notes */}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Notes</h4>
                </div>
              )}
              <div className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'}>
                {unpinned.map(note => (
                  <NoteCard key={note.id} note={note}
                    onClick={() => setEditing(note)}
                    onPin={pinNote}
                    onDelete={deleteNote} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Editor modal */}
      {editing && (
        <NoteEditor note={editing} onSave={saveNote} onClose={() => setEditing(null)} />
      )}

      {/* Upgrade modal */}
      {showUpgrade && (
        <UpgradeModal feature={`mais de ${planLimits.notes} notas`} onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  )
}
