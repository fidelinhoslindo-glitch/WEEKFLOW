import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'

export default function GlobalSearch() {
  const { searchQuery, setSearchQuery, setShowSearch, searchResults, navigate, setSelectedDay, categoryColors, setEditingTask } = useApp()
  const inputRef = useRef(null)

  // Local state for instant display; debounce propagation to context (avoids filtering on every keystroke).
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const debounceRef = useRef(null)
  const handleQueryChange = (val) => {
    setLocalQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(val), 200)
  }

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e) => { if (e.key === 'Escape') setShowSearch(false) }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); clearTimeout(debounceRef.current) }
  }, [setShowSearch])

  const closeSearch = () => { setShowSearch(false); setSearchQuery('') }

  const goToTask = (task) => {
    setSelectedDay(task.day)
    navigate('daily')
    closeSearch()
  }

  const openEdit = (task) => {
    setEditingTask(task)
    closeSearch()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm" onClick={closeSearch}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search tasks"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <span className="material-symbols-outlined text-primary text-2xl">search</span>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-lg font-medium focus:outline-none placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
            placeholder="Search tasks, categories, days..."
            value={localQuery}
            onChange={e => handleQueryChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            {localQuery && (
              <button onClick={() => { setLocalQuery(''); setSearchQuery('') }} aria-label="Clear search" className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-500">ESC</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {localQuery.trim().length <= 1 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">manage_search</span>
              <p className="text-slate-400 font-medium">Type at least 2 characters to search</p>
              <p className="text-slate-300 text-sm mt-1">Search by task name, category, day, or notes</p>
            </div>
          )}

          {localQuery.trim().length > 1 && searchResults.length === 0 && (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">search_off</span>
              <p className="text-slate-400 font-medium">No tasks found for "{localQuery}"</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <>
              <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
              </div>
              {searchResults.map(task => {
                const c = categoryColors[task.category] || categoryColors.Other
                return (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                    <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined text-sm ${c.text}`}>
                        {task.category === 'Work' ? 'work' : task.category === 'Gym' ? 'fitness_center' : task.category === 'Study' ? 'school' : task.category === 'Rest' ? 'spa' : 'category'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold ${c.text}`}>{task.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{task.day}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">{task.time}</span>
                        {task.completed && <span className="text-xs font-bold text-emerald-500 ml-1">✓ Done</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(task)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-sm text-primary">edit</span>
                      </button>
                      <button onClick={() => goToTask(task)} className="p-2 hover:bg-primary/10 rounded-lg transition-colors" title="Go to day">
                        <span className="material-symbols-outlined text-sm text-primary">open_in_new</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">↵</kbd> open</span>
            <span className="flex items-center gap-1"><kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">ESC</kbd> close</span>
          </div>
          <span className="text-xs text-slate-400">WeekFlow Search</span>
        </div>
      </div>
    </div>
  )
}
