import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import type { BedType } from './gardenStore'

export interface OracleDeck {
  id: string
  name: string
  slug: string
  description: string | null
  theme_color: string
  bed_type: BedType
  card_count: number
  is_active: boolean
  created_at: string
}

export interface OracleCard {
  id: string
  deck_id: string
  card_number: number
  name: string
  slug: string
  visual_description: string
  forecast: string
  affirmation: string
  seed_type: string
  created_at: string
}

export interface DailyDraw {
  id: string
  user_id: string
  card_id: string
  deck_id: string
  drawn_at: string
  draw_date: string
  seed_dropped: boolean
  seed_planted: boolean
}

interface OracleState {
  decks: OracleDeck[]
  cards: OracleCard[]
  todayDraws: DailyDraw[]
  isLoaded: boolean
  loadDecks: () => Promise<void>
}

export const useOracleStore = create<OracleState>((set) => ({
  decks: [],
  cards: [],
  todayDraws: [],
  isLoaded: false,

  // Reference data: 3 decks + 99 cards (static). UI wiring + draws arrive in 6b.
  loadDecks: async () => {
    try {
      const [decksRes, cardsRes] = await Promise.all([
        supabase.from('green_oracle_decks').select('*').order('name'),
        supabase.from('green_oracle_cards').select('*').order('card_number'),
      ])
      if (decksRes.error) throw decksRes.error
      if (cardsRes.error) throw cardsRes.error
      set({
        decks: (decksRes.data ?? []) as OracleDeck[],
        cards: (cardsRes.data ?? []) as OracleCard[],
        isLoaded: true,
      })
    } catch (err) {
      console.error('loadDecks error', err)
      set({ isLoaded: true })
    }
  },
}))
