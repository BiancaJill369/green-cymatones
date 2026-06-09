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

const BED_DEFS: { type: BedType; label: string }[] = [
  { type: 'herb_garden', label: 'Herb Garden' },
  { type: 'wild_meadow', label: 'Wild Meadow' },
  { type: 'forest_floor', label: 'Forest Floor' },
]

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

  return (
    <div className="garden">
      <SkyBackground timeOfDay={timeOfDay} />
      <SunMoon timeOfDay={timeOfDay} />

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

      <Creatures timeOfDay={timeOfDay} />

      <div className="garden-beds">
        {BED_DEFS.map((def) => {
          const bed = beds.find((b) => b.bed_type === def.type)
          const bedElements = bed ? elements.filter((e) => e.bed_id === bed.id) : []
          return <GardenBed key={def.type} label={def.label} elements={bedElements} />
        })}
      </div>
    </div>
  )
}
