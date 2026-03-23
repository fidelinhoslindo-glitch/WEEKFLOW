import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

function SUPPORT_SYSTEM(lang) {
  return `You are WeekFlow's friendly 24/7 AI support assistant. You help users with questions about the WeekFlow app — its features, account issues, billing, technical problems, and general usage.

Always respond in the same language as the user's message (${lang === 'pt' ? 'Portuguese' : lang === 'es' ? 'Spanish' : 'English'} preferred).
Be concise, friendly, and helpful. Use bullet points for multi-step instructions. Do NOT create tasks or modify the app — this is a support chat only.

WeekFlow features: weekly planner, daily view, smart calendar, pomodoro timer, notes, analytics, FlowCircle (group planning), AI assistant, cloud sync via Supabase, desktop app (Windows), PWA for mobile.
Plans: Free (basic), Pro ($8/mo), Business ($19/mo). Payments via Stripe (card + PIX).
Settings are at: sidebar → Settings. Language can be changed in Settings → Appearance.`
}

export default function SupportChat({ onClose }) {
  const { t, lang } = useLanguage()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t.supportChat.greeting }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    try {
      if (!GROQ_KEY) throw new Error('no key')
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SUPPORT_SYSTEM(lang) },
            ...history.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 500,
          temperature: 0.5,
        })
      })
      if (!res.ok) throw new Error('api error')
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || t.supportChat.errorMsg
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: t.supportChat.errorMsg }])
    }
    setLoading(false)
  }

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
      style={{ height: 480 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <p className="font-black text-sm leading-tight">{t.supportChat.title}</p>
            <p className="text-[10px] text-white/70">{t.supportChat.subtitle}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mr-2 mt-0.5">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-2xl rounded-bl-sm">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          placeholder={t.supportChat.placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-sm">send</span>
        </button>
      </div>
    </div>
  )
}
