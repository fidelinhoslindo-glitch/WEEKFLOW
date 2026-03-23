import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useApp } from '../context/AppContext'

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-semibold text-sm pr-4">{q}</span>
        <span className={`material-symbols-outlined text-primary shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const { t } = useLanguage()
  const { navigate } = useApp()
  const [activeCategory, setActiveCategory] = useState('general')
  const [search, setSearch] = useState('')

  const categories = Object.keys(t.faq.categories)
  const items = t.faq.items[activeCategory] || []

  const filtered = search.trim().length > 1
    ? categories.flatMap(cat => t.faq.items[cat].filter(i =>
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase())
      ))
    : items

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 sm:px-8 py-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black">{t.faq.title}</h1>
        <p className="text-slate-500 mt-1">{t.faq.subtitle}</p>

        {/* Search */}
        <div className="mt-4 relative max-w-lg">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder={t.faq.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:border-primary transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 py-8 max-w-4xl">
        {/* Category tabs */}
        {!search.trim() && (
          <div className="flex gap-2 flex-wrap mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.faq.categories[cat]}
              </button>
            ))}
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl block mb-2">search_off</span>
              No results for "{search}"
            </div>
          ) : (
            filtered.map((item, i) => (
              <AccordionItem key={i} q={item.q} a={item.a} />
            ))
          )}
        </div>

        {/* Still need help */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <span className="material-symbols-outlined text-primary text-3xl block mb-2">support_agent</span>
          <h3 className="font-black text-lg mb-1">{t.faq.stillNeedHelp}</h3>
          <p className="text-slate-500 text-sm mb-4">{t.supportChat.greeting}</p>
          <button
            onClick={() => navigate('support-chat')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            {t.faq.chatWithAI}
          </button>
        </div>
      </div>
    </div>
  )
}
