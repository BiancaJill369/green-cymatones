import { useMemo } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'

// Spread n items across a horizontal range and a top band (no Math.random).
function spread(n: number, seed: number, topMin: number, topMax: number) {
  const range = Math.max(1, topMax - topMin)
  return Array.from({ length: n }, (_, i) => ({
    left: ((i * 37 + seed * 13) % 90) + 5,
    top: topMin + ((i * 53 + seed * 7) % range),
    delay: (i % 6) * 1.1,
    dur: 12 + (i % 7) * 2,
  }))
}

export default function Creatures({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  // Butterflies drift across sky + forest; ladybugs stay over the foreground beds.
  const butterflies = useMemo(() => spread(5, 1, 8, 60), [])
  const ladybugs = useMemo(() => spread(2, 2, 74, 90), [])
  // Fireflies hover across the forest band and lower sky.
  const fireflies = useMemo(() => spread(26, 3, 34, 74), [])

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
