import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GameHandle } from '../gameTypes'

const SIZE = 360
const BG = '#07251a'
const COLORS = ['#5ce08a', '#ffd76b', '#ff8aa8', '#cdb0ff', '#87ceeb', '#ff8a5b', '#aef0a0', '#ffe9a8']
const BRUSHES = [
  { label: 'S', w: 2 },
  { label: 'M', w: 4 },
  { label: 'L', w: 7 },
]

interface Pt {
  x: number
  y: number
}

const MandalaBloom = forwardRef<GameHandle>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sym, setSym] = useState(8)
  const [color, setColor] = useState(COLORS[0])
  const [brush, setBrush] = useState(4)
  const drawing = useRef(false)
  const last = useRef<Pt | null>(null)

  const fillBg = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = BG
    ctx.fillRect(0, 0, SIZE, SIZE)
  }
  useEffect(fillBg, [])

  const pt = (e: ReactPointerEvent<HTMLCanvasElement>): Pt => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (SIZE / r.width), y: (e.clientY - r.top) * (SIZE / r.height) }
  }

  // stroke a segment, replicated rotationally + mirrored for kaleidoscope symmetry
  const drawSeg = (p0: Pt, p1: Pt) => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const cx = SIZE / 2
    const cy = SIZE / 2
    const rot = (p: Pt, a: number): Pt => {
      const dx = p.x - cx
      const dy = p.y - cy
      return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) }
    }
    const reflect = (p: Pt): Pt => ({ x: 2 * cx - p.x, y: p.y })
    const seg = (a: Pt, b: Pt) => {
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }
    ctx.save()
    ctx.globalCompositeOperation = 'lighter' // additive glow on the dark bg
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = color
    ctx.lineWidth = brush
    ctx.shadowColor = color
    ctx.shadowBlur = brush * 0.9
    for (let k = 0; k < sym; k++) {
      const a = (k * 2 * Math.PI) / sym
      seg(rot(p0, a), rot(p1, a))
      seg(rot(reflect(p0), a), rot(reflect(p1), a))
    }
    ctx.restore()
  }

  const onDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
    const p = pt(e)
    last.current = p
    drawSeg(p, { x: p.x + 0.1, y: p.y + 0.1 }) // dot on tap
  }
  const onMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return
    const p = pt(e)
    drawSeg(last.current, p)
    last.current = p
  }
  const onUp = () => {
    drawing.current = false
    last.current = null
  }

  useImperativeHandle(ref, () => ({
    getState: () => null,
    renderToCanvas: async (out) => {
      const c = canvasRef.current
      if (!c) return
      out.width = SIZE
      out.height = SIZE
      const ctx = out.getContext('2d')
      if (ctx) {
        ctx.fillStyle = BG
        ctx.fillRect(0, 0, SIZE, SIZE)
        ctx.drawImage(c, 0, 0)
      }
    },
  }))

  return (
    <div className="art-game">
      <div className="easel-controls">
        {[6, 8, 12].map((s) => (
          <button key={s} type="button" className={`ctrl-btn${sym === s ? ' active' : ''}`} onClick={() => setSym(s)}>
            {s}-fold
          </button>
        ))}
        {BRUSHES.map((b) => (
          <button key={b.label} type="button" className={`ctrl-btn${brush === b.w ? ' active' : ''}`} onClick={() => setBrush(b.w)}>
            {b.label}
          </button>
        ))}
        <button type="button" className="ctrl-btn" onClick={fillBg}>
          Clear
        </button>
      </div>
      <div className="palette" role="group" aria-label="Colors">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${color === c ? ' active' : ''}`}
            style={{ background: c }}
            aria-label={`color ${c}`}
            onClick={() => setColor(c)}
          />
        ))}
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
MandalaBloom.displayName = 'MandalaBloom'
export default MandalaBloom
