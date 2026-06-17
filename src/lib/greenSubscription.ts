import { supabase } from './supabaseClient'

export type GreenSubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'unpaid'
  | 'trialing'

export interface GreenSubscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: GreenSubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// Reads the caller's own subscription row (UNIQUE(user_id)).
// Returns null only when there is genuinely no row; a Supabase/RLS error is
// logged loudly so an errored read is never silently mistaken for "no membership".
export async function fetchGreenSubscription(
  userId: string,
): Promise<GreenSubscription | null> {
  const { data, error } = await supabase
    .from('green_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    // Do NOT swallow this — an RLS/transient failure here must be visible,
    // not treated as a definitive "not a member".
    console.error('[green] fetchGreenSubscription failed (read error, not "no membership"):', error)
    return null
  }
  return (data as GreenSubscription | null) ?? null
}

// Active access = status 'active' OR 'trialing'.
export function hasActiveGreen(sub: GreenSubscription | null): boolean {
  return !!sub && (sub.status === 'active' || sub.status === 'trialing')
}
