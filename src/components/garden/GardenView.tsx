import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/garden.css'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import type { BedType, GardenElement as El } from '../../stores/gardenStore'
import { useOracleStore } from '../../stores/oracleStore'
import SkyBackground from './SkyBackground'
import GardenBed from './GardenBed'
import GardenElement from './GardenElement'
import Creatures from './Creatures'
import Toasts from '../common/Toasts'

export default function GardenView() {
  const timeOfDay = useTimeOfDay()
  const navigate = useNavigate()
  const { user, greenProfile, signOut } = useAuth()
  const beds = useGardenStore((s) => s.beds)
  const elements = useGardenStore((s) => s.elements)
  const loadGarden = useGardenStore((s) => s.loadGarden)
  const oracleCards = useOracleStore((s) => s.cards)
  const oracleLoaded = useOracleStore((s) => s.isLoaded)
  const loadDecks = useOracleStore((s) => s.loadDecks)

  const [selected, setSelected] = useState<El | null>(null)

  useEffect(() => {
    if (user?.id) void loadGarden(user.id)
  }, [user?.id, loadGarden])

  // oracle cards power the tap-sheet (source card name + affirmation)
  useEffect(() => {
    if (!oracleLoaded) void loadDecks()
  }, [oracleLoaded, loadDecks])

  const elementsFor = (type: BedType) => {
    const bed = beds.find((b) => b.bed_type === type)
    return bed ? elements.filter((e) => e.bed_id === bed.id) : []
  }

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

  const selectedCard = selected ? oracleCards.find((c) => c.id === selected.card_id) : undefined

  return (
    <div className={`stage${timeOfDay === 'night' ? ' night' : ''}`}>
      <SkyBackground timeOfDay={timeOfDay} />
      <div className="horizon" aria-hidden="true" />

      {/* FOREST FLOOR */}
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
        {/* real planted forest elements */}
        {elementsFor('forest_floor').map((el) => (
          <GardenElement key={el.id} element={el} variant="forest" onTap={setSelected} />
        ))}
      </div>

      {/* FOREGROUND beds */}
      <div className="foreground">
        <GardenBed
          variant="herb"
          label="Herb Garden"
          planted={elementsFor('herb_garden')}
          onTapElement={setSelected}
          divider
        />
        <GardenBed
          variant="meadow"
          label="Wild Meadow"
          planted={elementsFor('wild_meadow')}
          onTapElement={setSelected}
        />
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
        <div className="flex items-center gap-2">
          <Link
            to="/oracle"
            className="rounded-full bg-green-500/80 px-3 py-1 font-semibold text-night-sky backdrop-blur transition hover:bg-green-400"
          >
            🃏 Draw today’s cards
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur transition hover:bg-night-sky/70"
          >
            Sign out
          </button>
        </div>
      </div>

      <Toasts />

      {/* element detail sheet */}
      {selected && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 rounded-t-2xl bg-night-sky/90 px-6 py-5 text-center text-moon backdrop-blur"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <p className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {selectedCard?.name ?? 'A planted seed'}
          </p>
          {selectedCard?.affirmation && (
            <p className="italic text-green-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {selectedCard.affirmation}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="mt-1 rounded-full border border-green-700/50 px-4 py-1.5 text-sm hover:bg-green-900/40"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
