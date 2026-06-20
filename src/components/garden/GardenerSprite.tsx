import { useEffect, useRef, useState } from 'react'
import '../../styles/gardener-sprite.css'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import { useCompanionsStore } from '../../stores/companionsStore'
import Gardener from '../character/Gardener'

type Behavior = 'wander' | 'tend' | 'greet' | 'gaze' | 'idle'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const GESTURE: Partial<Record<Behavior, string>> = { tend: '💧', greet: '💚', gaze: '🌙' }

export default function GardenerSprite() {
  const { greenProfile } = useAuth()
  const avatar = greenProfile?.avatar
  const setGardenerX = useCompanionsStore((s) => s.setGardenerX)

  const [x, setX] = useState(55)
  const [facing, setFacing] = useState(-1)
  const [behavior, setBehavior] = useState<Behavior>('idle')
  const [walkDur, setWalkDur] = useState(4)
  const xRef = useRef(55)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    if (!avatar || reduced.current) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

    const walkTo = (target: number) => {
      const t = clamp(target, 8, 88)
      const dur = clamp(1.8 + Math.abs(t - xRef.current) / 16, 2, 7)
      setWalkDur(dur)
      setFacing(t >= xRef.current ? -1 : 1) // avatar faces left by default
      xRef.current = t
      setX(t)
      setGardenerX(t)
      return dur
    }

    // pick a context-appropriate behavior, weighted
    const choose = (): Behavior => {
      const hour = new Date().getHours()
      const duskNight = hour >= 16 || hour < 6
      const hasPlant = useGardenStore.getState().elements.length > 0
      const catX = useCompanionsStore.getState().catX
      const catNear = Math.abs(xRef.current - catX) < 16
      const pool: Behavior[] = ['wander', 'wander', 'idle']
      if (hasPlant) pool.push('tend')
      if (catNear) pool.push('greet')
      pool.push('gaze')
      if (duskNight) pool.push('gaze', 'gaze') // moon-gaze weighted higher at dusk/night
      return pool[Math.floor(Math.random() * pool.length)]
    }

    const run = () => {
      if (cancelled) return
      const b = choose()
      setBehavior(b)

      if (b === 'wander') {
        const dur = walkTo(8 + Math.random() * 80)
        after(dur * 1000 + 400, () => {
          setBehavior('idle')
          after(900 + Math.random() * 1800, run)
        })
      } else if (b === 'tend') {
        const els = useGardenStore.getState().elements
        const el = els[Math.floor(Math.random() * els.length)]
        const target = el ? clamp(el.position_x * 0.7 + 15, 12, 86) : 20 + Math.random() * 60
        const dur = walkTo(target)
        after(dur * 1000 + 300, () => {
          setBehavior('tend')
          after(2600 + Math.random() * 1600, run)
        })
      } else if (b === 'greet') {
        const catX = useCompanionsStore.getState().catX
        const target = catX + (xRef.current < catX ? -9 : 9) // stop just short of the cat
        const dur = walkTo(target)
        after(dur * 1000 + 300, () => {
          setFacing(catX >= xRef.current ? -1 : 1) // turn to face the cat
          setBehavior('greet')
          after(2400 + Math.random() * 1400, run)
        })
      } else if (b === 'gaze') {
        after(3200 + Math.random() * 2600, run) // stay put, look up
      } else {
        after(1600 + Math.random() * 2400, run) // idle
      }
    }

    setGardenerX(xRef.current)
    after(900, run)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar])

  if (!avatar) return null

  return (
    <div
      className={`gardener-sprite${reduced.current ? ' reduced' : ''}`}
      style={{ left: `${x}%`, transition: reduced.current ? 'none' : `left ${walkDur}s ease-in-out` }}
      aria-hidden="true"
    >
      {GESTURE[behavior] && <div className="gd-gesture">{GESTURE[behavior]}</div>}
      <div className="gd-flip" style={{ transform: `scaleX(${facing})` }}>
        <div className={`gd-body gd-${behavior}`}>
          <Gardener avatar={avatar} size={72} ariaLabel="" />
        </div>
      </div>
    </div>
  )
}
