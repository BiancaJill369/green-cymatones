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

interface SeedState {
  bloomLegend: Record<string, BloomType>
  todayGrants: string[] // activity_types already granted today
  loadLegend: () => Promise<void>
  loadTodayGrants: (userId: string) => Promise<void>
  grantSeed: (args: {
    userId: string
    activityType: string
    sourceKey: string
  }) => Promise<GrantResult>
}

export const useSeedStore = create<SeedState>((set, get) => ({
  bloomLegend: {},
  todayGrants: [],

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

  // One seed per activity_type per day. The DB UNIQUE(user_id, activity_type, grant_date)
  // is the single source of truth for the cap (ignoreDuplicates → empty array = already earned).
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
    if (!bloom) return { granted: true }

    // plant a seedling now; it blooms over the next day (Chunk 7a growth)
    const element = await useGardenStore.getState().plantSeedling({
      renderKey: bloom.render_key,
      category: bloom.category,
      species: bloom.display_name,
      plantedAt: new Date().toISOString(),
    })
    if (element) {
      await supabase.from('green_seed_grants').update({ element_id: element.id }).eq('id', data[0].id)
    }

    set((s) => ({ todayGrants: [...new Set([...s.todayGrants, activityType])] }))
    return { granted: true, bloom }
  },
}))
