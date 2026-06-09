import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
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
  reset: () => set({ session: null, user: null, ...emptyContext, isLoading: false }),
}))
