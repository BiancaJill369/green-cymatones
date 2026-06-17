import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GameHandle } from '../gameTypes'

const SIZE = 360
const SAND = '#e8dcc0'
const GROOVE = '#cbb98f'
const HILITE = '#f3ead0'
const SPACING = 7
const TEETH_OPTIONS = [3, 5, 7]

interface Pt {
  x: number
  y: number
}

const ZenGarden = forwardRef<GameHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [teeth, setTeeth] = useState(5)
  const [stoneMode, setStoneMode] = useState(false)
  const drawing = useRef(false)
  const moved = useRef(false)
  const last = useRef<Pt | null>(null)
  const start = useRef<Pt | null>(null)

  const fillSand = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = SAND
    ctx.fillRect(0, 0, SIZE, SIZE)
    // faint grain
    for (let i = 0; i < 1600; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.06)'
      ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 1, 1)
    }
  }
  useEffect(fillSand, [])

  const pt = (e: ReactPointerEvent<HTMLCanvasElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) }
  }

  // rake: parallel grooves offset perpendicular to the drag direction
  const rake = (p0: Pt, p1: Pt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const dx = p1.x - p0.x
    const dy = p1.y - p0.y
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len
    const py = dx / len
    const mid = (teeth - 1) / 2
    ctx.lineCap = 'round'
    for (let i = 0; i < teeth; i++) {
      const off = (i - mid) * SPACING
      // lighter highlight just above the groove
      ctx.strokeStyle = HILITE
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(p0.x + px * (off - 1.6), p0.y + py * (off - 1.6))
      ctx.lineTo(p1.x + px * (off - 1.6), p1.y + py * (off - 1.6))
      ctx.stroke()
      // darker groove
      ctx.strokeStyle = GROOVE
      ctx.lineWidth = 2.4
      ctx.beginPath()
      ctx.moveTo(p0.x + px * off, p0.y + py * off)
      ctx.lineTo(p1.x + px * off, p1.y + py * off)
      ctx.stroke()
    }
  }

  const placeStone = (p: Pt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.save()
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.ellipse(p.x + 2, p.y + 5, 20, 12, 0, 0, Math.PI * 2)
    ctx.fill()
    const g = ctx.createRadialGradient(p.x - 5, p.y - 5, 4, p.x, p.y, 22)
    g.addColorStop(0, '#cfcabf')
    g.addColorStop(1, '#9a948a')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(p.x, p.y, 20, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    moved.current = false
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
    const p = pt(e)
    start.current = p
    last.current = p
  }
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return
    const p = pt(e)
    if (Math.hypot(p.x - last.current.x, p.y - last.current.y) > 1.2) {
      moved.current = true
      rake(last.current, p)
      last.current = p
    }
  }
  const onUp = () => {
    if (drawing.current && !moved.current && stoneMode && start.current) {
      placeStone(start.current)
    }
    drawing.current = false
    last.current = null
    start.current = null
  }

  useImperativeHandle(ref, () => ({
    getState: () => null,
    renderToCanvas: async (out) => {
      const c = canvasRef.current
      if (!c) return
      out.width = SIZE
      out.height = SIZE
      const ctx = out.getContext('2d')
      if (ctx) ctx.drawImage(c, 0, 0)
    },
  }))

  return (
    <div className="art-game">
      <div className="easel-controls">
        {TEETH_OPTIONS.map((t) => (
          <button key={t} type="button" className={`ctrl-btn${teeth === t ? ' active' : ''}`} onClick={() => setTeeth(t)}>
            {t} teeth
          </button>
        ))}
        <button
          type="button"
          className={`ctrl-btn${stoneMode ? ' active' : ''}`}
          onClick={() => setStoneMode((v) => !v)}
        >
          🪨 Place stones
        </button>
        <button type="button" className="ctrl-btn" onClick={fillSand}>
          Smooth sand
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="art-canvas"
        width={SIZE}
        height={SIZE}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    </div>
  )
})
ZenGarden.displayName = 'ZenGarden'
export default ZenGarden
