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

// One subscription row per user (UNIQUE(user_id)). Returns null if none exists.
export async function fetchGreenSubscription(
  userId: string,
): Promise<GreenSubscription | null> {
  const { data, error } = await supabase
    .from('green_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('fetchGreenSubscription error', error)
    return null
  }
  return (data as GreenSubscription | null) ?? null
}

// Active access = status 'active' OR 'trialing'.
export function hasActiveGreen(sub: GreenSubscription | null): boolean {
  return !!sub && (sub.status === 'active' || sub.status === 'trialing')
}
