import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { useSkyStore } from './skyStore'

export interface IamStatement {
  id: number
  statement_number: number
  text: string
  category: string | null
  is_active: boolean
}

type CurrentStatement = IamStatement & { isFavorite: boolean }

interface ShadowmossState {
  statements: IamStatement[]
  currentStatement: CurrentStatement | null
  currentEncounterId: string | null
  recentIds: number[]
  loadStatements: () => Promise<void>
  pickStatement: () => CurrentStatement | null
  recordEncounter: (userId: string, statementId: number) => Promise<void>
  toggleFavorite: (userId: string) => Promise<void>
}

export const useShadowmossStore = create<ShadowmossState>((set, get) => ({
  statements: [],
  currentStatement: null,
  currentEncounterId: null,
  recentIds: [],

  loadStatements: async () => {
    const { data, error } = await supabase
      .from('green_iam_statements')
      .select('*')
      .eq('is_active', true)
    if (error) {
      console.error('loadStatements error', error)
      return
    }
    set({ statements: (data ?? []) as IamStatement[] })
  },

  pickStatement: () => {
    const { statements, recentIds } = get()
    if (!statements.length) return null
    const pool = statements.filter((s) => !recentIds.includes(s.id))
    const source = pool.length ? pool : statements
    const picked = source[Math.floor(Math.random() * source.length)]
    const current: CurrentStatement = { ...picked, isFavorite: false }
    set({
      currentStatement: current,
      currentEncounterId: null,
      recentIds: [picked.id, ...recentIds].slice(0, 3),
    })
    return current
  },

  recordEncounter: async (userId, statementId) => {
    const { data, error } = await supabase
      .from('green_shadowmoss_encounters')
      .insert({ user_id: userId, statement_id: statementId })
      .select('id')
      .single()
    if (error) {
      console.error('recordEncounter error', error)
      return
    }
    set({ currentEncounterId: (data?.id as string) ?? null })
  },

  toggleFavorite: async (userId) => {
    const s = get().currentStatement
    const encounterId = get().currentEncounterId
    if (!s) return
    const fav = !s.isFavorite

    if (encounterId) {
      await supabase
        .from('green_shadowmoss_encounters')
        .update({ is_favorite: fav })
        .eq('id', encounterId)
    }
    set({ currentStatement: { ...s, isFavorite: fav } })

    const sky = useSkyStore.getState()
    if (fav) {
      await sky.saveStar({
        userId,
        sourceType: 'iam_statement',
        sourceRef: String(s.statement_number),
        label: s.text.split(' ').slice(0, 3).join(' '), // e.g. "I AM rooted"
        detail: s.text,
        color: '#cfe87a',
      })
    } else {
      await sky.removeBySource(userId, 'iam_statement', String(s.statement_number))
    }
  },
}))
