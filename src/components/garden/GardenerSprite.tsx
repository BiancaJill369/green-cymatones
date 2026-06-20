import { useCallback, useEffect, useRef, useState } from 'react'
import '../../styles/gardener-sprite.css'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import { useCompanionsStore } from '../../stores/companionsStore'
import type { RendezvousType } from '../../stores/companionsStore'
import Gardener from '../character/Gardener'

type Behavior = 'wander' | 'tend' | 'greet' | 'gaze' | 'idle'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const GESTURE: Partial<Record<Behavior, string>> = { tend: '💧', greet: '💚', gaze: '🌙' }
const RZV_TYPES: RendezvousType[] = ['pet', 'figure8', 'sit_together', 'iam']

export default function GardenerSprite() {
  const { greenProfile } = useAuth()
  const avatar = greenProfile?.avatar
  const rendezvous = useCompanionsStore((s) => s.rendezvous)

  const [x, setX] = useState(55)
  const [facing, setFacing] = useState(-1)
  const [behavior, setBehavior] = useState<Behavior>('idle')
  const [walkDur, setWalkDur] = useState(4)
  const xRef = useRef(55)
  const lastRzv = useRef(0)
  const reduced = useRef(prefersReducedMotion())

  // shared walk helper: slide to a target left%, face travel direction, publish x
  const walkTo = useCallback((target: number) => {
    const t = clamp(target, 8, 88)
    const dur = clamp(1.8 + Math.abs(t - xRef.current) / 16, 2, 7)
    setWalkDur(dur)
    setFacing(t >= xRef.current ? -1 : 1) // avatar faces left by default
    xRef.current = t
    setX(t)
    useCompanionsStore.getState().setGardenerX(t)
    return dur
  }, [])

  // individual behavior loop — LOCKED while a rendezvous is in progress
  useEffect(() => {
    if (!avatar || reduced.current) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))
    // never let an in-flight individual behavior overwrite the rendezvous pose
    const setBeh = (b: Behavior) => {
      if (!useCompanionsStore.getState().rendezvous) setBehavior(b)
    }

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
      if (duskNight) pool.push('gaze', 'gaze')
      return pool[Math.floor(Math.random() * pool.length)]
    }

    const run = () => {
      if (cancelled) return
      if (useCompanionsStore.getState().rendezvous) {
        after(1200, run) // locked: the rendezvous effect is driving things
        return
      }
      // occasionally initiate a shared rendezvous with the cat (gentle + spaced)
      if (Date.now() - lastRzv.current > 24000 && Math.random() < 0.22) {
        lastRzv.current = Date.now()
        const catX = useCompanionsStore.getState().catX
        const mid = clamp((xRef.current + catX) / 2, 16, 82)
        const type = RZV_TYPES[Math.floor(Math.random() * RZV_TYPES.length)]
        useCompanionsStore.getState().startRendezvous({ initiator: 'gardener', type, x: mid })
        after(1200, run)
        return
      }

      const b = choose()
      setBeh(b)
      if (b === 'wander') {
        const dur = walkTo(8 + Math.random() * 80)
        after(dur * 1000 + 400, () => {
          setBeh('idle')
          after(900 + Math.random() * 1800, run)
        })
      } else if (b === 'tend') {
        const els = useGardenStore.getState().elements
        const el = els[Math.floor(Math.random() * els.length)]
        const target = el ? clamp(el.position_x * 0.7 + 15, 12, 86) : 20 + Math.random() * 60
        const dur = walkTo(target)
        after(dur * 1000 + 300, () => {
          setBeh('tend')
          after(2600 + Math.random() * 1600, run)
        })
      } else if (b === 'greet') {
        const catX = useCompanionsStore.getState().catX
        const dur = walkTo(catX + (xRef.current < catX ? -9 : 9))
        after(dur * 1000 + 300, () => {
          setFacing(useCompanionsStore.getState().catX >= xRef.current ? -1 : 1)
          setBeh('greet')
          after(2400 + Math.random() * 1400, run)
        })
      } else if (b === 'gaze') {
        after(3200 + Math.random() * 2600, run)
      } else {
        after(1600 + Math.random() * 2400, run)
      }
    }

    useCompanionsStore.getState().setGardenerX(xRef.current)
    after(900, run)
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatar])

  // rendezvous: the gardener (initiator) walks to the meet point, plays its
  // part of the shared moment, then releases both characters.
  useEffect(() => {
    if (!avatar || !rendezvous) return
    const pose: Behavior =
      rendezvous.type === 'sit_together' ? 'gaze' : rendezvous.type === 'iam' ? 'idle' : 'greet'

    if (reduced.current) {
      setBehavior(pose)
      const t = setTimeout(() => useCompanionsStore.getState().endRendezvous(), 2600)
      return () => clearTimeout(t)
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const dur = walkTo(rendezvous.x - 7)
    timers.push(
      setTimeout(() => {
        setFacing(useCompanionsStore.getState().catX >= xRef.current ? -1 : 1)
        setBehavior(pose)
        timers.push(setTimeout(() => useCompanionsStore.getState().endRendezvous(), 4400))
      }, dur * 1000 + 300),
    )
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendezvous, avatar])

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
