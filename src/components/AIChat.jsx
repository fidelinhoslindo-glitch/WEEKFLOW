import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const SYSTEM_PROMPT = `You are WeekFlow AI, a friendly assistant built into WeekFlow — a weekly planner app.
You can create tasks, navigate the app, toggle settings, and answer questions.

ALWAYS respond with valid JSON (no extra text). Use one of these actions:

1) CREATE TASKS:
{
  "action": "create_tasks",
  "tasks": [
    {
      "title": "Task name",
      "category": "Work|Gym|Study|Rest|Other",
      "days": ["Monday","Tuesday"],
      "time": "HH:MM",
      "duration": 60,
      "priority": "low|medium|high",
      "notes": ""
    }
  ],
  "message": "Confirmation message"
}

2) NAVIGATE to a page:
{
  "action": "navigate",
  "page": "dashboard|planner|daily|smart-calendar|flowcircle|notes|pomodoro|analytics|settings",
  "message": "Navigation message"
}

3) TOGGLE DARK MODE:
{
  "action": "toggle_dark",
  "message": "Theme changed"
}

4) COMPLETE/UNCOMPLETE a task:
{
  "action": "toggle_task",
  "taskTitle": "exact task title",
  "day": "Monday",
  "message": "Task marked as done"
}

5) DELETE a task:
{
  "action": "delete_task",
  "taskTitle": "exact task title",
  "day": "Monday",
  "message": "Task deleted"
}

6) GENERAL CHAT (for questions, help, greetings):
{
  "action": "chat",
  "message": "Your response here"
}

WEEKFLOW FEATURES you can tell users about:
- Dashboard: overview of the week with progress stats
- Planner: weekly grid to manage tasks for each day
- Today: focused view of today's tasks
- Smart Calendar: monthly calendar with task heatmap
- FlowCircle: social circles — invite friends, track group streaks, events, free time windows
- Notes: quick notes and bookmarks
- Pomodoro: pomodoro timer with focus/break sessions + free timer
- Analytics: charts showing productivity trends, streaks, category breakdown
- Settings: profile customization (avatar colors, name), export data (CSV/JSON), theme toggle
- AI Chat: that's you! Natural language task creation
- Desktop App: downloadable Windows app

RULES:
- Valid day names: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- If day not specified, pick logical day(s) based on context
- Default times: gym=07:00, work=09:00, study=19:00, meeting=10:00, lunch=12:00
- Default durations: gym=60, meeting=30, study=90, work=60, lunch=60
- Categories: "Work" for work/meetings, "Gym" for exercise/sports, "Study" for learning, "Rest" for breaks/leisure, "Other" for everything else
- Respond in the SAME language the user writes in
- For greetings like "oi", "hi", "opa", respond warmly and ask how you can help
- NEVER output text outside the JSON object
- If user asks about their tasks, summarize from the context provided`

const QUICK_PROMPTS = [
  { label: '🏋️ Gym 3x/week', text: 'Add gym Monday, Wednesday, Friday at 7am' },
  { label: '📚 Study daily', text: 'Study every weekday at 8pm for 1 hour' },
  { label: '📅 Team meeting', text: 'Team meeting Tuesday at 10am high priority' },
  { label: '📊 My stats', text: "What's my completion rate and how many tasks do I have?" },
  { label: '🌙 Dark mode', text: 'Toggle dark mode' },
  { label: '📋 Show planner', text: 'Take me to the planner' },
]

const CAT_STYLE = {
  Work:  'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
  Gym:   'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  Study: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  Rest:  'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  Other: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
}

const todayKey = () => `wf_ai_count_${new Date().toISOString().split('T')[0]}`
const getAiCount = () => { try { return parseInt(localStorage.getItem(todayKey()) || '0') } catch { return 0 } }
const incAiCount = () => { try { localStorage.setItem(todayKey(), String(getAiCount() + 1)) } catch {} }

