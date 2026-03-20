import { useState } from 'react'
import { useApp } from '../context/AppContext'

const GOALS = [
  { id: 'organized',   icon: 'grid_view',  title: 'Be Organized', desc: 'Everything in its right place, always.' },
  { id: 'stress',      icon: 'spa',        title: 'Less Stress',   desc: 'A calm, structured week for peace of mind.' },
  { id: 'routine',     icon: 'repeat',     title: 'Build Routine', desc: 'Lock in healthy, productive habits.' },
  { id: 'productivity',icon: 'bolt',       title: 'Productivity',  desc: 'Accomplish more in less time.' },
]

const ACTIVITIES = [
  { id: 'work',       icon: 'work',            label: 'Work'       },
  { id: 'gym',        icon: 'fitness_center',  label: 'Gym'        },
  { id: 'study',      icon: 'school',          label: 'Study'      },
  { id: 'meditation', icon: 'self_improvement',label: 'Meditation' },
  { id: 'cooking',    icon: 'restaurant',      label: 'Cooking'    },
  { id: 'reading',    icon: 'menu_book',       label: 'Reading'    },
  { id: 'social',     icon: 'people',          label: 'Social'     },
  { id: 'rest',       icon: 'hotel',           label: 'Rest'       },
]

const STEPS = ['Goal', 'Activities', 'Work Hours', 'Wake Up', 'Days Off', 'Summary']

const fmt2 = (n) => String(n).padStart(2, '0')
const fmtTime = (val) => {
  const [h, m] = val.split(':').map(Number)
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return fmt2(h12) + ':' + fmt2(m) + ' ' + (h >= 12 ? 'PM' : 'AM')
}

