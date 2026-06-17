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
  is_movable: boolean
  metadata: Record<string, unknown>
}

export interface ElementPatch {
  position_x?: number
  position_y?: number
  scale?: number
  rotation?: number
}

const DEFAULT_BEDS: { bed_type: BedType; name: string }[] = [
  { bed_type: 'herb_garden', name: 'Herb Garden' },
  { bed_type: 'wild_meadow', name: 'Wild Meadow' },
  { bed_type: 'forest_floor', name: 'Forest Floor' },
]

const DAY_MS = 86_400_000

// Time-based growth: one stage per real day since growth_started_at (capped at 5).
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
  userId: string | null
  // edit mode
  isEditMode: boolean
  selectedId: string | null
  dirty: Set<string>

  loadGarden: (userId: string) => Promise<void>
  plantSeedling: (args: {
    renderKey: string
    category: string
    species: string
    plantedAt: string
  }) => Promise<GardenElement | null>
  toggleEditMode: () => void
  selectElement: (id: string | null) => void
  updateElementLocal: (id: string, patch: ElementPatch) => void
  removeElement: (id: string) => Promise<void>
  saveLayout: () => Promise<void>
  cancelEdit: () => Promise<void>
}

export const useGardenStore = create<GardenState>((set, get) => ({
  beds: [],
  elements: [],
  isLoaded: false,
  userId: null,
  isEditMode: false,
  selectedId: null,
  dirty: new Set(),

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

      await applyGrowth(elements)

      set({ beds: (beds ?? []) as GardenBed[], elements, isLoaded: true, userId })
    } catch (err) {
      console.error('loadGarden error', err)
      set({ isLoaded: true, userId })
    }
  },

  // Plant a granted seed. category routes it to the right bed; render_key/species
  // ride in metadata so GardenElement can draw the species (Chunk 16).
  plantSeedling: async ({ renderKey, category, species, plantedAt }) => {
    const userId = get().userId
    if (!userId) return null
    const bedType: BedType =
      category === 'tree' ? 'forest_floor' : category === 'herb' ? 'herb_garden' : 'wild_meadow'
    const elementType = category === 'tree' ? 'tree' : category === 'herb' ? 'plant' : 'flower'

    let bed = get().beds.find((b) => b.bed_type === bedType)
    if (!bed) {
      const { data } = await supabase
        .from('green_garden_beds')
        .select('*')
        .eq('user_id', userId)
        .eq('bed_type', bedType)
        .single()
      bed = (data as GardenBed | null) ?? undefined
    }
    if (!bed) return null

    const { data, error } = await supabase
      .from('green_garden_elements')
      .insert({
        user_id: userId,
        bed_id: bed.id,
        element_type: elementType,
        seed_source: 'manual',
        position_x: 12 + Math.random() * 76,
        position_y: 14 + Math.random() * 64,
        growth_stage: 0,
        growth_started_at: plantedAt,
        metadata: { render_key: renderKey, category, species },
      })
      .select('*')
      .single()
    if (error) {
      console.error('plantSeedling error', error)
      return null
    }
    const el = data as GardenElement
    set((s) => ({ elements: [...s.elements, el] }))
    return el
  },

  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode, selectedId: null })),

  selectElement: (id) => set({ selectedId: id }),

  updateElementLocal: (id, patch) =>
    set((s) => {
      const dirty = new Set(s.dirty)
      dirty.add(id)
      return {
        elements: s.elements.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        dirty,
      }
    }),

  removeElement: async (id) => {
    await supabase.from('green_garden_elements').delete().eq('id', id)
    set((s) => {
      const dirty = new Set(s.dirty)
      dirty.delete(id)
      return {
        elements: s.elements.filter((e) => e.id !== id),
        dirty,
        selectedId: s.selectedId === id ? null : s.selectedId,
      }
    })
    useToastStore.getState().push('Plant removed')
  },

  saveLayout: async () => {
    const { elements, dirty } = get()
    const updates = elements
      .filter((e) => dirty.has(e.id))
      .map((e) =>
        supabase
          .from('green_garden_elements')
          .update({
            position_x: e.position_x,
            position_y: e.position_y,
            scale: e.scale,
            rotation: e.rotation,
            updated_at: new Date().toISOString(),
          })
          .eq('id', e.id),
      )
    await Promise.all(updates)
    set({ dirty: new Set(), isEditMode: false, selectedId: null })
  },

  cancelEdit: async () => {
    const userId = get().userId
    if (userId) {
      const { data } = await supabase
        .from('green_garden_elements')
        .select('*')
        .eq('user_id', userId)
      set({ elements: (data ?? []) as GardenElement[] })
    }
    set({ dirty: new Set(), isEditMode: false, selectedId: null })
  },
}))
