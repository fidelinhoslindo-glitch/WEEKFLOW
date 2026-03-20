import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    badge: 'Version 2.5 Now Live',
    heroTitle1: 'Organize your week,',
    heroTitle2: 'find your flow.',
    heroSub: 'Master your recurring responsibilities like work, gym, and study with our intuitive weekly planner designed for modern life.',
    cta1: 'Build my week',
    cta2: 'See demo',
    featuresTitle: 'Designed for your rhythm',
    featuresub: 'Everything you need to stay consistent and balanced.',
    pricingTitle: 'Simple pricing',
    pricingSub: 'Start free. Upgrade when you\'re ready.',
    faqTitle: 'Frequently asked questions',
    footerTagline: 'Organize your week, find your flow.',
    login: 'Log In',
    getStarted: 'Get Started',
    goToDashboard: 'My Dashboard',
    free: 'Free',
    pro: 'Pro',
    business: 'Business',
    monthly: '/mo',
    yearly: '/yr',
    mostPop: 'Most Popular',
    forTeams: 'For teams',
    freeForever: 'Free forever',
    save33: 'Save 33% yearly',
    noCreditCard: 'No credit card needed',
    startFree: 'Get started free',
    startPro: 'Start Pro',
    startBusiness: 'Start Business',
    features: [
      { icon: 'sync',     title: 'Recurring Routines',   desc: 'Set your weekly habits once and let them flow automatically.' },
      { icon: 'palette',  title: 'Visual Balance',        desc: 'See how your time is distributed with color-coded categories.' },
      { icon: 'insights', title: 'Progress Insights',     desc: 'Get data-driven feedback on your consistency and habits.' },
      { icon: 'group',    title: 'FlowCircle',            desc: 'Plan together with your partner, friends, family or team.' },
      { icon: 'smart_toy',title: 'AI Scheduling',         desc: 'Add tasks naturally with AI. Just type what you need to do.' },
      { icon: 'notifications', title: 'Smart Reminders',  desc: 'Never miss a task with push notifications and alarms.' },
    ],
    faqs: [
      { q: 'Is there a mobile app?',            a: 'Yes! Available on iOS, Android, and as a desktop app for Windows.' },
      { q: 'Is WeekFlow free?',                 a: 'Yes, the core features are free. Pro unlocks unlimited tasks and cloud sync.' },
      { q: 'How does FlowCircle work?',         a: 'Create a circle, invite friends via link, and plan events together in real time.' },
      { q: 'Is my data secure?',                a: 'Yes. Your data is encrypted and stored securely via Supabase.' },
    ],
  },
  pt: {
    badge: 'Versão 2.5 Disponível',
    heroTitle1: 'Organize sua semana,',
    heroTitle2: 'encontre seu fluxo.',
    heroSub: 'Domine suas responsabilidades recorrentes como trabalho, academia e estudo com nosso planejador semanal intuitivo.',
    cta1: 'Montar minha semana',
    cta2: 'Ver demonstração',
    featuresTitle: 'Criado para o seu ritmo',
    featuresub: 'Tudo que você precisa para manter consistência e equilíbrio.',
    pricingTitle: 'Preços simples',
    pricingSub: 'Comece grátis. Atualize quando estiver pronto.',
    faqTitle: 'Perguntas frequentes',
    footerTagline: 'Organize sua semana, encontre seu fluxo.',
    login: 'Entrar',
    getStarted: 'Começar',
    goToDashboard: 'Meu Painel',
    free: 'Grátis',
    pro: 'Pro',
    business: 'Business',
    monthly: '/mês',
    yearly: '/ano',
    mostPop: 'Mais Popular',
    forTeams: 'Para times',
    freeForever: 'Grátis para sempre',
    save33: 'Economize 33% no anual',
    noCreditCard: 'Sem cartão de crédito',
    startFree: 'Começar grátis',
    startPro: 'Começar Pro',
    startBusiness: 'Começar Business',
    features: [
      { icon: 'sync',     title: 'Rotinas Recorrentes',   desc: 'Configure seus hábitos semanais uma vez e deixe fluir automaticamente.' },
      { icon: 'palette',  title: 'Equilíbrio Visual',      desc: 'Veja como seu tempo é distribuído com categorias coloridas.' },
      { icon: 'insights', title: 'Insights de Progresso',  desc: 'Receba feedback baseado em dados sobre sua consistência.' },
      { icon: 'group',    title: 'FlowCircle',             desc: 'Planeje junto com seu parceiro, amigos, família ou equipe.' },
      { icon: 'smart_toy',title: 'IA de Agenda',           desc: 'Adicione tarefas naturalmente com IA. Só escreva o que precisa fazer.' },
      { icon: 'notifications', title: 'Lembretes Inteligentes', desc: 'Nunca perca uma tarefa com notificações e alarmes.' },
    ],
    faqs: [
      { q: 'Tem app mobile?',              a: 'Sim! Disponível no iOS, Android e como app desktop para Windows.' },
      { q: 'O WeekFlow é gratuito?',       a: 'Sim, as funcionalidades principais são gratuitas. O Pro desbloqueia tarefas ilimitadas e sync na nuvem.' },
      { q: 'Como o FlowCircle funciona?',  a: 'Crie um círculo, convide amigos por link e planeje eventos juntos em tempo real.' },
      { q: 'Meus dados são seguros?',      a: 'Sim. Seus dados são criptografados e armazenados com segurança via Supabase.' },
    ],
  },
  es: {
    badge: 'Versión 2.5 Disponible',
    heroTitle1: 'Organiza tu semana,',
    heroTitle2: 'encuentra tu flujo.',
    heroSub: 'Domina tus responsabilidades recurrentes como trabajo, gimnasio y estudio con nuestro planificador semanal intuitivo.',
    cta1: 'Armar mi semana',
    cta2: 'Ver demo',
    featuresTitle: 'Diseñado para tu ritmo',
    featuresub: 'Todo lo que necesitas para mantenerte consistente y equilibrado.',
    pricingTitle: 'Precios simples',
    pricingSub: 'Empieza gratis. Actualiza cuando estés listo.',
    faqTitle: 'Preguntas frecuentes',
    footerTagline: 'Organiza tu semana, encuentra tu flujo.',
    login: 'Iniciar sesión',
    getStarted: 'Empezar',
    goToDashboard: 'Mi Panel',
    free: 'Gratis',
    pro: 'Pro',
    business: 'Business',
    monthly: '/mes',
    yearly: '/año',
    mostPop: 'Más Popular',
    forTeams: 'Para equipos',
    freeForever: 'Gratis para siempre',
    save33: 'Ahorra 33% anual',
    noCreditCard: 'Sin tarjeta de crédito',
    startFree: 'Empezar gratis',
    startPro: 'Empezar Pro',
    startBusiness: 'Empezar Business',
    features: [
      { icon: 'sync',     title: 'Rutinas Recurrentes',   desc: 'Configura tus hábitos semanales una vez y déjalos fluir.' },
      { icon: 'palette',  title: 'Equilibrio Visual',      desc: 'Ve cómo se distribuye tu tiempo con categorías a color.' },
      { icon: 'insights', title: 'Insights de Progreso',   desc: 'Recibe retroalimentación basada en datos sobre tu consistencia.' },
      { icon: 'group',    title: 'FlowCircle',             desc: 'Planifica con tu pareja, amigos, familia o equipo.' },
      { icon: 'smart_toy',title: 'Agenda con IA',          desc: 'Agrega tareas naturalmente con IA. Solo escribe lo que necesitas.' },
      { icon: 'notifications', title: 'Recordatorios',     desc: 'Nunca pierdas una tarea con notificaciones y alarmas.' },
    ],
    faqs: [
      { q: '¿Hay app móvil?',              a: 'Sí! Disponible en iOS, Android y como app de escritorio para Windows.' },
      { q: '¿WeekFlow es gratuito?',       a: 'Sí, las funciones principales son gratuitas. Pro desbloquea tareas ilimitadas y sync en la nube.' },
      { q: '¿Cómo funciona FlowCircle?',   a: 'Crea un círculo, invita amigos por enlace y planifica eventos juntos en tiempo real.' },
      { q: '¿Mis datos están seguros?',    a: 'Sí. Tus datos están cifrados y almacenados de forma segura vía Supabase.' },
    ],
  },
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      let start = 0
      const step = Math.ceil(to / 60)
      const timer = setInterval(() => {
        start = Math.min(start + step, to)
        setVal(start)
        if (start >= to) clearInterval(timer)
      }, 20)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