export default function AIChat({ onClose }) {
  const { addTasks, pushToast, tasks, completionRate, navigate, darkMode, setDarkMode, toggleTask, deleteTask, weekDays, user, planLimits, isPro } = useApp()
  const [messages, setMessages] = useState([])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [aiCount, setAiCount] = useState(getAiCount)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, preview, loading])

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  // Build context about user's current tasks
  const buildContext = () => {
    const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()]
    const todayTasks = tasks.filter(t => t.day === today)
    const completed = tasks.filter(t => t.completed).length
    const pending = tasks.length - completed

    const taskSummary = weekDays.map(day => {
      const dayTasks = tasks.filter(t => t.day === day)
      if (dayTasks.length === 0) return null
      const items = dayTasks.map(t => `${t.completed ? '✓' : '○'} ${t.title} (${t.time || '09:00'}, ${t.category || 'Other'})`).join('; ')
      return `${day}: ${items}`
    }).filter(Boolean).join('\n')

    return `Today is ${today}. User: ${user?.name || 'User'}.
Total tasks: ${tasks.length} (${completed} done, ${pending} pending). Completion: ${completionRate}%.
Today's tasks: ${todayTasks.length} (${todayTasks.filter(t=>t.completed).length} done).
Dark mode: ${darkMode ? 'on' : 'off'}.
${taskSummary ? '\nAll tasks:\n' + taskSummary : 'No tasks yet.'}`
  }

  const executeAction = (parsed) => {
    switch (parsed.action) {
      case 'navigate':
        if (parsed.page) {
          navigate(parsed.page)
          onClose()
        }
        break
      case 'toggle_dark':
        setDarkMode(!darkMode)
        break
      case 'toggle_task': {
        const match = tasks.find(t =>
          t.title.toLowerCase() === (parsed.taskTitle || '').toLowerCase() &&
          (!parsed.day || t.day === parsed.day)
        )
        if (match) toggleTask(match.id)
        else parsed.message = (parsed.message || '') + ' (task not found)'
        break
      }
      case 'delete_task': {
        const match = tasks.find(t =>
          t.title.toLowerCase() === (parsed.taskTitle || '').toLowerCase() &&
          (!parsed.day || t.day === parsed.day)
        )
        if (match) deleteTask(match.id)
        else parsed.message = (parsed.message || '') + ' (task not found)'
        break
      }
      default:
        break
    }
  }

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    // Daily limit check for free users
    if (!isPro && aiCount >= planLimits.aiMessagesPerDay) {
      setMessages(prev => [...prev, { role: 'assistant', text: `🔒 Limite diário de ${planLimits.aiMessagesPerDay} mensagens atingido. Faça upgrade para Pro para IA ilimitada.`, raw: '', parsed: null }])
      return
    }

    setInput('')
    setPreview(null)
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    incAiCount()
    setAiCount(getAiCount())

    try {
      const ctx = buildContext()
      const history = messages.slice(-10).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.raw || m.text }))

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          temperature: 0.3,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT + '\n\nContext:\n' + ctx },
            ...history,
            { role: 'user', content: msg },
          ],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || res.statusText)
      const raw = data.choices?.[0]?.message?.content || ''

      let parsed
      try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) }
      catch { parsed = { action: 'chat', message: raw || 'Sorry, try rephrasing.' } }

      // Execute non-task actions immediately
      if (parsed.action && parsed.action !== 'create_tasks' && parsed.action !== 'chat') {
        executeAction(parsed)
      }

      setMessages(prev => [...prev, { role: 'assistant', text: parsed.message, raw, parsed }])
      if (parsed.action === 'create_tasks' && parsed.tasks?.length > 0) setPreview(parsed)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${err.message || 'Connection error. Check your internet and try again.'}`, raw: '', parsed: null }])
    }
    setLoading(false)
  }

  const confirmTasks = () => {
    if (!preview?.tasks) return
    const flat = preview.tasks.flatMap(t => {
      const { days, ...rest } = t
      return (days || []).map(day => ({ ...rest, day }))
    })
    addTasks(flat)
    pushToast(`${flat.length} task${flat.length > 1 ? 's' : ''} added!`, 'success')
    setPreview(null)
    setMessages(prev => [...prev, { role: 'assistant', text: `Done! ${flat.length} task${flat.length > 1 ? 's' : ''} added to your week.`, raw: '', parsed: null }])
  }

  const isEmpty = messages.length === 0

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-lg flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        style={{ height: 'min(680px, 96vh)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-sm leading-tight">WeekFlow AI</h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
              Powered by Groq
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isEmpty && (
            <div className="flex flex-col items-center justify-center h-full px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <h4 className="font-black text-base mb-1">What can I help you with?</h4>
              <p className="text-slate-400 text-sm mb-6">Create tasks, navigate, check stats, or ask anything about WeekFlow.</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                {QUICK_PROMPTS.map((q, i) => (
                  <button key={i} onClick={() => send(q.text)}
                    className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-primary/5 hover:border-primary/30 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 text-left transition-all">
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isEmpty && (
            <div className="px-4 py-5 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                    </div>
                  )}
                  <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-primary font-black text-xs">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-xs animate-spin">refresh</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.12}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {preview && (
                <div className="rounded-2xl border-2 border-primary/25 overflow-hidden">
                  <div className="px-4 py-3 bg-primary/8 dark:bg-primary/15 border-b border-primary/15 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">add_task</span>
                    <p className="text-sm font-black text-primary">
                      {preview.tasks.flatMap(t => t.days).length} task(s) ready to add
                    </p>
                  </div>
                  <div className="p-3 space-y-2 max-h-44 overflow-y-auto">
                    {preview.tasks.map((task, i) => (
                      <div key={i} className={`rounded-xl p-3 border text-xs ${CAT_STYLE[task.category] || CAT_STYLE.Other}`}>
                        <p className="font-black text-sm mb-1.5">{task.title}</p>
                        <div className="flex flex-wrap gap-1">
                          {(task.days||[]).map(d => (
                            <span key={d} className="px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-md font-bold">{d.slice(0,3)}</span>
                          ))}
                          <span className="px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-md">⏰ {task.time}</span>
                          <span className="px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-md">⏱ {task.duration}m</span>
                          <span className="px-2 py-0.5 bg-white/60 dark:bg-black/20 rounded-md capitalize">{task.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 p-3 border-t border-primary/15">
                    <button onClick={() => setPreview(null)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmTasks}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:opacity-90 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">add</span>
                      Add to Planner
                    </button>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="Add gym every Mon, Wed, Fri at 7am..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <button onClick={() => send()} disabled={!input.trim() || loading}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                input.trim() && !loading
                  ? 'bg-primary text-white hover:opacity-90 shadow-md shadow-primary/30'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}>
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-300 dark:text-slate-700 mt-1.5">
            Powered by Groq · Press ESC to close
          </p>
        </div>
      </div>
    </div>
  )
}
