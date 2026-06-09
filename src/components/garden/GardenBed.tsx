import { useMemo } from 'react'
import type { GardenElement } from '../../stores/gardenStore'

interface Props {
  variant: 'herb' | 'meadow'
  label: string
  elements: GardenElement[]
  divider?: boolean
}

const FLOWER_COLORS = ['#ffd76b', '#ff8aa8', '#cdb0ff', '#ff8a5b', '#fff0a8']

export default function GardenBed({ variant, label, elements, divider }: Props) {
  // Placeholder low growth, generated client-side (herb = sprouts; meadow = sprouts + flowers).
  const sprouts = useMemo(() => {
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

      {sprouts.map((s, i) => (
        <div key={`s-${i}`} className="sprout" style={{ height: `${s.height}px`, animationDelay: s.delay }}>
          {s.flower && (
            <span className="flower" style={{ background: `radial-gradient(circle,#fff,${s.flower})` }} />
          )}
        </div>
      ))}

      {/* real planted low growth (none yet; kept inside the bed when it exists) */}
      {elements.map((el) => (
        <div key={el.id} className="sprout" style={{ height: `${30 + el.growth_stage * 12}px` }} />
      ))}

      {divider && <div className="divider" />}
    </div>
  )
}