// SVG illustration for each step
function StepIllustration({ step }) {
  const illustrations = [
    // 0: Goal — target
    <svg key={0} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <circle cx="100" cy="80" r="60" fill="#6467f2" fillOpacity="0.08"/>
      <circle cx="100" cy="80" r="42" fill="#6467f2" fillOpacity="0.12"/>
      <circle cx="100" cy="80" r="24" fill="#6467f2" fillOpacity="0.25"/>
      <circle cx="100" cy="80" r="10" fill="#6467f2"/>
      <line x1="100" y1="22" x2="100" y2="80" stroke="#6467f2" strokeWidth="3" strokeLinecap="round"/>
      <path d="M100 22 L118 32 L100 42 Z" fill="#6467f2"/>
      <circle cx="58"  cy="112" r="6" fill="#10b981" fillOpacity="0.7"/>
      <circle cx="148" cy="48"  r="4" fill="#8b5cf6" fillOpacity="0.7"/>
      <circle cx="158" cy="120" r="5" fill="#f59e0b" fillOpacity="0.7"/>
    </svg>,
    // 1: Activities — grid icons
    <svg key={1} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <rect x="30" y="28" width="140" height="104" rx="12" fill="#f8f9ff" stroke="#6467f2" strokeWidth="2" strokeOpacity="0.4"/>
      <rect x="30" y="28" width="140" height="30" rx="12" fill="#6467f2" fillOpacity="0.15"/>
      <circle cx="65"  cy="90" r="16" fill="#6467f2" fillOpacity="0.2"/>
      <circle cx="105" cy="90" r="16" fill="#10b981" fillOpacity="0.2"/>
      <circle cx="145" cy="90" r="16" fill="#8b5cf6" fillOpacity="0.2"/>
      <circle cx="65"  cy="90" r="8"  fill="#6467f2"/>
      <circle cx="105" cy="90" r="8"  fill="#10b981"/>
      <circle cx="145" cy="90" r="8"  fill="#8b5cf6"/>
      <line x1="50" y1="118" x2="80"  y2="118" stroke="#6467f2" strokeWidth="2" strokeLinecap="round"/>
      <line x1="90" y1="118" x2="120" y2="118" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
      <line x1="130" y1="118" x2="160" y2="118" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    // 2: Work Hours — clock
    <svg key={2} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <circle cx="100" cy="80" r="52" fill="#6467f2" fillOpacity="0.08" stroke="#6467f2" strokeWidth="2" strokeOpacity="0.25"/>
      <circle cx="100" cy="80" r="4" fill="#6467f2"/>
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = (i * 30 - 90) * Math.PI / 180
        return <line key={i} x1={100 + 42*Math.cos(a)} y1={80 + 42*Math.sin(a)} x2={100 + 48*Math.cos(a)} y2={80 + 48*Math.sin(a)} stroke="#6467f2" strokeWidth={i%3===0?2.5:1} strokeLinecap="round"/>
      })}
      <line x1="100" y1="80" x2="100" y2="47" stroke="#6467f2" strokeWidth="3" strokeLinecap="round"/>
      <line x1="100" y1="80" x2="122" y2="80" stroke="#10b981" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="148" cy="42" r="10" fill="#10b981" fillOpacity="0.2"/>
      <circle cx="52"  cy="122" r="7" fill="#f59e0b" fillOpacity="0.3"/>
    </svg>,
    // 3: Wake Up — sun
    <svg key={3} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <circle cx="100" cy="72" r="26" fill="#f59e0b" fillOpacity="0.9"/>
      {[0,45,90,135,180,225,270,315].map(i => {
        const a = i * Math.PI / 180
        return <line key={i} x1={100+33*Math.cos(a)} y1={72+33*Math.sin(a)} x2={100+44*Math.cos(a)} y2={72+44*Math.sin(a)} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
      })}
      <path d="M28 118 Q100 88 172 118" stroke="#6467f2" strokeWidth="2" fill="none" strokeOpacity="0.4"/>
      <circle cx="42"  cy="38"  r="5" fill="#8b5cf6" fillOpacity="0.5"/>
      <circle cx="162" cy="33"  r="3" fill="#6467f2" fillOpacity="0.5"/>
      <circle cx="157" cy="112" r="6" fill="#10b981" fillOpacity="0.4"/>
    </svg>,
    // 4: Days Off — wave / beach
    <svg key={4} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <rect x="18" y="104" width="164" height="38" rx="8" fill="#10b981" fillOpacity="0.2"/>
      <circle cx="100" cy="68" r="28" fill="#f59e0b" fillOpacity="0.3"/>
      <line x1="100" y1="40" x2="100" y2="104" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M100 52 Q118 47 114 63 Q100 58 100 52Z" fill="#6467f2" fillOpacity="0.7"/>
      <path d="M100 52 Q82 47 86 63 Q100 58 100 52Z" fill="#6467f2" fillOpacity="0.5"/>
      <circle cx="48"  cy="116" r="7" fill="#6467f2" fillOpacity="0.3"/>
      <circle cx="152" cy="116" r="5" fill="#10b981" fillOpacity="0.3"/>
    </svg>,
    // 5: Summary — checkmark
    <svg key={5} viewBox="0 0 200 160" fill="none" className="w-full h-full">
      <circle cx="100" cy="78" r="50" fill="#10b981" fillOpacity="0.1"/>
      <circle cx="100" cy="78" r="50" fill="none" stroke="#10b981" strokeWidth="3" strokeOpacity="0.4" strokeDasharray="12 6"/>
      <path d="M70 78 L90 98 L132 56" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="42"  cy="34"  r="6" fill="#f59e0b" fillOpacity="0.6"/>
      <circle cx="160" cy="38"  r="4" fill="#8b5cf6" fillOpacity="0.6"/>
      <circle cx="156" cy="124" r="5" fill="#6467f2" fillOpacity="0.5"/>
      <circle cx="38"  cy="122" r="3" fill="#10b981" fillOpacity="0.5"/>
    </svg>,
  ]
  return illustrations[step] || null
}

function OnboardingTimePicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [h, m] = value.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hours24 = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
  const setHour = (hr) => onChange(fmt2(hr) + ':' + fmt2(m))
  const setMin  = (mn) => onChange(fmt2(h) + ':' + fmt2(mn))
  const toggleAmPm = () => onChange(fmt2(h >= 12 ? h - 12 : h + 12) + ':' + fmt2(m))

  return (
    <div>
      <label className="block text-sm font-semibold mb-3">{label}</label>
      <button onClick={() => setOpen(!open)}
        className={'w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ' +
          (open ? 'border-primary bg-primary/5 shadow-lg' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-primary/50')}>
        <div className="flex items-center gap-3">
          <div className={'w-8 h-8 rounded-lg flex items-center justify-center ' + (open ? 'bg-primary text-white' : 'bg-primary/10 text-primary')}>
            <span className="material-symbols-outlined text-sm">schedule</span>
          </div>
          <span className={'text-2xl font-black ' + (open ? 'text-primary' : '')}>{fmtTime(value)}</span>
        </div>
        <span className={'material-symbols-outlined transition-transform ' + (open ? 'rotate-180 text-primary' : 'text-slate-400')}>expand_more</span>
      </button>

      {open && (
        <div className="mt-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-xl">
          <div className="flex justify-center mb-3">
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['AM', 'PM'].map(p => (
                <button key={p} onClick={() => { if ((p === 'PM') !== (h >= 12)) toggleAmPm() }}
                  className={'px-6 py-1.5 rounded-lg text-sm font-black transition-all ' + (ampm === p ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-primary')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-1">Hour</p>
              <div className="h-40 overflow-y-auto scrollbar-hide rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                {hours24.filter(hr => ampm === 'AM' ? hr < 12 : hr >= 12).map(hr => {
                  const hr12 = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr
                  return (
                    <button key={hr} onClick={() => setHour(hr)}
                      className={'w-full py-2 text-sm font-bold transition-all ' + (hr === h ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary')}>
                      {fmt2(hr12)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-1">Minute</p>
              <div className="h-40 overflow-y-auto scrollbar-hide rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                {minutes.map(mn => (
                  <button key={mn} onClick={() => setMin(mn)}
                    className={'w-full py-2 text-sm font-bold transition-all ' + (mn === m ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary')}>
                    :{fmt2(mn)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="mt-3 w-full py-2 rounded-xl bg-primary/10 text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all">
            Confirm {fmtTime(value)}
          </button>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  const { navigate, setOnboardingData, login, user } = useApp()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    goal: '', activities: [],
    workStart: '09:00', workEnd: '17:00',
    wakeUp: '07:00',
    daysOff: ['Saturday', 'Sunday'],
  })
  const [finishing, setFinishing] = useState(false)

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  const toggleActivity = (id) => setData(d => ({
    ...d, activities: d.activities.includes(id)
      ? d.activities.filter(a => a !== id)
      : [...d.activities, id]
  }))

  const toggleDay = (day) => setData(d => ({
    ...d, daysOff: d.daysOff.includes(day)
      ? d.daysOff.filter(x => x !== day)
      : [...d.daysOff, day]
  }))

  const finish = () => {
    setFinishing(true)
    setOnboardingData(data)
    // Login as guest if not already logged in — prevents white screen
    login(user?.name || 'New User', user?.email || 'user@weekflow.app')
    setTimeout(() => navigate('dashboard'), 2000)
  }

  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const DAYS_FULL  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-sm">dashboard_customize</span>
          </div>
          <h2 className="text-xl font-bold">WeekFlow</h2>
        </div>
        <button onClick={() => navigate('landing')} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">close</span>
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left illustration panel — desktop only */}
        <aside className="hidden lg:flex w-72 xl:w-80 flex-col items-center justify-center p-10 bg-gradient-to-b from-primary/5 to-purple-500/5 border-r border-primary/10 shrink-0">
          <div className="w-48 h-36 mb-8">
            <StepIllustration step={step} />
          </div>
          <div className="w-full space-y-2">
            {STEPS.map((s, i) => (
              <div key={s} className={'flex items-center gap-3 px-3 py-2 rounded-xl transition-all ' + (i === step ? 'bg-primary/10' : '')}>
                <div className={'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ' +
                  (i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400')}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={'text-sm font-semibold ' +
                  (i === step ? 'text-primary' : i < step ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400')}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* Right form area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-10">
            {/* Progress bar (mobile) */}
            <div className="lg:hidden mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-primary uppercase tracking-wider text-xs">{STEPS[step]}</span>
                <span className="text-slate-400 text-xs">Step {step + 1} of {STEPS.length} · {pct}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
              </div>
            </div>

            {/* STEP 0: Goal */}
            {step === 0 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">What's your main goal?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">We'll tailor your schedule based on your focus.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {GOALS.map(g => (
                    <button key={g.id} onClick={() => setData(d => ({ ...d, goal: g.id }))}
                      className={'relative flex flex-col p-6 rounded-xl border-2 text-left transition-all ' +
                        (data.goal === g.id ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50')}>
                      <div className={'mb-4 w-12 h-12 rounded-lg flex items-center justify-center ' +
                        (data.goal === g.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary')}>
                        <span className="material-symbols-outlined text-2xl">{g.icon}</span>
                      </div>
                      <h3 className="text-lg font-bold mb-1">{g.title}</h3>
                      <p className="text-slate-500 text-sm">{g.desc}</p>
                      {data.goal === g.id && (
                        <span className="absolute top-4 right-4 material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 1: Activities */}
            {step === 1 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">What activities do you track?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">Select all that apply to your weekly routine.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ACTIVITIES.map(a => (
                    <button key={a.id} onClick={() => toggleActivity(a.id)}
                      className={'flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ' +
                        (data.activities.includes(a.id) ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50')}>
                      <span className={'material-symbols-outlined text-3xl ' + (data.activities.includes(a.id) ? 'text-primary' : 'text-slate-400')}>{a.icon}</span>
                      <span className={'text-sm font-bold ' + (data.activities.includes(a.id) ? 'text-primary' : 'text-slate-600 dark:text-slate-400')}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 2: Work Hours */}
            {step === 2 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">When do you usually work?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">We'll block these hours automatically in your planner.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <OnboardingTimePicker label="Work starts at" value={data.workStart} onChange={v => setData(d => ({ ...d, workStart: v }))} />
                    <OnboardingTimePicker label="Work ends at"   value={data.workEnd}   onChange={v => setData(d => ({ ...d, workEnd: v }))} />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                    <p className="text-sm text-primary font-medium">
                      Focus hours: <strong>{fmtTime(data.workStart)}</strong> – <strong>{fmtTime(data.workEnd)}</strong>
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3: Wake Up */}
            {step === 3 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">What time do you wake up?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">We'll schedule morning routines around your wake-up time.</p>
                </div>
                <div className="max-w-sm mx-auto bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                  <OnboardingTimePicker label="Wake up at" value={data.wakeUp} onChange={v => setData(d => ({ ...d, wakeUp: v }))} />
                  <p className="text-slate-500 text-center text-sm mt-4">
                    Your morning routine starts at <span className="font-bold text-primary">{fmtTime(data.wakeUp)}</span>.
                  </p>
                </div>
              </section>
            )}

            {/* STEP 4: Days Off */}
            {step === 4 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Which days are your rest days?</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">We'll schedule lighter activities on these days.</p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                  {DAYS_FULL.map((day, i) => (
                    <button key={day} onClick={() => toggleDay(day)}
                      className={'flex flex-col items-center gap-2 w-24 py-5 rounded-2xl border-2 transition-all ' +
                        (data.daysOff.includes(day) ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-primary/50')}>
                      <span className="text-xs font-bold uppercase tracking-wider">{DAYS_SHORT[i]}</span>
                      {data.daysOff.includes(day) && <span className="material-symbols-outlined text-primary text-sm">hotel</span>}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 5: Summary */}
            {step === 5 && (
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your WeekFlow is ready!</h1>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">Here's a summary of your personalized setup.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: 'flag',     label: 'Main Goal',   value: GOALS.find(g => g.id === data.goal)?.title || 'Not set' },
                    { icon: 'schedule', label: 'Work Hours',  value: fmtTime(data.workStart) + ' – ' + fmtTime(data.workEnd) },
                    { icon: 'alarm',    label: 'Wake Up',     value: fmtTime(data.wakeUp) },
                    { icon: 'hotel',    label: 'Rest Days',   value: data.daysOff.length ? data.daysOff.map(d => d.slice(0, 3)).join(', ') : 'None' },
                    { icon: 'category', label: 'Activities',  value: data.activities.length + ' selected' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-4 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                        <p className="text-base font-bold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation */}
            {(() => {
              // Per-step validation — what's required to proceed
              const canProceed = (() => {
                switch(step) {
                  case 0: return data.goal !== ''                     // must pick a goal
                  case 1: return data.activities.length >= 1         // must pick at least 1 activity
                  case 2: return data.workStart && data.workEnd      // times always set
                  case 3: return data.wakeUp                         // always set
                  case 4: return true                                  // days off optional
                  case 5: return true                                  // summary — always ok
                  default: return true
                }
              })()

              const missingMsg = (() => {
                switch(step) {
                  case 0: return 'Please choose a goal to continue'
                  case 1: return 'Please select at least one activity'
                  default: return ''
                }
              })()

              return (
                <div className="flex flex-col gap-3 mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                  {!canProceed && missingMsg && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm font-medium">
                      <span className="material-symbols-outlined text-sm">info</span>
                      {missingMsg}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('login')}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined">arrow_back</span>
                      {step === 0 ? 'Back' : 'Previous'}
                    </button>

                    {step < STEPS.length - 1 ? (
                      <button
                        onClick={() => canProceed && setStep(s => s + 1)}
                        disabled={!canProceed}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                          canProceed
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90 cursor-pointer'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}>
                        Continue
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </button>
                    ) : (
                      <button onClick={finish} disabled={finishing}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:opacity-90 transition-all disabled:opacity-70">
                        {finishing
                          ? <><span className="animate-spin material-symbols-outlined">refresh</span> Setting up...</>
                          : <>Let's go! <span className="material-symbols-outlined">rocket_launch</span></>
                        }
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        </main>
      </div>
    </div>
  )
}
