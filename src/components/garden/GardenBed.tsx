import { useMemo } from 'react'
import type { GardenElement as El } from '../../stores/gardenStore'
import GardenElement from './GardenElement'

interface Props {
  variant: 'herb' | 'meadow'
  label: string
  planted: El[]
  editMode: boolean
  selectedId: string | null
  onSelect: (el: El) => void
  onLongPress: (el: El) => void
  onMove: (id: string, x: number, y: number) => void
  divider?: boolean
}

const FLOWER_COLORS = ['#ffd76b', '#ff8aa8', '#cdb0ff', '#ff8a5b', '#fff0a8']

export default function GardenBed({
  variant,
  label,
  planted,
  editMode,
  selectedId,
  onSelect,
  onLongPress,
  onMove,
  divider,
}: Props) {
  // Ambient (placeholder) greenery for atmosphere — the real plants render on top.
  const ambient = useMemo(() => {
    const count = variant === 'herb' ? 16 : 18
    return Array.from({ length: count }, () => {
      const height = 20 + Math.random() * 46
      const delay = `${Math.random().toFixed(2)}s, ${(Math.random() * 2).toFixed(2)}s`
      const flower =
        variant === 'meadow' && Math.random() > 0.45
          ? FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)]
          : null
      return { height, delay, flower }
    })
  }, [variant])

  return (
    <div className={`bed ${variant}`}>
      <div className="bed-label">{label}</div>

      {ambient.map((s, i) => (
        <div key={`a-${i}`} className="sprout" style={{ height: `${s.height}px`, animationDelay: s.delay }}>
          {s.flower && (
            <span className="flower" style={{ background: `radial-gradient(circle,#fff,${s.flower})` }} />
          )}
        </div>
      ))}

      {planted.map((el) => (
        <GardenElement
          key={el.id}
          element={el}
          variant="low"
          editMode={editMode}
          selected={selectedId === el.id}
          onSelect={onSelect}
          onLongPress={onLongPress}
          onMove={onMove}
        />
      ))}

      {divider && <div className="divider" />}
    </div>
  )
}
