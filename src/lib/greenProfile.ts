import { supabase } from './supabaseClient'
import type { GreenCharacterType } from '../stores/userStore'

export interface GreenProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  character_type: GreenCharacterType | null
  character_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
  last_active_at: string
}

// Called ONLY when the user has an active green_subscription.
// Upsert on id: creates the profile on first active login, otherwise
// refreshes email/last_active_at without clobbering other columns.
export async function ensureGreenProfile(
  userId: string,
  email: string | undefined,
): Promise<GreenProfile | null> {
  const { data, error } = await supabase
    .from('green_profiles')
    .upsert(
      { id: userId, email: email ?? '', last_active_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    .select()
    .single()

  if (error) {
    console.error('ensureGreenProfile error', error)
    return null
  }
  return data as GreenProfile
}
