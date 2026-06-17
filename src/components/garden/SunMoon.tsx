import { useEffect, useState } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'
import { decimalHour } from '../../hooks/useTimeOfDay'

// Sun arcs across the daytime window (05→20); the moon across the night (20→05).
function sunProgress(h: number): number {
  return ((h - 5) / 15) * 100
}
function moonProgress(h: number): number {
  const adjusted = h >= 20 ? h - 20 : h + 4 // 20:00 → 05:00 wraps midnight (9h)
  return (adjusted / 9) * 100
}

export default function SunMoon({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const [h, setH] = useState(() => decimalHour())
  useEffect(() => {
    const id = setInterval(() => setH(decimalHour()), 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  const isSun = timeOfDay !== 'night'
  const progress = Math.min(100, Math.max(0, isSun ? sunProgress(h) : moonProgress(h)))
  const left = progress
  // parabolic arc within the sky band: high at midday/midnight, low near the horizon
  const top = 78 - Math.sin((progress / 100) * Math.PI) * 58

  return (
    <div
      className={isSun ? 'sun' : 'moon'}
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden="true"
    />
  )
}
