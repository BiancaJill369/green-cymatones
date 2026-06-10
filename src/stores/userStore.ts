import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { GreenSubscription } from '../lib/greenSubscription'
import type { GreenProfile } from '../lib/greenProfile'

export type GreenCharacterType =
  | 'moss_sprite'
  | 'fern_walker'
  | 'vine_weaver'
  | 'pond_guardian'
  | 'bark_sage'
  | 'dew_drop'

interface GreenContext {
  greenSubscription: GreenSubscription | null
  greenProfile: GreenProfile | null
  isAdmin: boolean
}

interface UserState extends GreenContext {
  session: Session | null
  user: User | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setGreenContext: (ctx: GreenContext) => void
  setLoading: (isLoading: boolean) => void
  updateCharacter: (
    userId: string,
    characterType: GreenCharacterType,
    characterName: string,
  ) => Promise<void>
  reset: () => void
}

const emptyContext: GreenContext = {
  greenSubscription: null,
  greenProfile: null,
  isAdmin: false,
}

export const useUserStore = create<UserState>((set) => ({
  session: null,
  user: null,
  ...emptyContext,
  isLoading: true,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setGreenContext: (ctx) => set(ctx),
  setLoading: (isLoading) => set({ isLoading }),
  updateCharacter: async (userId, characterType, characterName) => {
    await supabase
      .from('green_profiles')
      .update({
        character_type: characterType,
        character_name: characterName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    set((s) =>
      s.greenProfile
        ? {
            greenProfile: {
              ...s.greenProfile,
              character_type: characterType,
              character_name: characterName,
            },
          }
        : {},
    )
  },
  reset: () => set({ session: null, user: null, ...emptyContext, isLoading: false }),
}))
