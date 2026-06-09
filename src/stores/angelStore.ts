import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

// green_angel_readings — static reference data, 999 rows (numbers 1–999).
export interface AngelReading {
  number: number
  title: string
  archetype: string
  meaning: string
  message: string
  action: string
  affirmation: string
  root_lesson: string
  digital_root: number
  resonant_frequency: number
  category: string
}

// green_angel_draws — per-user reading log (on demand, no daily cap).
export interface AngelDraw {
  id: string
  user_id: string
  number: number
  drawn_at: string
  draw_date: string
  saved_to_sky: boolean
}

interface AngelState {
  enteredNumber: string
  currentReading: AngelReading | null
  drawHistory: AngelDraw[]
  setEnteredNumber: (value: string) => void
  getReading: (n: number) => Promise<AngelReading | null>
  recordDraw: (userId: string, n: number) => Promise<AngelDraw | null>
}

export const useAngelStore = create<AngelState>((set) => ({
  enteredNumber: '',
  currentReading: null,
  drawHistory: [],

  setEnteredNumber: (value) => set({ enteredNumber: value }),

  getReading: async (n) => {
    const { data, error } = await supabase
      .from('green_angel_readings')
      .select('*')
      .eq('number', n)
      .single()
    if (error) {
      console.error('getReading error', error)
      set({ currentReading: null })
      return null
    }
    const reading = data as AngelReading
    set({ currentReading: reading })
    return reading
  },

  recordDraw: async (userId, n) => {
    const { data, error } = await supabase
      .from('green_angel_draws')
      .insert({ user_id: userId, number: n })
      .select('*')
      .single()
    if (error) {
      console.error('recordDraw error', error)
      return null
    }
    const draw = data as AngelDraw
    set((s) => ({ drawHistory: [draw, ...s.drawHistory] }))
    return draw
  },
}))
