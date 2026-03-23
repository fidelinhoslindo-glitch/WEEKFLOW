import { useState } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useApp } from '../context/AppContext'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const CATEGORY_META = {
  general:   { icon: 'info',              color: 'text-primary bg-primary/10',           border: 'border-primary/20'  },
  account:   { icon: 'manage_accounts',   color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',    border: 'border-blue-200 dark:border-blue-800'  },
  features:  { icon: 'auto_awesome',      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
  billing:   { icon: 'credit_card',       color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
  technical: { icon: 'build',             color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' },
}

function AccordionItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${open ? 'border-primary/40 bg-primary/[0.02] dark:bg-primary/5 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-primary/30'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${open ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          {index + 1}
        </span>
        <span className="flex-1 font-semibold text-sm leading-snug">{q}</span>
        <span className={`material-symbols-outlined text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div className="px-5 pb-5 ml-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
    ? categories.flatMap(cat => (t.faq.items[cat] || []).filter(i =>
        i.q.toLowerCase().includes(search.toLowerCase()) ||
        i.a.toLowerCase().includes(search.toLowerCase())
      ))
    : items

  const activeMeta = CATEGORY_META[activeCategory] || CATEGORY_META.general

  return (
    <div className="flex min-h-screen bg-bg-light dark:bg-bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={t.faq.title} subtitle={t.faq.subtitle} />

        <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">

          {/* Hero search bar */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder={t.faq.searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* Category sidebar */}
            {!search.trim() && (
              <aside className="lg:w-56 shrink-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 px-1">Categories</p>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  {categories.map(cat => {
                    const meta = CATEGORY_META[cat] || CATEGORY_META.general
                    const isActive = activeCategory === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all shrink-0 lg:w-full text-left border ${
                          isActive
                            ? 'bg-white dark:bg-slate-900 shadow-md border-primary/20 text-slate-900 dark:text-white'
                            : 'border-transparent text-slate-500 hover:bg-white dark:hover:bg-slate-900 hover:text-slate-700'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 material-symbols-outlined text-sm ${isActive ? meta.color : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          {meta.icon}
                        </span>
                        <span className="truncate">{t.faq.categories[cat]}</span>
                        {isActive && (
                          <span className="ml-auto text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                            {(t.faq.items[cat] || []).length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </aside>
            )}

            {/* FAQ items */}
            <div className="flex-1 min-w-0">
              {!search.trim() && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl border mb-5 ${activeMeta.border} bg-white dark:bg-slate-900`}>
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center material-symbols-outlined shrink-0 ${activeMeta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {activeMeta.icon}
                  </span>
                  <div>
                    <h2 className="font-black text-base">{t.faq.categories[activeCategory]}</h2>
                    <p className="text-xs text-slate-400">{(t.faq.items[activeCategory] || []).length} questions</p>
                  </div>
                </div>
              )}

              {search.trim() && filtered.length > 0 && (
                <p className="text-xs text-slate-400 font-semibold mb-4">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"</p>
              )}

              <div className="space-y-2.5">
                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 block mb-3">search_off</span>
                    <p className="font-bold text-slate-400">No results for "{search}"</p>
                    <p className="text-sm text-slate-400 mt-1">Try different keywords</p>
                  </div>
                ) : (
                  filtered.map((item, i) => (
                    <AccordionItem key={i} q={item.q} a={item.a} index={i} />
                  ))
                )}
              </div>

              {/* Still need help card */}
              {!search.trim() && (
                <div className="mt-8 rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <div className="p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
                      <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-black text-base">{t.faq.stillNeedHelp}</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{t.supportChat.greeting}</p>
                    </div>
                    <button
                      onClick={() => {
                        // trigger the support chat button in App.jsx
                        document.querySelector('[aria-label="Open support chat"]')?.click()
                      }}
                      className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/25"
                    >
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                      {t.faq.chatWithAI}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
