import { useState, useEffect, Component } from 'react'
import { useApp } from './context/AppContext'
import { useLanguage } from './context/LanguageContext'

// ── Pages ────────────────────────────────────────────────────────────────────
import LandingPage       from './pages/LandingPage'
import LoginPage         from './pages/LoginPage'
import OnboardingPage    from './pages/OnboardingPage'
import DashboardPage     from './pages/DashboardPage'
import WeeklyPlannerPage from './pages/WeeklyPlannerPage'
import PomodoroPage      from './pages/PomodoroPage'
import NotesPage         from './pages/NotesPage'
import SmartCalendarPage from './pages/SmartCalendarPage'
import FlowCirclePage    from './pages/FlowCirclePage'
import AppleTimerPage    from './pages/AppleTimerPage'
import ShareWeekPage     from './pages/ShareWeekPage'
import CheckoutPage      from './pages/CheckoutPage'
import AdminPage         from './pages/AdminPage'
import DownloadPage      from './pages/DownloadPage'
import FAQPage           from './pages/FAQPage'
import {
  DailyDetailPage, RoutineTemplatesPage, CalendarPage,
  AnalyticsPage, SettingsPage, ExportPage, EmptyStatesPage,
} from './pages/OtherPages'

// ── Components ───────────────────────────────────────────────────────────────
import AddTaskModal   from './components/AddTaskModal'
import EditTaskModal  from './components/EditTaskModal'
import GlobalSearch   from './components/GlobalSearch'
import ToastContainer from './components/ToastContainer'
import BottomNav      from './components/BottomNav'
import Confetti       from './components/Confetti'
import SplashScreen   from './components/SplashScreen'
import AIChat         from './components/AIChat'
import SupportChat    from './components/SupportChat'
import TourGuide, { useTour } from './components/TourGuide'
import FlowCircleWidget from './components/FlowCircleWidget'
import SetupWizard    from './components/SetupWizard'
import TrialBanner    from './components/TrialBanner'
import TrialExpiredModal from './components/TrialExpiredModal'

// ── Page map ─────────────────────────────────────────────────────────────────
const PAGES = {
  landing:          LandingPage,
  login:            LoginPage,
  onboarding:       OnboardingPage,
  dashboard:        DashboardPage,
  planner:          WeeklyPlannerPage,
  daily:            DailyDetailPage,
  templates:        RoutineTemplatesPage,
  calendar:         CalendarPage,
  analytics:        AnalyticsPage,
  settings:         SettingsPage,
  export:           ExportPage,
  empty:            EmptyStatesPage,
  pomodoro:         PomodoroPage,
  notes:            NotesPage,
  'smart-calendar': SmartCalendarPage,
  flowcircle:       FlowCirclePage,
  timer:            AppleTimerPage,
  share:            ShareWeekPage,
  checkout:         CheckoutPage,
  admin:            AdminPage,
  download:         DownloadPage,
  faq:              FAQPage,
}

const APP_PAGES = [
  'dashboard','planner','daily','calendar','analytics',
  'settings','pomodoro','empty','notes','smart-calendar',
  'flowcircle','faq','download',
]

// ── ErrorBoundary — catches silent React crashes ──────────────────────────────
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:32, fontFamily:'Inter,sans-serif', background:'#f6f6f8' }}>
          <div style={{ fontSize:48 }}>⚠️</div>
          <h2 style={{ fontSize:22, fontWeight:900, color:'#1e293b', margin:0 }}>Something went wrong</h2>
          <p style={{ color:'#64748b', fontSize:14, textAlign:'center', maxWidth:400, margin:0 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); localStorage.removeItem('wf_tasks'); window.location.reload() }}
            style={{ background:'#6467f2', color:'white', border:'none', borderRadius:12, padding:'12px 24px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Reset &amp; Reload
          </button>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ background:'transparent', color:'#6467f2', border:'2px solid #6467f2', borderRadius:12, padding:'10px 22px', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  )
}

