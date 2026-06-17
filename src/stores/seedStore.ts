import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { useGardenStore } from './gardenStore'

// green_bloom_types — 7 rows mapping an activity source_key to its bloom.
export interface BloomType {
  source_key: string
  display_name: string
  render_key: string
  category: string // 'herb' | 'tree' | 'wildflower'
}

export interface GrantResult {
  granted: boolean
  bloom?: BloomType
}

// an earned-but-unplaced seed sitting in the Seed Bag
export interface BagSeed {
  id: string // green_seed_grants.id
  source_key: string
  bloom: BloomType
}

interface SeedState {
  bloomLegend: Record<string, BloomType>
  todayGrants: string[] // activity_types already granted today
  bag: BagSeed[] // earned seeds with element_id IS NULL
  loadLegend: () => Promise<void>
  loadTodayGrants: (userId: string) => Promise<void>
  loadBag: (userId: string) => Promise<void>
  grantSeed: (args: {
    userId: string
    activityType: string
    sourceKey: string
  }) => Promise<GrantResult>
  plantFromBag: (seed: BagSeed) => Promise<boolean>
}

export const useSeedStore = create<SeedState>((set, get) => ({
  bloomLegend: {},
  todayGrants: [],
  bag: [],

  loadLegend: async () => {
    const { data, error } = await supabase.from('green_bloom_types').select('*')
    if (error) {
      console.error('loadLegend error', error)
      return
    }
    const legend: Record<string, BloomType> = {}
    for (const b of (data ?? []) as BloomType[]) legend[b.source_key] = b
    set({ bloomLegend: legend })
  },

  loadTodayGrants: async (userId) => {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('green_seed_grants')
      .select('activity_type')
      .eq('user_id', userId)
      .eq('grant_date', today)
    set({ todayGrants: (data ?? []).map((r: { activity_type: string }) => r.activity_type) })
  },

  // the Seed Bag = earned seeds not yet placed in the garden (element_id IS NULL)
  loadBag: async (userId) => {
    let legend = get().bloomLegend
    if (Object.keys(legend).length === 0) {
      await get().loadLegend()
      legend = get().bloomLegend
    }
    const { data, error } = await supabase
      .from('green_seed_grants')
      .select('id, source_key')
      .eq('user_id', userId)
      .is('element_id', null)
      .order('grant_date', { ascending: false })
    if (error) {
      console.error('loadBag error', error)
      return
    }
    const bag: BagSeed[] = []
    for (const r of (data ?? []) as { id: string; source_key: string }[]) {
      const bloom = legend[r.source_key]
      if (bloom) bag.push({ id: r.id, source_key: r.source_key, bloom })
    }
    set({ bag })
  },

  // One seed per activity_type per day. The DB UNIQUE(user_id, activity_type, grant_date)
  // is the single source of truth for the cap (ignoreDuplicates → empty array = already earned).
  // Bag-first: the seed is recorded UNPLACED — it lands in the Seed Bag for the user to place.
  grantSeed: async ({ userId, activityType, sourceKey }) => {
    const { data, error } = await supabase
      .from('green_seed_grants')
      .upsert(
        { user_id: userId, activity_type: activityType, source_key: sourceKey },
        { onConflict: 'user_id,activity_type,grant_date', ignoreDuplicates: true },
      )
      .select('id')
    if (error) {
      console.error('grantSeed error', error)
      return { granted: false }
    }
    if (!data || data.length === 0) return { granted: false } // already earned this type today

    let legend = get().bloomLegend
    if (Object.keys(legend).length === 0) {
      await get().loadLegend()
      legend = get().bloomLegend
    }
    const bloom = legend[sourceKey]

    set((s) => ({
      todayGrants: [...new Set([...s.todayGrants, activityType])],
      bag: bloom ? [{ id: data[0].id, source_key: sourceKey, bloom }, ...s.bag] : s.bag,
    }))
    return { granted: true, bloom }
  },

  // Plant a bagged seed into its bed; it blooms over the next day (Chunk 7a growth).
  plantFromBag: async (seed) => {
    const element = await useGardenStore.getState().plantSeedling({
      renderKey: seed.bloom.render_key,
      category: seed.bloom.category,
      species: seed.bloom.display_name,
      plantedAt: new Date().toISOString(),
    })
    if (!element) return false
    await supabase.from('green_seed_grants').update({ element_id: element.id }).eq('id', seed.id)
    set((s) => ({ bag: s.bag.filter((b) => b.id !== seed.id) }))
    return true
  },
}))
