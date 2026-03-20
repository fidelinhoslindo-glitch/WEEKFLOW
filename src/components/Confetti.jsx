import { useEffect, useRef } from 'react'

const COLORS = ['#6467f2','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']

function randomBetween(a, b) { return a + Math.random() * (b - a) }

export default function Confetti({ onDone }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 150 }, () => ({
      x:     randomBetween(0, canvas.width),
      y:     randomBetween(-200, -10),
      w:     randomBetween(8, 16),
      h:     randomBetween(4, 10),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot:   randomBetween(0, Math.PI * 2),
      vx:    randomBetween(-2, 2),
      vy:    randomBetween(3, 8),
      vr:    randomBetween(-0.1, 0.1),
      opacity: 1,
    }))

    let alive = true
    let frame = 0

    const draw = () => {
      if (!alive) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      let anyVisible = false
      pieces.forEach(p => {
        p.x  += p.vx
        p.y  += p.vy
        p.rot += p.vr
        if (frame > 100) p.opacity -= 0.012
        if (p.y < canvas.height + 20 && p.opacity > 0) anyVisible = true

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })

      if (!anyVisible && frame > 100) { alive = false; onDone?.(); return }
      requestAnimationFrame(draw)
    }
    draw()

    return () => { alive = false }
  }, [onDone])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}
