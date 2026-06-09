import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/garden.css'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import type { BedType } from '../../stores/gardenStore'
import SkyBackground from './SkyBackground'
import GardenBed from './GardenBed'
import Creatures from './Creatures'

export default function GardenView() {
  const timeOfDay = useTimeOfDay()
  const navigate = useNavigate()
  const { user, greenProfile, signOut } = useAuth()
  const beds = useGardenStore((s) => s.beds)
  const elements = useGardenStore((s) => s.elements)
  const loadGarden = useGardenStore((s) => s.loadGarden)

  useEffect(() => {
    if (user?.id) void loadGarden(user.id)
  }, [user?.id, loadGarden])

  const elementsFor = (type: BedType) => {
    const bed = beds.find((b) => b.bed_type === type)
    return bed ? elements.filter((e) => e.bed_id === bed.id) : []
  }

  // Forest trees: ~1 per 150px width, randomized scale (0.7–1.6), x-jitter, z by scale.
  const trees = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    const n = Math.max(7, Math.floor(width / 150))
    return Array.from({ length: n }, (_, t) => {
      const scale = 0.7 + Math.random() * 0.9
      const left = 2 + t * (96 / Math.max(1, n - 1)) + (Math.random() * 4 - 2)
      return { left, scale, delay: Math.random() * 1.2, z: Math.round(scale * 10) }
    })
  }, [])

  const fireflies = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: `${(Math.random() * 3).toFixed(2)}s, ${(Math.random() * 2).toFixed(2)}s`,
      })),
    [],
  )

  const name = greenProfile?.display_name || user?.email || 'friend'
  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className={`stage${timeOfDay === 'night' ? ' night' : ''}`}>
      {/* SKY + horizon */}
      <SkyBackground timeOfDay={timeOfDay} />
      <div className="horizon" aria-hidden="true" />

      {/* FOREST FLOOR (full width) */}
      <div className="forest">
        <div className="ground" />
        {trees.map((t, i) => (
          <div
            key={`tr-${i}`}
            className="tree"
            style={{ left: `${t.left}%`, transform: `translateX(-50%) scale(${t.scale})`, zIndex: t.z }}
          >
            <div className="tree-inner" style={{ animationDelay: `${t.delay}s` }}>
              <div className="trunk" />
              <div className="canopy" />
            </div>
          </div>
        ))}
        {fireflies.map((f, i) => (
          <div
            key={`ff-${i}`}
            className="firefly"
            style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: f.delay }}
          />
        ))}
        {/* real forest elements (trees) when they exist */}
        {elementsFor('forest_floor').map((el) => (
          <div
            key={el.id}
            className="tree"
            style={{ left: `${el.position_x}%`, transform: 'translateX(-50%) scale(1)' }}
          >
            <div className="tree-inner">
              <div className="trunk" />
              <div className="canopy" />
            </div>
          </div>
        ))}
      </div>

      {/* FOREGROUND beds */}
      <div className="foreground">
        <GardenBed variant="herb" label="Herb Garden" elements={elementsFor('herb_garden')} divider />
        <GardenBed variant="meadow" label="Wild Meadow" elements={elementsFor('wild_meadow')} />
      </div>

      <Creatures timeOfDay={timeOfDay} />

      {/* HUD */}
      <div
        className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 text-sm"
        style={{ zIndex: 20 }}
      >
        <span className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur">
          Welcome, {name}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur transition hover:bg-night-sky/70"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
