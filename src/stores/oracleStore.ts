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

export interface DrawResult {
  card: OracleCard | undefined
  isNew: boolean
  bedName?: string
}

const BED_LABELS: Record<BedType, string> = {
  herb_garden: 'Herb Garden',
  wild_meadow: 'Wild Meadow',
  forest_floor: 'Forest Floor',
}

interface OracleState {
  decks: OracleDeck[]
  cards: OracleCard[]
  todayDraws: DailyDraw[]
  isLoaded: boolean
  loadDecks: () => Promise<void>
  loadTodayDraws: (userId: string) => Promise<void>
  drawCard: (deckId: string, userId: string) => Promise<DrawResult>
}

export const useOracleStore = create<OracleState>((set, get) => ({
  decks: [],
  cards: [],
  todayDraws: [],
  isLoaded: false,

  // Reference data: 3 decks + 99 cards (static).
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

  loadTodayDraws: async (userId) => {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('green_daily_draws')
      .select('*')
      .eq('user_id', userId)
      .eq('draw_date', today)
    if (error) {
      console.error('loadTodayDraws error', error)
      return
    }
    set({ todayDraws: (data ?? []) as DailyDraw[] })
  },

  // One draw per deck per day. Records a draw AND drops a seed into the matching bed.
  drawCard: async (deckId, userId) => {
    const { decks, cards } = get()
    const deck = decks.find((d) => d.id === deckId)
    if (!deck) return { card: undefined, isNew: false }
    const bedName = BED_LABELS[deck.bed_type]
    const today = new Date().toISOString().slice(0, 10)

    // 1. already drawn this deck today?
    const existing = await supabase
      .from('green_daily_draws')
      .select('*')
      .eq('user_id', userId)
      .eq('deck_id', deckId)
      .eq('draw_date', today)
      .maybeSingle()
    if (existing.data) {
      return { card: cards.find((c) => c.id === existing.data.card_id), isNew: false, bedName }
    }

    // 2. pick a card, avoiding this deck's last 5 draws
    const deckCards = cards.filter((c) => c.deck_id === deckId)
    const recentRes = await supabase
      .from('green_daily_draws')
      .select('card_id')
      .eq('user_id', userId)
      .eq('deck_id', deckId)
      .order('drawn_at', { ascending: false })
      .limit(5)
    const recent: string[] = recentRes.data?.map((r) => r.card_id) ?? []
    const pool = deckCards.filter((c) => !recent.includes(c.id))
    const source = pool.length ? pool : deckCards
    const card = source[Math.floor(Math.random() * source.length)]
    if (!card) return { card: undefined, isNew: false, bedName }

    // 3. record the draw
    const inserted = await supabase
      .from('green_daily_draws')
      .insert({ user_id: userId, deck_id: deckId, card_id: card.id })
      .select('*')
      .single()

    // 4. drop a seed into the matching bed
    const bed = await supabase
      .from('green_garden_beds')
      .select('id')
      .eq('user_id', userId)
      .eq('bed_type', deck.bed_type)
      .single()
    if (bed.data) {
      await supabase.from('green_garden_elements').insert({
        user_id: userId,
        bed_id: bed.data.id,
        element_type: 'seed',
        seed_source: 'oracle_draw',
        card_id: card.id,
        position_x: 10 + Math.random() * 80,
        position_y: 15 + Math.random() * 65,
        growth_stage: 0,
      })
    }

    // reflect the new draw in local state
    if (inserted.data) {
      set((state) => ({
        todayDraws: [
          ...state.todayDraws.filter((d) => d.deck_id !== deckId),
          inserted.data as DailyDraw,
        ],
      }))
    }

    return { card, isNew: true, bedName }
  },
}))
