import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { useGardenStore } from './gardenStore'

// green_bloom_types is a species catalog (19 rows): one row per plantable species.
export interface BloomType {
  render_key: string
  display_name: string
  category: string // 'herb' | 'tree' | 'wildflower'
}

export interface GrantResult {
  granted: boolean
  bloom?: BloomType
}

// an earned-but-unplaced seed sitting in the Seed Bag
export interface BagSeed {
  id: string // green_seed_grants.id
  bloom: BloomType
}

// earn-path (source_key) → which species category it rolls from
const CATEGORY_BY_SOURCE: Record<string, string> = {
  journal: 'herb',
  oracle_herb: 'herb',
  tones: 'tree',
  oracle_forest: 'tree',
  angel: 'wildflower',
  art: 'wildflower',
  oracle_wildmeadow: 'wildflower',
}

interface SeedState {
  species: BloomType[] // the catalog
  todayGrants: string[] // source_keys already granted today
  bag: BagSeed[] // earned seeds with element_id IS NULL
  loadSpecies: () => Promise<void>
  loadTodayGrants: (userId: string) => Promise<void>
  loadBag: (userId: string) => Promise<void>
  grantSeed: (args: {
    userId: string
    activityType: string
    deckKey?: string
  }) => Promise<GrantResult>
  plantFromBag: (seed: BagSeed, position: { x: number; y: number }) => Promise<boolean>
}

export const useSeedStore = create<SeedState>((set, get) => ({
  species: [],
  todayGrants: [],
  bag: [],

  loadSpecies: async () => {
    const { data, error } = await supabase
      .from('green_bloom_types')
      .select('render_key, display_name, category')
    if (error) {
      console.error('loadSpecies error', error)
      return
    }
    set({ species: (data ?? []) as BloomType[] })
  },

  loadTodayGrants: async (userId) => {
    const today = new Date().toISOString().slice(0, 10)
    const { data } = await supabase
      .from('green_seed_grants')
      .select('source_key')
      .eq('user_id', userId)
      .eq('grant_date', today)
    set({ todayGrants: (data ?? []).map((r: { source_key: string }) => r.source_key) })
  },

  // the Seed Bag = earned seeds not yet placed (element_id IS NULL); each grant
  // stores the rolled render_key, which we resolve against the species catalog.
  loadBag: async (userId) => {
    let species = get().species
    if (species.length === 0) {
      await get().loadSpecies()
      species = get().species
    }
    const byKey = new Map(species.map((s) => [s.render_key, s]))
    const { data, error } = await supabase
      .from('green_seed_grants')
      .select('id, render_key')
      .eq('user_id', userId)
      .is('element_id', null)
      .order('grant_date', { ascending: false })
    if (error) {
      console.error('loadBag error', error)
      return
    }
    const bag: BagSeed[] = []
    for (const r of (data ?? []) as { id: string; render_key: string }[]) {
      const bloom = byKey.get(r.render_key)
      if (bloom) bag.push({ id: r.id, bloom })
    }
    set({ bag })
  },

  // Roll a RANDOM species from the earn-path's category, then record an UNPLACED
  // grant. The cap is per earn-path per day (DB UNIQUE user_id, source_key,
  // grant_date) — so oracle gives one seed PER DECK per day. Bag-first: no plant.
  grantSeed: async ({ userId, activityType, deckKey }) => {
    const sourceKey = activityType === 'oracle' ? `oracle_${deckKey}` : activityType
    const category = CATEGORY_BY_SOURCE[sourceKey]
    if (!category) {
      console.error('grantSeed: unknown earn-path', sourceKey)
      return { granted: false }
    }

    let species = get().species
    if (species.length === 0) {
      await get().loadSpecies()
      species = get().species
    }
    const pool = species.filter((s) => s.category === category)
    if (pool.length === 0) {
      console.error('grantSeed: no species in category', category)
      return { granted: false }
    }
    const rolled = pool[Math.floor(Math.random() * pool.length)]

    const { data, error } = await supabase
      .from('green_seed_grants')
      .upsert(
        { user_id: userId, activity_type: activityType, source_key: sourceKey, render_key: rolled.render_key },
        { onConflict: 'user_id,source_key,grant_date', ignoreDuplicates: true },
      )
      .select('id')
    if (error) {
      console.error('grantSeed error', error)
      return { granted: false }
    }
    if (!data || data.length === 0) return { granted: false } // already earned this path today

    set((s) => ({
      todayGrants: [...new Set([...s.todayGrants, sourceKey])],
      bag: [{ id: data[0].id, bloom: rolled }, ...s.bag],
    }))
    return { granted: true, bloom: rolled }
  },

  // Plant a bagged seed at a chosen grid cell; it blooms over the next day.
  plantFromBag: async (seed, position) => {
    const element = await useGardenStore.getState().plantSeedling({
      renderKey: seed.bloom.render_key,
      category: seed.bloom.category,
      species: seed.bloom.display_name,
      plantedAt: new Date().toISOString(),
      position,
    })
    if (!element) return false
    await supabase.from('green_seed_grants').update({ element_id: element.id }).eq('id', seed.id)
    set((s) => ({ bag: s.bag.filter((b) => b.id !== seed.id) }))
    return true
  },
}))
