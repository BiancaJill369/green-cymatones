import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { useOracleStore } from './oracleStore'
import { useToastStore } from './toastStore'

export type BedType = 'herb_garden' | 'wild_meadow' | 'forest_floor'

export interface GardenBed {
  id: string
  user_id: string
  bed_type: BedType
  name: string | null
  layout_data: Record<string, unknown>
  is_unlocked: boolean
  created_at: string
  updated_at: string
}

export interface GardenElement {
  id: string
  user_id: string
  bed_id: string
  element_type: string
  seed_source: string
  card_id: string | null
  position_x: number
  position_y: number
  scale: number
  rotation: number
  growth_stage: number
  growth_started_at: string
  growth_completed_at: string | null
  metadata: Record<string, unknown>
}

const DEFAULT_BEDS: { bed_type: BedType; name: string }[] = [
  { bed_type: 'herb_garden', name: 'Herb Garden' },
  { bed_type: 'wild_meadow', name: 'Wild Meadow' },
  { bed_type: 'forest_floor', name: 'Forest Floor' },
]

const DAY_MS = 86_400_000

// Time-based growth: one stage per real day since growth_started_at (capped at 5).
// Mutates elements in place, persists changed stages, toasts newly bloomed plants.
async function applyGrowth(elements: GardenElement[]) {
  const updates: PromiseLike<unknown>[] = []
  const bloomed: GardenElement[] = []

  for (const el of elements) {
    const newStage = Math.min(
      Math.floor((Date.now() - new Date(el.growth_started_at).getTime()) / DAY_MS),
      5,
    )
    if (newStage !== el.growth_stage) {
      const patch: Record<string, unknown> = { growth_stage: newStage }
      if (newStage === 5 && !el.growth_completed_at) {
        const ts = new Date().toISOString()
        patch.growth_completed_at = ts
        el.growth_completed_at = ts
        bloomed.push(el)
      }
      el.growth_stage = newStage
      updates.push(supabase.from('green_garden_elements').update(patch).eq('id', el.id))
    }
  }
  await Promise.all(updates)

  if (bloomed.length) {
    let cards = useOracleStore.getState().cards
    if (cards.length === 0) {
      await useOracleStore.getState().loadDecks()
      cards = useOracleStore.getState().cards
    }
    const push = useToastStore.getState().push
    for (const el of bloomed) {
      const card = cards.find((c) => c.id === el.card_id)
      push(`${card?.name ?? 'A plant'} has fully bloomed`)
    }
  }
}

interface GardenState {
  beds: GardenBed[]
  elements: GardenElement[]
  isLoaded: boolean
  loadGarden: (userId: string) => Promise<void>
}

export const useGardenStore = create<GardenState>((set) => ({
  beds: [],
  elements: [],
  isLoaded: false,

  loadGarden: async (userId) => {
    try {
      let { data: beds } = await supabase
        .from('green_garden_beds')
        .select('*')
        .eq('user_id', userId)

      if (!beds || beds.length === 0) {
        await supabase
          .from('green_garden_beds')
          .insert(DEFAULT_BEDS.map((b) => ({ ...b, user_id: userId })))
        const refetched = await supabase
          .from('green_garden_beds')
          .select('*')
          .eq('user_id', userId)
        beds = refetched.data ?? []
      }

      const { data: elemData } = await supabase
        .from('green_garden_elements')
        .select('*')
        .eq('user_id', userId)
      const elements = (elemData ?? []) as GardenElement[]

      // advance growth before rendering
      await applyGrowth(elements)

      set({ beds: (beds ?? []) as GardenBed[], elements, isLoaded: true })
    } catch (err) {
      console.error('loadGarden error', err)
      set({ isLoaded: true })
    }
  },
}))
