import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import { loadCircles } from '../utils/flowCircle'

const LS_POS = 'wf_widget_pos'
const LS_MIN = 'wf_widget_min'
const LS_LAST_SEEN = 'wf_last_seen'
const OFFLINE_MS = 2 * 60 * 60 * 1000 // 2 hours

// ── Status helpers ───────────────────────────────────────────────────────────
function getMemberStatus(member, tasks) {
  // Check offline: last seen > 2h ago
  const lastSeen = localStorage.getItem(LS_LAST_SEEN)
  if (member.id === 'self' && lastSeen) {
    // Current user is always online
  } else if (member.status === 'offline') {
    return 'offline'
  }

  const now = new Date()
  const today = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][now.getDay()]
  const todayTasks = tasks.filter(t => t.day === today)

  if (todayTasks.length === 0 || todayTasks.every(t => t.done)) {
    return 'free'
  }

  const hh = now.getHours()
  const hasPendingNow = todayTasks.some(t => {
    if (t.done) return false
    if (!t.time) return true
    const [th] = t.time.split(':').map(Number)
    return Math.abs(th - hh) <= 2
  })

  return hasPendingNow ? 'focus' : 'free'
}

const STATUS_CONFIG = {
  free:    { color: '#22c55e', label: 'Livre agora',  pulse: true },
  focus:   { color: '#3b82f6', label: 'Em foco',      pulse: true },
  offline: { color: '#64748b', label: 'Offline',      pulse: false },
}

