import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GameHandle } from '../gameTypes'

const N = 16
const PALETTE = [
  '#5ce08a', '#34d27e', '#2c6b3f', '#9dc183',
  '#ffd76b', '#e8c66a', '#ff8aa8', '#cdb0ff',
  '#ff8a5b', '#87ceeb', '#01796f', '#e0392b',
]

type Cell = string | null
const emptyGrid = (): Cell[][] => Array.from({ length: N }, () => Array.from({ length: N }, () => null))

const PixelMosaic = forwardRef<GameHandle>((_props, ref) => {
  const [grid, setGrid] = useState<Cell[][]>(emptyGrid)
  const [color, setColor] = useState(PALETTE[0])
  const [eraser, setEraser] = useState(false)
  const painting = useRef(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const paintAt = (clientX: number, clientY: number) => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
    if (!el || el.dataset.r === undefined || el.dataset.c === undefined) return
    const r = Number(el.dataset.r)
    const c = Number(el.dataset.c)
    setGrid((g) => {
      const next = g[r][c]
      const target = eraser ? null : color
      if (next === target) return g
      const ng = g.map((row) => row.slice())
      ng[r][c] = target
      return ng
    })
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    painting.current = true
    try {
      gridRef.current?.setPointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
    paintAt(e.clientX, e.clientY)
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (painting.current) paintAt(e.clientX, e.clientY)
  }
  const onUp = () => {
    painting.current = false
  }

  useImperativeHandle(ref, () => ({
    getState: () => grid,
    renderToCanvas: async (canvas) => {
      const cell = 20
      const gap = 2
      canvas.width = N * cell
      canvas.height = N * cell
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#0c3a25'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const col = grid[r][c]
          if (col) {
            ctx.fillStyle = col
            ctx.fillRect(c * cell + gap, r * cell + gap, cell - gap * 2, cell - gap * 2)
          }
        }
      }
    },
  }))

  return (
    <div className="mosaic">
      <div className="palette" role="group" aria-label="Colors">
        {PALETTE.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch${!eraser && color === c ? ' active' : ''}`}
            style={{ background: c }}
            aria-label={`color ${c}`}
            onClick={() => {
              setColor(c)
              setEraser(false)
            }}
          />
        ))}
        <button
          type="button"
          className={`swatch eraser${eraser ? ' active' : ''}`}
          aria-label="eraser"
          onClick={() => setEraser(true)}
        >
          ⌫
        </button>
      </div>

      <div
        ref={gridRef}
        className="mz-grid"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {grid.map((row, r) =>
          row.map((col, c) => (
            <div
              key={`${r}-${c}`}
              className="mz-cell"
              data-r={r}
              data-c={c}
              style={{ background: col ?? 'transparent' }}
            />
          )),
        )}
      </div>
    </div>
  )
})
PixelMosaic.displayName = 'PixelMosaic'
export default PixelMosaic
