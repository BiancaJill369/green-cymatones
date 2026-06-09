import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export type StarSource = 'angel_number' | 'iam_statement'

export interface SkyStar {
  id: string
  user_id: string
  source_type: StarSource
  source_ref: string
  label: string
  detail: string
  position_x: number
  position_y: number
  brightness: number
  color: string
  created_at: string
}

export interface SaveStarArgs {
  userId: string
  sourceType: StarSource
  sourceRef: string
  label: string
  detail: string
  color: string
}

interface SkyState {
  stars: SkyStar[]
  isLoaded: boolean
  loadStars: (userId: string) => Promise<void>
  saveStar: (args: SaveStarArgs) => Promise<void>
  removeStar: (id: string) => Promise<void>
}

export const useSkyStore = create<SkyState>((set, get) => ({
  stars: [],
  isLoaded: false,

  loadStars: async (userId) => {
    const { data, error } = await supabase
      .from('green_sky_stars')
      .select('*')
      .eq('user_id', userId)
    if (error) {
      console.error('loadStars error', error)
      set({ isLoaded: true })
      return
    }
    set({ stars: (data ?? []) as SkyStar[], isLoaded: true })
  },

  saveStar: async ({ userId, sourceType, sourceRef, label, detail, color }) => {
    // deterministic placement in the upper sky band — same ref always lands in the same spot
    const h = [...sourceRef].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
    const position_x = 8 + (h % 84) // 8–92 %
    const position_y = 6 + ((h >> 8) % 34) // 6–40 % (upper sky)

    const { error } = await supabase.from('green_sky_stars').upsert(
      {
        user_id: userId,
        source_type: sourceType,
        source_ref: sourceRef,
        label,
        detail,
        position_x,
        position_y,
        color,
      },
      { onConflict: 'user_id,source_type,source_ref' },
    )
    if (error) {
      console.error('saveStar error', error)
      return
    }

    // best-effort: mark the matching angel draw(s) as saved
    if (sourceType === 'angel_number') {
      await supabase
        .from('green_angel_draws')
        .update({ saved_to_sky: true })
        .eq('user_id', userId)
        .eq('number', Number(sourceRef))
    }

    await get().loadStars(userId)
  },

  removeStar: async (id) => {
    await supabase.from('green_sky_stars').delete().eq('id', id)
    set((s) => ({ stars: s.stars.filter((st) => st.id !== id) }))
  },
}))
