import type { TimeOfDay } from '../../hooks/useTimeOfDay'

/**
 * A calm, layered mountain-range silhouette across the horizon band — replaces
 * the decorative tree line so the only trees in the scene are the ones the user
 * planted. Three overlapping ridgelines (farthest palest → nearest darkest),
 * tinted by the local-time sky, with a soft dawn/dusk glow on the peaks.
 */
const RIDGES: Record<TimeOfDay, [string, string, string]> = {
  dawn: ['#9aa0bf', '#6f6f96', '#4a5172'],
  day: ['#7ba896', '#568975', '#3a6354'],
  noon: ['#86b8a2', '#5e9079', '#406b58'],
  dusk: ['#8f7e9e', '#5f5780', '#3f3a5e'],
  night: ['#39456a', '#283655', '#18203c'],
}
const GLOW: Partial<Record<TimeOfDay, string>> = { dawn: '#f6c6a8', dusk: '#f0a890' }

// rounded-peak ridgelines: far (tall, back) → near (low, front), each filled down
const FAR = 'M0 34 Q15 14 30 28 Q45 10 62 26 Q80 16 96 30 Q110 20 120 28 L120 60 L0 60 Z'
const MID = 'M0 42 Q18 26 34 38 Q52 24 70 38 Q88 28 106 40 Q114 34 120 38 L120 60 L0 60 Z'
const NEAR = 'M0 50 Q20 40 38 48 Q58 38 78 48 Q98 42 120 48 L120 60 L0 60 Z'
const FAR_TOP = 'M0 34 Q15 14 30 28 Q45 10 62 26 Q80 16 96 30 Q110 20 120 28'

export default function MountainRange({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const [far, mid, near] = RIDGES[timeOfDay]
  const glow = GLOW[timeOfDay]
  return (
    <svg className="mountains" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true">
      <path d={FAR} fill={far} />
      {glow && <path d={FAR_TOP} fill="none" stroke={glow} strokeWidth="1.4" opacity="0.7" />}
      <path d={MID} fill={mid} />
      <path d={NEAR} fill={near} />
    </svg>
  )
}
