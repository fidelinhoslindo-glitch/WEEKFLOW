import { useState, useEffect } from 'react'

const VERSION = '2.5.0'

const STEPS = [
  { num: 1, label: 'Welcome' },
  { num: 2, label: 'License Agreement' },
  { num: 3, label: 'Destination' },
  { num: 4, label: 'Ready to Install' },
  { num: 5, label: 'Installing' },
  { num: 6, label: 'Finish' },
]

const LICENSE_TEXT = `WeekFlow - End User License Agreement

Copyright (c) 2026 WeekFlow. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to use the Software for personal and commercial purposes, subject to the following conditions:

1. You may not redistribute, sublicense, or sell copies of the Software.
2. You may not reverse engineer, decompile, or disassemble the Software.
3. The Software is provided "as is", without warranty of any kind.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

By installing WeekFlow, you agree to these terms.`

// WeekFlow logo SVG inline
function Logo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="#6467f2"/>
      <rect x="7" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="13" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="19" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="25" y="8" width="4" height="20" rx="2" fill="white"/>
    </svg>
  )
}

function SmallLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill="#6467f2"/>
      <rect x="7" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="13" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="19" y="8" width="4" height="20" rx="2" fill="white"/>
      <rect x="25" y="8" width="4" height="20" rx="2" fill="white"/>
    </svg>
  )
}

