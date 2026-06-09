import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

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
  metadata: Record<string, unknown>
}

// The three beds every member gets, provisioned on first load.
const DEFAULT_BEDS: { bed_type: BedType; name: string }[] = [
  { bed_type: 'herb_garden', name: 'Herb Garden' },
  { bed_type: 'wild_meadow', name: 'Wild Meadow' },
  { bed_type: 'forest_floor', name: 'Forest Floor' },
]

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
      // 1. Fetch existing beds.
      let { data: beds } = await supabase
        .from('green_garden_beds')
        .select('*')
        .eq('user_id', userId)

      // 2. Provision the three beds if the member has none yet.
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

      // 3. Fetch this member's garden elements (none yet, but future chunks fill this).
      const { data: elements } = await supabase
        .from('green_garden_elements')
        .select('*')
        .eq('user_id', userId)

      set({
        beds: (beds ?? []) as GardenBed[],
        elements: (elements ?? []) as GardenElement[],
        isLoaded: true,
      })
    } catch (err) {
      console.error('loadGarden error', err)
      set({ isLoaded: true })
    }
  },
}))
