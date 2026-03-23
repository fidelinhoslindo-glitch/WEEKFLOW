import { createContext, useContext, useState, useEffect } from 'react'
import translations from '../i18n/index.js'

const LanguageContext = createContext(null)

function detectLang() {
  const saved = localStorage.getItem('wf_lang')
  if (saved && translations[saved]) return saved
  const nav = (navigator.language || 'en').toLowerCase()
  if (nav.startsWith('pt')) return 'pt'
  if (nav.startsWith('es')) return 'es'
  return 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLang)

  const setLang = (l) => {
    if (!translations[l]) return
    localStorage.setItem('wf_lang', l)
    setLangState(l)
  }

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider')
  return ctx
}