// ── Step content components ─────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Glowing logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-full scale-150" />
        <div className="relative">
          <Logo size={80} />
        </div>
      </div>

      <h2 className="text-3xl font-black text-white mb-3">
        Welcome to <span className="text-primary">WeekFlow</span> Setup
      </h2>
      <p className="text-slate-400 mb-1">
        This wizard will install WeekFlow v{VERSION} on your computer.
      </p>
      <p className="text-slate-500 text-sm mb-8">Your week, reimagined.</p>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 w-full max-w-md text-left space-y-3">
        {[
          'Smart Calendar that learns your habits',
          'AI scheduling via natural language',
          'FlowCircle social planning ecosystem',
          'Apple Watch-style focus timers',
          'Desktop shortcuts & Start Menu entry',
        ].map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-emerald-400 text-lg">✓</span>
            <span className="text-slate-300 text-sm">{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LicenseStep({ accepted, setAccepted }) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-black text-white mb-2">License Agreement</h2>
      <p className="text-slate-400 text-sm mb-5">Please read the following license agreement carefully.</p>

      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 mb-5 flex-1 overflow-y-auto max-h-64 custom-scrollbar">
        <pre className="text-slate-400 text-xs whitespace-pre-wrap font-mono leading-relaxed">{LICENSE_TEXT}</pre>
      </div>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div
          onClick={() => setAccepted(!accepted)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${accepted ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-primary/50'}`}
        >
          {accepted && <span className="text-white text-xs font-black">✓</span>}
        </div>
        <span className="text-slate-300 text-sm">I accept the terms of the License Agreement</span>
      </label>
    </div>
  )
}

function DestinationStep({ path, setPath }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Choose Install Location</h2>
      <p className="text-slate-400 text-sm mb-8">
        WeekFlow will be installed in the following folder. Click Browse to choose a different location.
      </p>

      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-4 mb-4">
        <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 block">Destination Folder</label>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 text-sm font-mono">
            {path}
          </div>
          <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold rounded-lg transition-colors">
            Browse
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="text-primary">ℹ</span>
        <span>Required space: ~250 MB</span>
      </div>
    </div>
  )
}

function ReadyStep({ path }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-2">Ready to Install</h2>
      <p className="text-slate-400 text-sm mb-8">
        WeekFlow is ready to be installed. Click Install to begin.
      </p>

      <div className="space-y-3">
        {[
          { label: 'App', value: `WeekFlow v${VERSION}` },
          { label: 'Location', value: path },
          { label: 'Shortcuts', value: 'Desktop & Start Menu' },
          { label: 'Size', value: '~250 MB' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/30 rounded-xl px-4 py-3">
            <span className="text-slate-500 text-sm">{item.label}</span>
            <span className="text-white text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InstallingStep({ progress }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-2xl font-black text-white mb-2">Installing WeekFlow</h2>
      <p className="text-slate-400 text-sm mb-10">Please wait while WeekFlow is being installed...</p>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-4">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-500">
            {progress < 30 ? 'Extracting files...' :
             progress < 60 ? 'Installing components...' :
             progress < 85 ? 'Creating shortcuts...' :
             'Finalizing...'}
          </span>
          <span className="text-xs text-primary font-bold">{progress}%</span>
        </div>
      </div>

      {/* File animation */}
      <div className="mt-6 bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-2 text-xs text-slate-600 font-mono max-w-md w-full text-left truncate">
        {progress < 20 ? 'C:\\...\\WeekFlow\\resources\\app.asar' :
         progress < 40 ? 'C:\\...\\WeekFlow\\electron.exe' :
         progress < 60 ? 'C:\\...\\WeekFlow\\resources\\dist\\index.html' :
         progress < 80 ? 'C:\\Desktop\\WeekFlow.lnk' :
         'C:\\Start Menu\\WeekFlow\\WeekFlow.lnk'}
      </div>
    </div>
  )
}

function FinishStep() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Success animation */}
      <div className="relative mb-8">
        <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full scale-150" />
        <div className="relative w-20 h-20 bg-emerald-500/10 border-2 border-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-emerald-400 text-4xl">✓</span>
        </div>
      </div>

      <h2 className="text-3xl font-black text-white mb-3">
        Setup <span className="text-emerald-400">Complete!</span>
      </h2>
      <p className="text-slate-400 mb-2">
        WeekFlow v{VERSION} has been successfully installed on your computer.
      </p>
      <p className="text-slate-500 text-sm mb-8">Click Finish to start using WeekFlow.</p>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 w-full max-w-sm space-y-3">
        {[
          { icon: '🖥', text: 'Desktop shortcut created' },
          { icon: '📁', text: 'Start Menu entry added' },
          { icon: '🔔', text: 'System tray enabled' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-lg">{item.icon}</span>
            <span className="text-slate-300 text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Setup Wizard ───────────────────────────────────────────────────────

export default function SetupWizard({ onFinish }) {
  const [step, setStep] = useState(1)
  const [accepted, setAccepted] = useState(false)
  const [installPath] = useState('C:\\Users\\' + (window.electron?.platform === 'win32' ? 'User' : 'user') + '\\AppData\\Local\\Programs\\WeekFlow')
  const [progress, setProgress] = useState(0)

  // Simulate installation progress
  useEffect(() => {
    if (step !== 5) return
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep(6), 500)
          return 100
        }
        return prev + Math.random() * 8 + 2
      })
    }, 200)
    return () => clearInterval(interval)
  }, [step])

  const canNext = () => {
    if (step === 2 && !accepted) return false
    if (step === 5) return false // installing
    if (step === 6) return true
    return true
  }

  const handleNext = () => {
    if (step === 6) {
      localStorage.setItem('wf_setup_done', '1')
      onFinish()
      return
    }
    if (step < 6) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1 && step !== 5 && step !== 6) setStep(step - 1)
  }

  const handleCancel = () => {
    if (step === 6) {
      localStorage.setItem('wf_setup_done', '1')
      onFinish()
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0c0e1a] flex flex-col text-slate-100 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#12152a] border-b border-slate-800">
        <div className="flex items-center gap-3">
          <SmallLogo />
          <div>
            <p className="text-white font-black text-sm">WeekFlow</p>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest">Setup v{VERSION}</p>
          </div>
        </div>
        <div className="px-3 py-1 border border-slate-700 rounded-lg text-xs text-slate-400 font-bold">
          STEP {step} OF {STEPS.length}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 bg-[#0f1225] border-r border-slate-800 p-5 flex flex-col">
          <div className="flex items-center gap-2.5 mb-8">
            <SmallLogo />
            <span className="font-black text-sm text-primary">WeekFlow</span>
          </div>

          <div className="space-y-1 flex-1">
            {STEPS.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  s.num === step
                    ? 'bg-primary/10 border border-primary/30'
                    : s.num < step
                    ? 'opacity-60'
                    : 'opacity-40'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  s.num === step
                    ? 'bg-primary text-white'
                    : s.num < step
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-600 border border-slate-700'
                }`}>
                  {s.num < step ? '✓' : s.num}
                </div>
                <span className={`text-sm ${s.num === step ? 'text-white font-bold' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          {/* Secure install badge */}
          <div className="mt-auto pt-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">Secure Install</span>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 p-10 overflow-y-auto flex items-center justify-center">
          <div className="w-full max-w-lg">
            {step === 1 && <WelcomeStep />}
            {step === 2 && <LicenseStep accepted={accepted} setAccepted={setAccepted} />}
            {step === 3 && <DestinationStep path={installPath} />}
            {step === 4 && <ReadyStep path={installPath} />}
            {step === 5 && <InstallingStep progress={Math.min(100, Math.round(progress))} />}
            {step === 6 && <FinishStep />}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-5 py-4 bg-[#12152a] border-t border-slate-800">
        <p className="text-slate-600 text-xs">WeekFlow v{VERSION}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            disabled={step <= 1 || step >= 5}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 disabled:opacity-30 hover:text-slate-300 transition-colors disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              step === 6
                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                : step === 4
                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
                : 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20'
            }`}
          >
            {step === 4 ? 'Install' : step === 6 ? 'Finish ✓' : 'Next →'}
          </button>
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-300 border border-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
