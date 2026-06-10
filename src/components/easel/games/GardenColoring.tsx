import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { GameHandle } from '../gameTypes'

const LINE = '#2c3e2c'
const UNCOLORED = '#f6f6ef'
const PALETTE = [
  '#5ce08a', '#2c6b3f', '#4f7942', '#9dc183',
  '#ffd76b', '#e8c66a', '#caa46a', '#5a3b22',
  '#ff8aa8', '#cdb0ff', '#ff8a5b', '#e0392b',
  '#87ceeb', '#01796f', '#f4f9f0', UNCOLORED,
]

const GardenColoring = forwardRef<GameHandle>((_props, ref) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [fills, setFills] = useState<Record<string, string>>({})
  const [color, setColor] = useState(PALETTE[0])

  const fillOf = (id: string) => fills[id] ?? UNCOLORED
  const paint = (id: string) => setFills((f) => ({ ...f, [id]: color }))
  const reg = (id: string): { fill: string; stroke: string; strokeWidth: number; onClick: () => void; style: CSSProperties } => ({
    fill: fillOf(id),
    stroke: LINE,
    strokeWidth: 2,
    onClick: () => paint(id),
    style: { cursor: 'pointer' },
  })

  useImperativeHandle(ref, () => ({
    getState: () => fills,
    renderToCanvas: async (canvas) => {
      const svg = svgRef.current
      if (!svg) return
      const xml = new XMLSerializer().serializeToString(svg)
      const data = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)))
      await new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => {
          canvas.width = 400
          canvas.height = 400
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 400, 400)
            ctx.drawImage(img, 0, 0, 400, 400)
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = data
      })
    },
  }))

  // one flower = 5 petals (one region) + a center (another region) + stem
  const flower = (id: string, cx: number, cy: number) => {
    const petalFill = fillOf(`${id}_petals`)
    const petal = (dx: number, dy: number) => (
      <circle
        cx={cx + dx}
        cy={cy + dy}
        r={15}
        fill={petalFill}
        stroke={LINE}
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={() => paint(`${id}_petals`)}
      />
    )
    return (
      <g key={id}>
        <rect x={cx - 3} y={cy} width={6} height={120} rx={3} {...reg(`${id}_stem`)} />
        {petal(0, -17)}
        {petal(16, -5)}
        {petal(10, 14)}
        {petal(-10, 14)}
        {petal(-16, -5)}
        <circle cx={cx} cy={cy} r={10} {...reg(`${id}_center`)} />
      </g>
    )
  }

  return (
    <div className="coloring">
      <div className="palette" role="group" aria-label="Colors">
        {PALETTE.map((c) => (
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

      <svg
        ref={svgRef}
        className="coloring-canvas"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 400"
        width="400"
        height="400"
      >
        <rect x={0} y={0} width={400} height={400} {...reg('sky')} />
        <circle cx={70} cy={70} r={42} {...reg('sun')} />
        <rect x={0} y={300} width={400} height={100} {...reg('ground')} />
        {/* stems behind, pot in front */}
        {flower('f1', 130, 175)}
        {flower('f2', 200, 150)}
        {flower('f3', 270, 175)}
        {/* leaves */}
        <path d="M150 290 q-35 -8 -42 -34 q30 4 42 34 Z" {...reg('leaf1')} />
        <path d="M250 290 q35 -8 42 -34 q-30 4 -42 34 Z" {...reg('leaf2')} />
        {/* pot */}
        <path d="M120 300 L280 300 L262 372 L138 372 Z" {...reg('pot')} />
        <rect x={112} y={286} width={176} height={20} rx={6} {...reg('pot_rim')} />
      </svg>
    </div>
  )
})
GardenColoring.displayName = 'GardenColoring'
export default GardenColoring