function AppInner() {
  const {
    page, showAddTask, editingTask, showSearch,
    confetti, setConfetti,
    showAIChat, setShowAIChat,
    isLoggedIn,
  } = useApp()
  const { t } = useLanguage()

  const { show: showTour, finish: finishTour } = useTour()

  // Electron auto-update banner
  const isElectron = typeof window !== 'undefined' && !!window.electron
  const [updateReady, setUpdateReady] = useState(false)

  useEffect(() => {
    if (!isElectron) return
    window.electron.onUpdateDownloaded?.(() => setUpdateReady(true))
  }, [isElectron])

  // Electron first-run setup wizard
  const [setupDone, setSetupDone] = useState(
    () => !isElectron || localStorage.getItem('wf_setup_done') === '1'
  )

  // Splash — show once per browser session
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('wf_splash') === '1'
  )
  const handleSplashDone = () => {
    sessionStorage.setItem('wf_splash', '1')
    setSplashDone(true)
  }

  // Support chat floating button
  const [showSupport, setShowSupport] = useState(false)

  if (!setupDone) {
    return <SetupWizard onFinish={() => setSetupDone(true)} />
  }

  if (!splashDone) {
    return <SplashScreen onDone={handleSplashDone} />
  }

  const PageComponent = PAGES[page] ?? LandingPage
  const showBottomNav = APP_PAGES.includes(page)

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {updateReady && (
        <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-4 px-4 py-2.5 bg-primary text-white text-sm font-medium shadow-lg">
          <span>⬆️ {t.app.updateBanner}</span>
          <button
            onClick={() => window.electron.installUpdate()}
            className="shrink-0 bg-white text-primary font-bold px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {t.app.updateBtn}
          </button>
        </div>
      )}
      {isLoggedIn && showBottomNav && <TrialBanner />}
      <ErrorBoundary>
        <div className={showBottomNav ? 'pb-20 lg:pb-0' : ''}>
          <PageComponent />
        </div>
      </ErrorBoundary>

      {showBottomNav  && <BottomNav />}
      {showAddTask    && <AddTaskModal />}
      {editingTask    && <EditTaskModal />}
      {showSearch     && <GlobalSearch />}
      {confetti       && <Confetti onDone={() => setConfetti(false)} />}
      {showAIChat     && <AIChat onClose={() => setShowAIChat(false)} />}
      {showTour && isLoggedIn && <TourGuide onFinish={finishTour} />}
      {isLoggedIn && showBottomNav && <FlowCircleWidget />}
      {isLoggedIn && <TrialExpiredModal />}
      <ToastContainer />
      <KeyboardHint />

      {/* Support Chat — only on FAQ page */}
      {isLoggedIn && page === 'faq' && (
        <>
          {showSupport && <SupportChat onClose={() => setShowSupport(false)} />}
          <button
            onClick={() => setShowSupport(s => !s)}
            className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-all active:scale-95"
            aria-label="Open support chat"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: showSupport ? "'FILL' 1" : "'FILL' 0" }}>
              {showSupport ? 'close' : 'support_agent'}
            </span>
          </button>
        </>
      )}
    </div>
  )
}

// ── Keyboard shortcut pill ─────────────────────────────────────────────────--
function KeyboardHint() {
  const { page } = useApp()
  const { t } = useLanguage()
  if (!APP_PAGES.includes(page)) return null
  return (
    <div className="hidden lg:flex fixed bottom-4 right-4 items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 shadow-lg z-40">
      <span className="material-symbols-outlined text-sm text-primary">keyboard</span>
      <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">N</kbd> {t.app.newTask}</span>
      <span className="text-slate-200 dark:text-slate-700">·</span>
      <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">⌘K</kbd> {t.app.searchShort}</span>
      <span className="text-slate-200 dark:text-slate-700">·</span>
      <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">F</kbd> {t.app.focus}</span>
    </div>
  )
}
