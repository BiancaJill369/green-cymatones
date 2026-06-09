import { useMemo } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'

// Deterministic-ish star field (varies by index so it doesn't need Math.random).
function buildStars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const x = (i * 47) % 100
    const y = (i * 29) % 55 // keep stars in the upper sky band
    const delay = (i % 8) * 0.5
    return { x, y, delay }
  })
}

export default function SkyBackground({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const stars = useMemo(() => buildStars(60), [])

  return (
    <div className={`garden-sky garden-sky--${timeOfDay}`}>
      <div className="garden-stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="garden-star"
            style={{ left: `${s.x}%`, top: `${s.y}%`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>
    </div>
  )
}
