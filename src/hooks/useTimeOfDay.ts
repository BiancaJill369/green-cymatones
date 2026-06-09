import { useEffect, useState } from 'react'

export type TimeOfDay = 'day' | 'night'

// Day runs 06:00–18:00 local time; night otherwise.
export function computeTimeOfDay(date = new Date()): TimeOfDay {
  const hour = date.getHours()
  return hour >= 6 && hour < 18 ? 'day' : 'night'
}

// Decimal hours (e.g. 14.5 for 14:30), used for the sun/moon arc.
export function decimalHour(date = new Date()): number {
  return date.getHours() + date.getMinutes() / 60
}

export function useTimeOfDay(): TimeOfDay {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => computeTimeOfDay())

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(computeTimeOfDay()), 60_000)
    return () => clearInterval(id)
  }, [])

  return timeOfDay
}