// ── Fade-in on scroll ─────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}
      style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(32px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const { navigate, darkMode, setDarkMode, isLoggedIn, onboardingData } = useApp()

  const handleStart = () => {
    if (!isLoggedIn) return navigate('login')
    const isDoneOnboarding = onboardingData && Object.keys(onboardingData).length > 0
    return navigate(isDoneOnboarding ? 'dashboard' : 'onboarding')
  }
  const [openFaq, setOpenFaq] = useState(null)
  const [lang, setLang] = useState('pt')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [pricingBilling, setPricingBilling] = useState('monthly')
  const t = T[lang]

  const LANGS = [{ code:'pt', label:'PT' }, { code:'en', label:'EN' }, { code:'es', label:'ES' }]

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 w-full border-b border-primary/10 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('landing')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="#6467f2"/>
                <rect x="7" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="13" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="19" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="25" y="8" width="4" height="20" rx="2" fill="white"/>
              </svg>
              <span className="text-xl font-black tracking-tight">WeekFlow</span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Features</a>
              <a href="#pricing"  className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Pricing</a>
              <a href="#faq"      className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">FAQ</a>
            </div>

            <div className="flex items-center gap-2">
              {/* Lang switcher */}
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-2 sm:px-2.5 py-1.5 text-xs font-bold transition-all ${lang===l.code?'bg-primary text-white':'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
              {/* Dark mode */}
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl hover:bg-primary/10 text-slate-500 dark:text-slate-400 transition-colors">
                <span className="material-symbols-outlined text-sm">{darkMode?'light_mode':'dark_mode'}</span>
              </button>
              {/* Desktop-only buttons */}
              <button onClick={() => navigate('download')} className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 py-2 hover:bg-primary/5 rounded-xl transition-all">
                <span className="material-symbols-outlined text-sm text-primary">download</span>Desktop
              </button>
              {!isLoggedIn && (
                <button onClick={() => navigate('login')} className="hidden md:block text-sm font-semibold px-4 py-2 hover:bg-primary/5 rounded-xl transition-all">{t.login}</button>
              )}
              {/* CTA - shorter text on mobile */}
              {isLoggedIn ? (
                <button onClick={() => navigate('dashboard')} className="bg-primary text-white text-sm font-bold px-3 sm:px-5 py-2 rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">dashboard</span><span className="hidden sm:inline">{t.goToDashboard}</span><span className="sm:hidden">App</span>
                </button>
              ) : (
                <button onClick={handleStart} className="bg-primary text-white text-sm font-bold px-3 sm:px-5 py-2 rounded-xl shadow-lg shadow-primary/25 hover:opacity-90 transition-all"><span className="hidden sm:inline">{t.getStarted}</span><span className="sm:hidden">{lang==='pt'?'Entrar':lang==='es'?'Entrar':'Start'}</span></button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28 lg:pt-36 lg:pb-44">
        {/* Animated background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-primary/6 blur-[120px] -top-40 -left-40 animate-pulse" style={{animationDuration:'8s'}}/>
          <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/6 blur-[120px] -bottom-40 -right-40 animate-pulse" style={{animationDuration:'10s', animationDelay:'2s'}}/>
          <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/5 blur-[80px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{animationDuration:'6s', animationDelay:'1s'}}/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-8"
            style={{animation:'fadeDown 0.6s ease both'}}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"/>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"/>
            </span>
            {t.badge}
          </div>

          {/* Headline with typewriter feel */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black leading-[1.08] tracking-tight mb-6"
            style={{animation:'fadeUp 0.7s ease 0.1s both'}}>
            {t.heroTitle1}<br/>
            <span className="text-primary relative">
              {t.heroTitle2}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none">
                <path d="M0 6 Q75 2 150 6 Q225 10 300 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary opacity-40"/>
              </svg>
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-8 sm:mb-10 leading-relaxed px-2"
            style={{animation:'fadeUp 0.7s ease 0.2s both'}}>
            {t.heroSub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            style={{animation:'fadeUp 0.7s ease 0.3s both'}}>
            <button onClick={isLoggedIn ? () => navigate('dashboard') : handleStart}
              className="w-full sm:w-auto group bg-primary text-white text-base font-bold px-8 py-4 rounded-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">{isLoggedIn ? 'dashboard' : 'bolt'}</span>
              {isLoggedIn ? t.goToDashboard : t.cta1}
            </button>
            <button onClick={() => navigate('dashboard')}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold px-8 py-4 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all inline-flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary">play_circle</span>{t.cta2}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-12 sm:mb-16" style={{animation:'fadeUp 0.7s ease 0.35s both'}}>
            {[
              { val:50000, suf:'+', label: lang==='pt'?'Usuários':lang==='es'?'Usuarios':'Users' },
              { val:4, suf:'.9★', label: lang==='pt'?'Avaliação':lang==='es'?'Valoración':'Rating' },
              { val:99, suf:'%', label: lang==='pt'?'Uptime':lang==='es'?'Tiempo activo':'Uptime' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"><Counter to={s.val} suffix={s.suf}/></p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* App mockup with floating cards */}
          <div className="relative max-w-5xl mx-auto" style={{animation:'fadeUp 0.8s ease 0.4s both'}}>
            {/* Floating cards */}
            <div className="absolute -left-6 top-16 z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-3 border border-slate-200 dark:border-slate-700 hidden lg:block"
              style={{animation:'float 4s ease-in-out infinite'}}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-500 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{lang==='pt'?'Tarefa concluída!':lang==='es'?'¡Tarea completada!':'Task completed!'}</p>
                  <p className="text-[10px] text-slate-400">Morning Workout</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-6 top-20 z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-3 border border-slate-200 dark:border-slate-700 hidden lg:block"
              style={{animation:'float 4s ease-in-out infinite', animationDelay:'1s'}}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">group</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">FlowCircle</p>
                  <p className="text-[10px] text-slate-400">3 {lang==='pt'?'membros online':lang==='es'?'miembros en línea':'members online'}</p>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 bottom-16 z-10 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-3 border border-slate-200 dark:border-slate-700 hidden lg:block"
              style={{animation:'float 4s ease-in-out infinite', animationDelay:'2s'}}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-sm">bolt</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{lang==='pt'?'74% completo':lang==='es'?'74% completado':'74% complete'}</p>
                  <p className="text-[10px] text-slate-400">{lang==='pt'?'Esta semana':lang==='es'?'Esta semana':'This week'}</p>
                </div>
              </div>
            </div>

            {/* Browser mockup */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl opacity-60 rounded-3xl"/>
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-emerald-400"/>
                </div>
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 h-6 rounded-lg flex items-center px-3 gap-2">
                  <span className="material-symbols-outlined text-slate-400" style={{fontSize:12}}>lock</span>
                  <span className="text-xs text-slate-400 font-mono">weekflow.app</span>
                </div>
              </div>
              {/* Desktop: full 7-col mockup */}
              <div className="hidden sm:grid p-5 grid-cols-7 gap-2" style={{height:280}}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => (
                  <div key={day} className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-slate-400 text-center">{day}</p>
                    {i<5 ? (
                      <>
                        <div className="h-14 rounded-xl bg-primary/10 border border-primary/20 p-1.5 flex flex-col gap-1">
                          <div className="h-1.5 w-3/4 bg-primary/50 rounded-full"/>
                          <div className="h-1.5 w-1/2 bg-primary/25 rounded-full"/>
                        </div>
                        <div className="h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/30"/>
                        {i%2===0 && <div className="h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/30"/>}
                      </>
                    ) : (
                      <>
                        <div className="h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200/50"/>
                        <div className="h-8 rounded-xl bg-rose-100 dark:bg-rose-900/30 border border-rose-200/50"/>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {/* Mobile: simplified 5-col mockup */}
              <div className="sm:hidden grid p-3 grid-cols-5 gap-1.5" style={{height:180}}>
                {['Mon','Tue','Wed','Thu','Fri'].map((day, i) => (
                  <div key={day} className="flex flex-col gap-1">
                    <p className="text-[9px] font-bold text-slate-400 text-center">{day}</p>
                    <div className="h-10 rounded-lg bg-primary/10 border border-primary/20 p-1 flex flex-col gap-0.5">
                      <div className="h-1 w-3/4 bg-primary/50 rounded-full"/>
                      <div className="h-1 w-1/2 bg-primary/25 rounded-full"/>
                    </div>
                    <div className="h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/30"/>
                    {i%2===0 && <div className="h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/30"/>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.featuresTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.featuresub}</p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((f, i) => (
              <FadeIn key={i} delay={i*80}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>{f.icon}</span>
                  </div>
                  <h3 className="font-black text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t.pricingTitle}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">{t.pricingSub}</p>
          </FadeIn>

          {/* Billing toggle */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {[['monthly', lang === 'pt' ? 'Mensal' : lang === 'es' ? 'Mensual' : 'Monthly'],['yearly', lang === 'pt' ? 'Anual' : lang === 'es' ? 'Anual' : 'Yearly']].map(([k, label]) => (
                <button key={k} onClick={() => setPricingBilling(k)}
                  className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-all ${pricingBilling === k ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                  {label}
                  {k === 'yearly' && <span className="absolute -top-2.5 -right-3 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">-33%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <FadeIn delay={0}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 h-full flex flex-col">
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1 rounded-full mb-4 self-start">
                  {t.freeForever}
                </div>
                <p className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">{t.free}</p>
                <p className="text-4xl sm:text-5xl font-black mb-1">{lang === 'pt' ? 'R$0' : '$0'}</p>
                <p className="text-slate-400 text-sm mb-6">{t.noCreditCard}</p>
                <ul className="space-y-2.5 flex-1 mb-8">
                  {(lang === 'pt' ? [
                    '15 tarefas simultâneas',
                    'Planner semanal completo',
                    '1 FlowCircle (3 membros)',
                    'Pulso do Círculo + FlowStreak básico',
                    '5 mensagens de IA por dia',
                    'App web + desktop',
                  ] : lang === 'es' ? [
                    '15 tareas simultáneas',
                    'Planificador semanal completo',
                    '1 FlowCircle (3 miembros)',
                    'Pulso del Círculo + FlowStreak básico',
                    '5 mensajes de IA por día',
                    'App web + escritorio',
                  ] : [
                    '15 simultaneous tasks',
                    'Full weekly planner',
                    '1 FlowCircle (3 members)',
                    'Circle Pulse + basic FlowStreak',
                    '5 AI messages per day',
                    'Web + desktop app',
                  ]).map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm">
                      <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5 shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('login')} className="w-full py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-all">
                  {t.startFree}
                </button>
              </div>
            </FadeIn>

            {/* Pro — highlighted */}
            <FadeIn delay={100}>
              <div className="bg-primary rounded-2xl p-6 sm:p-8 relative overflow-hidden h-full flex flex-col shadow-2xl shadow-primary/30 border-2 border-primary">
                <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full">{t.mostPop}</div>
                <p className="text-sm font-black uppercase tracking-wider text-white/70 mb-2">{t.pro}</p>
                <p className="text-4xl sm:text-5xl font-black text-white mb-1">
                  {lang === 'pt' ? (pricingBilling === 'yearly' ? 'R$152' : 'R$19') : (pricingBilling === 'yearly' ? '$64' : '$8')}
                  <span className="text-lg font-medium text-white/70">{pricingBilling === 'yearly' ? t.yearly : t.monthly}</span>
                </p>
                {pricingBilling === 'yearly'
                  ? <p className="text-emerald-300 text-xs font-bold mb-6">{lang === 'pt' ? 'Economize R$76' : lang === 'es' ? 'Ahorra $32' : 'Save $32'}</p>
                  : <p className="text-white/60 text-xs mb-6">{lang === 'pt' ? 'ou R$152/ano — economize R$76' : lang === 'es' ? 'o $64/año — ahorra $32' : 'or $64/year — save $32'}</p>
                }
                <ul className="space-y-2.5 flex-1 mb-8">
                  {(lang === 'pt' ? [
                    'Tarefas ilimitadas',
                    'Sync na nuvem (Supabase)',
                    'IA ilimitada (Groq)',
                    'Circles ilimitados',
                    'Detector de Colisão',
                    'Janela Livre automática',
                    'FlowStreak + Escudos + Pacto',
                    'Previsão da Semana',
                    'Analytics completo (90 dias)',
                    'Smart Calendar IA',
                    'Google Calendar sync',
                  ] : lang === 'es' ? [
                    'Tareas ilimitadas',
                    'Sync en la nube (Supabase)',
                    'IA ilimitada (Groq)',
                    'Circles ilimitados',
                    'Detector de Colisión',
                    'Ventana Libre automática',
                    'FlowStreak + Escudos + Pacto',
                    'Previsión de la Semana',
                    'Analytics completo (90 días)',
                    'Smart Calendar IA',
                    'Google Calendar sync',
                  ] : [
                    'Unlimited tasks',
                    'Cloud sync (Supabase)',
                    'Unlimited AI (Groq)',
                    'Unlimited Circles',
                    'Collision Detector',
                    'Automatic Free Window',
                    'FlowStreak + Shields + Pact',
                    'Week Preview',
                    'Full analytics (90 days)',
                    'Smart Calendar AI',
                    'Google Calendar sync',
                  ]).map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white">
                      <span className="material-symbols-outlined text-white/80 text-sm mt-0.5 shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { localStorage.setItem('wf_selected_plan','pro'); navigate('checkout') }} className="w-full py-3 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-all">
                  {t.startPro} →
                </button>
              </div>
            </FadeIn>

            {/* Business */}
            <FadeIn delay={200}>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-purple-300 dark:border-purple-700 p-6 sm:p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-black px-3 py-1 rounded-full">{t.forTeams}</div>
                <p className="text-sm font-black uppercase tracking-wider text-purple-500 mb-2">{t.business}</p>
                <p className="text-4xl sm:text-5xl font-black text-purple-600 dark:text-purple-400 mb-1">
                  {lang === 'pt' ? (pricingBilling === 'yearly' ? 'R$392' : 'R$49') : (pricingBilling === 'yearly' ? '$152' : '$19')}
                  <span className="text-lg font-medium text-purple-400 dark:text-purple-500">{pricingBilling === 'yearly' ? t.yearly : t.monthly}</span>
                </p>
                {pricingBilling === 'yearly'
                  ? <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-6">{lang === 'pt' ? 'Economize R$196' : lang === 'es' ? 'Ahorra $76' : 'Save $76'}</p>
                  : <p className="text-slate-400 text-xs mb-6">{lang === 'pt' ? 'ou R$392/ano — economize R$196' : lang === 'es' ? 'o $152/año — ahorra $76' : 'or $152/year — save $76'}</p>
                }
                <ul className="space-y-2.5 flex-1 mb-8">
                  {(lang === 'pt' ? [
                    'Tudo do Pro, mais:',
                    'Membros ilimitados por círculo',
                    'Painel admin do time',
                    'Delegar tarefas por membro',
                    'Relatório semanal do time',
                    'Chama do Círculo avançada',
                    'Analytics do time (90 dias)',
                    'Suporte prioritário',
                  ] : lang === 'es' ? [
                    'Todo de Pro, más:',
                    'Miembros ilimitados por círculo',
                    'Panel admin del equipo',
                    'Delegar tareas por miembro',
                    'Informe semanal del equipo',
                    'Llama del Círculo avanzada',
                    'Analytics del equipo (90 días)',
                    'Soporte prioritario',
                  ] : [
                    'Everything in Pro, plus:',
                    'Unlimited members per circle',
                    'Team admin panel',
                    'Delegate tasks per member',
                    'Weekly team report',
                    'Advanced Circle Flame',
                    'Team analytics (90 days)',
                    'Priority support',
                  ]).map((item, i) => (
                    <li key={item} className={`flex items-start gap-3 text-sm ${i === 0 ? 'font-black text-purple-500 text-xs uppercase tracking-wider mt-1' : 'text-slate-700 dark:text-slate-300'}`}>
                      {i > 0 && <span className="material-symbols-outlined text-purple-500 text-sm mt-0.5 shrink-0" style={{fontVariationSettings:"'FILL' 1"}}>check_circle</span>}
                      {item}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { localStorage.setItem('wf_selected_plan','business'); navigate('checkout') }} className="w-full py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/25">
                  {t.startBusiness} →
                </button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black">{t.faqTitle}</h2>
          </FadeIn>
          <div className="space-y-3">
            {t.faqs.map((faq, i) => (
              <FadeIn key={i} delay={i*60}>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <button className="w-full flex items-center justify-between px-6 py-5 text-left" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                    <span className="font-bold">{faq.q}</span>
                    <span className="material-symbols-outlined text-slate-400 transition-transform" style={{transform:openFaq===i?'rotate(180deg)':''}}>expand_more</span>
                  </button>
                  {openFaq===i && (
                    <div className="px-6 pb-5 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <FadeIn>
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary"/>
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_100%)]"/>
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {lang==='pt'?'Sua semana mais organizada começa hoje.':lang==='es'?'Tu semana más organizada empieza hoy.':'Your most organized week starts today.'}
            </h2>
            <button onClick={isLoggedIn ? () => navigate('dashboard') : handleStart}
              className="bg-white text-primary text-lg font-black px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 transition-all">
              {isLoggedIn ? t.goToDashboard : t.cta1} →
            </button>
          </div>
        </section>
      </FadeIn>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="36" height="36" rx="10" fill="#6467f2"/>
                <rect x="7" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="13" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="19" y="8" width="4" height="20" rx="2" fill="white"/>
                <rect x="25" y="8" width="4" height="20" rx="2" fill="white"/>
              </svg>
            <span className="font-black text-lg">WeekFlow</span>
          </div>
          <p className="text-slate-400 text-sm">{t.footerTagline}</p>
          <p className="text-slate-300 dark:text-slate-600 text-xs mt-4">© 2026 WeekFlow. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes fadeDown {
          from { opacity:0; transform:translateY(-16px) }
          to   { opacity:1; transform:translateY(0) }
        }
        @keyframes float {
          0%,100% { transform:translateY(0px) }
          50%     { transform:translateY(-12px) }
        }
      `}</style>
    </div>
  )
}
