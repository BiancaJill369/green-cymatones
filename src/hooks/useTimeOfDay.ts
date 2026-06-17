import { useEffect, useState } from 'react'

// Five sky phases driven by the user's LOCAL device time.
export type TimeOfDay = 'dawn' | 'day' | 'noon' | 'dusk' | 'night'

// dawn 05–08 · day 08–11 · noon 11–16 · dusk 16–20 · night 20–05 (local hour)
export function computePhase(date = new Date()): TimeOfDay {
  const h = date.getHours()
  if (h >= 20 || h < 5) return 'night'
  if (h < 8) return 'dawn'
  if (h < 11) return 'day'
  if (h < 16) return 'noon'
  return 'dusk'
}

// Decimal hours (e.g. 14.5 for 14:30), used for the sun/moon arc.
export function decimalHour(date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60
}

export function useTimeOfDay(): TimeOfDay {
  const [phase, setPhase] = useState<TimeOfDay>(() => computePhase())

  useEffect(() => {
    // re-evaluate every ~5 min so the sky transitions if the user lingers
    const id = setInterval(() => setPhase(computePhase()), 5 * 60_000)
    return () => clearInterval(id)
  }, [])

  return phase
}
