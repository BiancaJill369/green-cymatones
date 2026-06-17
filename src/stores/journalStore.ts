import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export interface DailyPrompt {
  id: number
  prompt: string
  category: string | null
  is_active: boolean
  sort_order: number
}

export interface JournalEntry {
  id: string
  user_id: string
  prompt_id: number | null
  mood: string | null
  content: string
  entry_date: string
  created_at: string
}

function dayOfYear(d = new Date()): number {
  const start = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000)
}

interface JournalState {
  prompts: DailyPrompt[]
  todaysPrompt: DailyPrompt | null
  entries: JournalEntry[]
  loadPrompts: () => Promise<void>
  loadEntries: (userId: string) => Promise<void>
  saveEntry: (args: {
    userId: string
    promptId: number | null
    mood: string
    content: string
  }) => Promise<{ isFirst: boolean }>
}

export const useJournalStore = create<JournalState>((set, get) => ({
  prompts: [],
  todaysPrompt: null,
  entries: [],

  loadPrompts: async () => {
    const { data, error } = await supabase
      .from('green_daily_prompts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    if (error) {
      console.error('loadPrompts error', error)
      return
    }
    const prompts = (data ?? []) as DailyPrompt[]
    const todaysPrompt = prompts.length ? prompts[dayOfYear() % prompts.length] : null
    set({ prompts, todaysPrompt })
  },

  loadEntries: async (userId) => {
    const { data, error } = await supabase
      .from('green_journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('loadEntries error', error)
      return
    }
    set({ entries: (data ?? []) as JournalEntry[] })
  },

  saveEntry: async ({ userId, promptId, mood, content }) => {
    const today = new Date().toISOString().slice(0, 10)

    const existing = await supabase
      .from('green_journal_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .limit(1)
    const isFirst = !(existing.data?.length)

    await supabase
      .from('green_journal_entries')
      .insert({ user_id: userId, prompt_id: promptId, mood, content })

    // the journal bloom (Lavender) is granted by the caller via the Chunk 16
    // seed economy, which enforces the once-per-day cap.

    await get().loadEntries(userId)
    return { isFirst }
  },
}))
