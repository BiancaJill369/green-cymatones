import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export interface ArtCreation {
  id: string
  user_id: string
  game_type: string
  title: string | null
  thumbnail: string // data URL (jpeg)
  state: unknown // game-specific, for re-editing
  created_at: string
}

interface ArtState {
  creations: ArtCreation[]
  loadCreations: (userId: string) => Promise<void>
  saveCreation: (args: {
    userId: string
    gameType: string
    title: string
    thumbnail: string
    state: unknown
  }) => Promise<void>
  deleteCreation: (id: string) => Promise<void>
}

export const useArtStore = create<ArtState>((set) => ({
  creations: [],

  loadCreations: async (userId) => {
    const { data, error } = await supabase
      .from('green_art_creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('loadCreations error', error)
      return
    }
    set({ creations: (data ?? []) as ArtCreation[] })
  },

  saveCreation: async ({ userId, gameType, title, thumbnail, state }) => {
    const { data, error } = await supabase
      .from('green_art_creations')
      .insert({ user_id: userId, game_type: gameType, title, thumbnail, state })
      .select('*')
      .single()
    if (error) {
      console.error('saveCreation error', error)
      return
    }
    if (data) set((s) => ({ creations: [data as ArtCreation, ...s.creations] }))
  },

  deleteCreation: async (id) => {
    await supabase.from('green_art_creations').delete().eq('id', id)
    set((s) => ({ creations: s.creations.filter((c) => c.id !== id) }))
  },
}))
