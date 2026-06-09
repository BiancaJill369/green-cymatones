import { useMemo } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'

// Spread n items across the sky band using index-based positions (no Math.random).
function spread(n: number, seed: number, topMax: number) {
  return Array.from({ length: n }, (_, i) => ({
    left: ((i * 37 + seed * 13) % 90) + 5,
    top: ((i * 53 + seed * 7) % topMax) + 5,
    delay: (i % 6) * 1.1,
    dur: 12 + (i % 7) * 2,
  }))
}

export default function Creatures({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const butterflies = useMemo(() => spread(5, 1, 45), [])
  const ladybugs = useMemo(() => spread(2, 2, 35), [])
  const fireflies = useMemo(() => spread(26, 3, 60), [])

  if (timeOfDay === 'day') {
    return (
      <div aria-hidden="true">
        {butterflies.map((b, i) => (
          <span
            key={`bf-${i}`}
            className="garden-butterfly"
            style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s` }}
          />
        ))}
        {ladybugs.map((l, i) => (
          <span
            key={`lb-${i}`}
            className="garden-ladybug"
            style={{ left: `${l.left}%`, top: `${l.top}%`, animationDelay: `${l.delay}s` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div aria-hidden="true">
      {fireflies.map((f, i) => (
        <span
          key={`ff-${i}`}
          className="garden-firefly"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animationDelay: `${f.delay}s`,
            animationDuration: `2s, ${f.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
