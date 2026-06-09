import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/garden.css'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import type { BedType } from '../../stores/gardenStore'
import SkyBackground from './SkyBackground'
import SunMoon from './SunMoon'
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

  const name = greenProfile?.display_name || user?.email || 'friend'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const elementsFor = (type: BedType) => {
    const bed = beds.find((b) => b.bed_type === type)
    return bed ? elements.filter((e) => e.bed_id === bed.id) : []
  }

  return (
    <div className="garden">
      {/* SKY (top band) */}
      <div className="garden-sky-band">
        <SkyBackground timeOfDay={timeOfDay} />
        <SunMoon timeOfDay={timeOfDay} />
      </div>

      {/* HORIZON line */}
      <div className={`garden-horizon garden-horizon--${timeOfDay}`} aria-hidden="true" />

      {/* FOREST FLOOR (full-width mid band) */}
      <div className="garden-forest-band">
        <GardenBed variant="forest" label="Forest Floor" elements={elementsFor('forest_floor')} />
      </div>

      {/* FOREGROUND (two low beds, 50/50) */}
      <div className="garden-foreground">
        <GardenBed variant="low" label="Herb Garden" elements={elementsFor('herb_garden')} />
        <GardenBed variant="low" label="Wild Meadow" elements={elementsFor('wild_meadow')} />
      </div>

      <Creatures timeOfDay={timeOfDay} />

      {/* HUD */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-4 py-3 text-sm">
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
