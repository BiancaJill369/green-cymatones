import { useMemo } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'
import SunMoon from './SunMoon'

export default function SkyBackground({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  // ~70 stars, counts/positions generated client-side (fade in at night via CSS).
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 85,
        delay: Math.random() * 3,
      })),
    [],
  )

  return (
    <div className="sky">
      <SunMoon timeOfDay={timeOfDay} />
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  )
}