// ── Widget ───────────────────────────────────────────────────────────────────
export default function FlowCircleWidget() {
  const { tasks, navigate } = useApp()

  const [circles, setCircles] = useState(() => loadCircles())
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [minimized, setMinimized] = useState(() => localStorage.getItem(LS_MIN) === '1')
  const [showDropdown, setShowDropdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Position
  const [pos, setPos] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_POS))
      if (saved?.x != null && saved?.y != null) return saved
    } catch {}
    return { x: window.innerWidth - 270, y: window.innerHeight - 400 }
  })

  const dragging = useRef(false)
  const dragMoved = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const widgetRef = useRef(null)

  // Refresh circles on interval
  useEffect(() => {
    const refresh = () => setCircles(loadCircles())
    const id = setInterval(refresh, 10000)
    return () => clearInterval(id)
  }, [])

  // Update last seen timestamp
  useEffect(() => {
    localStorage.setItem(LS_LAST_SEEN, Date.now().toString())
    const id = setInterval(() => {
      localStorage.setItem(LS_LAST_SEEN, Date.now().toString())
    }, 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Mount animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  // Persist minimized state
  useEffect(() => {
    localStorage.setItem(LS_MIN, minimized ? '1' : '0')
  }, [minimized])

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  const clamp = useCallback((x, y) => {
    const w = widgetRef.current?.offsetWidth || 240
    const h = widgetRef.current?.offsetHeight || 300
    return {
      x: Math.max(0, Math.min(window.innerWidth - w, x)),
      y: Math.max(0, Math.min(window.innerHeight - h, y)),
    }
  }, [])

  const onPointerDown = useCallback((e) => {
    dragging.current = true
    dragMoved.current = false
    const touch = e.touches?.[0] || e
    dragOffset.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      dragMoved.current = true
      const touch = e.touches?.[0] || e
      const newPos = clamp(
        touch.clientX - dragOffset.current.x,
        touch.clientY - dragOffset.current.y
      )
      setPos(newPos)
    }
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false
        setPos(p => { localStorage.setItem(LS_POS, JSON.stringify(p)); return p })
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [clamp])

  // ── Early return if no circles ─────────────────────────────────────────────
  if (!circles || circles.length === 0) return null

  const circle = circles[selectedIdx] || circles[0]
  const members = circle?.members || []
  const onlineCount = members.filter(m => m.status !== 'offline').length

  // ── Minimized bubble ───────────────────────────────────────────────────────
  if (minimized) {
    return (
      <div
        ref={widgetRef}
        className="fixed z-50"
        style={{
          left: pos.x,
          top: pos.y,
          transform: mounted ? 'scale(1)' : 'scale(0)',
          opacity: mounted ? 1 : 0,
          transition: dragging.current ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
          cursor: 'grab',
          touchAction: 'none',
        }}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
      >
        <button
          onClick={(e) => { if (!dragMoved.current) setMinimized(false) }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: '#6467f2',
            boxShadow: '0 4px 20px rgba(100,103,242,0.4)',
            animation: 'fcw-pulse 2s ease-in-out infinite',
          }}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>hub</span>
          {onlineCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0f0f1a]">
              {onlineCount}
            </span>
          )}
        </button>
        <style>{`
          @keyframes fcw-pulse {
            0%, 100% { box-shadow: 0 4px 20px rgba(100,103,242,0.4); }
            50% { box-shadow: 0 4px 30px rgba(100,103,242,0.7); }
          }
        `}</style>
      </div>
    )
  }

  // ── Expanded widget ────────────────────────────────────────────────────────
  return (
    <div
      ref={widgetRef}
      className="fixed z-50"
      style={{
        left: pos.x,
        top: pos.y,
        width: isMobile ? 220 : 240,
        transform: mounted ? 'scale(1)' : 'scale(0.8)',
        opacity: mounted ? 1 : 0,
        transition: dragging.current ? 'none' : 'transform 0.2s ease-out, opacity 0.2s ease-out',
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(15, 15, 26, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(100,103,242,0.3)',
          boxShadow: '0 8px 32px rgba(100,103,242,0.2)',
        }}
      >
        {/* Header — drag handle */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-700/40"
          style={{ cursor: 'grab', touchAction: 'none' }}
          onMouseDown={onPointerDown}
          onTouchStart={onPointerDown}
        >
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>hub</span>
          <span className="text-xs font-bold text-white flex-1 truncate">FlowCircle</span>

          <button onClick={() => setMinimized(true)} className="text-slate-500 hover:text-slate-300 transition-colors p-0.5">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
          </button>
          <button onClick={() => setMinimized(true)} className="text-slate-500 hover:text-slate-300 transition-colors p-0.5">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </button>
        </div>

        {/* Circle selector (if 2+) */}
        {circles.length > 1 && (
          <div className="relative px-3 py-1.5 border-b border-slate-700/30">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 w-full text-left"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: circle.color || '#6467f2' }} />
              <span className="text-[11px] text-slate-300 font-medium truncate flex-1">{circle.name}</span>
              <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 14 }}>expand_more</span>
            </button>
            {showDropdown && (
              <div className="absolute left-2 right-2 top-full mt-1 rounded-lg overflow-hidden z-10"
                style={{ background: 'rgba(22,22,37,0.98)', border: '1px solid rgba(100,103,242,0.2)' }}>
                {circles.map((c, i) => (
                  <button key={c.id} onClick={() => { setSelectedIdx(i); setShowDropdown(false) }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-left text-[11px] hover:bg-slate-700/30 transition-colors ${i === selectedIdx ? 'text-primary font-bold' : 'text-slate-400'}`}>
                    <span className="w-2 h-2 rounded-full" style={{ background: c.color || '#6467f2' }} />
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members list */}
        <div className="px-3 py-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {members.map((member, i) => {
            const status = getMemberStatus(member, tasks)
            const cfg = STATUS_CONFIG[status]
            return (
              <div key={member.id || i} className="flex items-center gap-2 py-1">
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: member.avatar || '#6467f2' }}
                >
                  {member.name?.[0]?.toUpperCase() || '?'}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white truncate">{member.name}</p>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: cfg.color,
                        animation: cfg.pulse ? 'fcw-dot 2s ease-in-out infinite' : 'none',
                      }}
                    />
                    <span className="text-[9px] text-slate-500">{cfg.label}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-slate-700/30 flex items-center justify-between">
          <span className="text-[10px] text-primary/70 font-medium">{onlineCount} membro{onlineCount !== 1 ? 's' : ''} online</span>
          <button
            onClick={() => navigate('flowcircle')}
            className="text-[10px] text-primary font-bold hover:text-primary/80 transition-colors flex items-center gap-0.5"
          >
            Abrir
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>arrow_forward</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fcw-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
