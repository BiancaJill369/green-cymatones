import { useRef } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { GardenElement as El } from '../../stores/gardenStore'

// forest tree ramp per stage: 0 mound → 5 full canopy
const TREE = [
  { h: 22, cw: 20, ch: 20, trunk: 0 },
  { h: 40, cw: 26, ch: 26, trunk: 0 },
  { h: 76, cw: 42, ch: 44, trunk: 24 },
  { h: 116, cw: 60, ch: 64, trunk: 40 },
  { h: 156, cw: 76, ch: 82, trunk: 56 },
  { h: 204, cw: 98, ch: 104, trunk: 72 },
]
const LOW_H = [0, 18, 30, 42, 50, 58]

interface Props {
  element: El
  variant: 'forest' | 'low'
  editMode: boolean
  selected: boolean
  onSelect: (el: El) => void
  onLongPress: (el: El) => void
  onMove: (id: string, x: number, y: number) => void
}

export default function GardenElement({
  element,
  variant,
  editMode,
  selected,
  onSelect,
  onLongPress,
  onMove,
}: Props) {
  const stage = Math.max(0, Math.min(5, element.growth_stage))
  const movable = element.is_movable !== false

  const bedRef = useRef<HTMLElement | null>(null)
  const dragging = useRef(false)
  const moved = useRef(false)
  const lpTimer = useRef<number | null>(null)

  const clearLongPress = () => {
    if (lpTimer.current !== null) {
      clearTimeout(lpTimer.current)
      lpTimer.current = null
    }
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    moved.current = false
    if (!editMode) {
      // long-press anywhere enters edit mode and selects this plant
      lpTimer.current = window.setTimeout(() => onLongPress(element), 500)
      return
    }
    if (!movable) return
    onSelect(element)
    bedRef.current = e.currentTarget.closest('.bed') ?? e.currentTarget.closest('.forest')
    dragging.current = true
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* no-op */
    }
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (lpTimer.current !== null) clearLongPress() // any movement cancels long-press
    if (!dragging.current || !bedRef.current) return
    moved.current = true
    const rect = bedRef.current.getBoundingClientRect()
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.min(100, Math.max(0, ((rect.bottom - e.clientY) / rect.height) * 100))
    onMove(element.id, x, y)
  }

  const handlePointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    clearLongPress()
    if (dragging.current) {
      dragging.current = false
      try {
        e.currentTarget.releasePointerCapture(e.pointerId)
      } catch {
        /* no-op */
      }
    }
  }

  const handleClick = () => {
    if (!moved.current) onSelect(element) // tap (not a drag) selects
  }

  const wrapperStyle = {
    left: `${element.position_x}%`,
    bottom: `${element.position_y}%`,
    transform: `translateX(-50%) scale(${element.scale}) rotate(${element.rotation}deg)`,
  }

  const className = `g-el g-${variant === 'forest' ? 'tree' : 'low'}${selected ? ' g-selected' : ''}`

  const inner =
    variant === 'forest' ? (
      (() => {
        const t = TREE[stage]
        return (
          <>
            <span className="gt-canopy" style={{ width: `${t.cw}px`, height: `${t.ch}px` }} />
            {t.trunk > 0 && <span className="gt-trunk" style={{ height: `${t.trunk}px` }} />}
          </>
        )
      })()
    ) : stage === 0 ? (
      <span className="g-seed" />
    ) : (
      <span className="sprout" style={{ height: `${LOW_H[stage]}px` }}>
        {stage >= 5 && (
          <span className="flower" style={{ background: 'radial-gradient(circle,#fff,#ffd76b)' }} />
        )}
        {stage === 4 && (
          <span className="flower" style={{ width: '8px', height: '8px', background: '#cdb0ff' }} />
        )}
      </span>
    )

  return (
    <button
      type="button"
      className={className}
      style={wrapperStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      aria-label="planted element"
    >
      {inner}
    </button>
  )
}
