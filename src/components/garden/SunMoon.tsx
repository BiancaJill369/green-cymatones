import { useEffect, useState } from 'react'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'
import { decimalHour } from '../../hooks/useTimeOfDay'

// Horizontal % across the sky for the current orb.
function arcProgress(h: number, timeOfDay: TimeOfDay): number {
  if (timeOfDay === 'day') return ((h - 6) / 12) * 100 // 6→18
  const adjusted = h >= 18 ? h - 18 : h + 6 // 18→6 wraps midnight
  return (adjusted / 12) * 100
}

export default function SunMoon({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  // Re-read the clock each minute so the orb creeps across the sky.
  const [h, setH] = useState(() => decimalHour())
  useEffect(() => {
    const id = setInterval(() => setH(decimalHour()), 60_000)
    return () => clearInterval(id)
  }, [])

  const progress = Math.min(100, Math.max(0, arcProgress(h, timeOfDay)))
  const left = progress
  // Parabolic arc: highest at midpoint, low near the horizon.
  const top = 78 - Math.sin((progress / 100) * Math.PI) * 58

  const isSun = timeOfDay === 'day'

  return (
    <div
      className={`garden-orb ${isSun ? 'garden-orb--sun' : 'garden-orb--moon'}`}
      style={{ left: `${left}%`, top: `${top}%` }}
      aria-hidden="true"
    />
  )
}
