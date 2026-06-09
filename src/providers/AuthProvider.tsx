import { useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { useUserStore } from '../stores/userStore'
import { fetchGreenSubscription, hasActiveGreen } from '../lib/greenSubscription'
import { ensureGreenProfile } from '../lib/greenProfile'
import type { GreenProfile } from '../lib/greenProfile'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useUserStore((s) => s.setSession)
  const setGreenContext = useUserStore((s) => s.setGreenContext)
  const setLoading = useUserStore((s) => s.setLoading)
  const reset = useUserStore((s) => s.reset)

  useEffect(() => {
    let active = true

    const loadGreenContext = async (user: User) => {
      const sub = await fetchGreenSubscription(user.id)
      let profile: GreenProfile | null = null
      if (hasActiveGreen(sub)) {
        profile = await ensureGreenProfile(user.id, user.email)
      }
      if (!active) return
      setGreenContext({
        greenSubscription: sub,
        greenProfile: profile,
        isAdmin: profile?.is_admin === true,
      })
      setLoading(false)
    }

    // onAuthStateChange fires INITIAL_SESSION on subscribe, so this also
    // covers the initial page load / restored session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        setSession(session)
        setLoading(true)
        void loadGreenContext(session.user)
      } else {
        reset()
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [setSession, setGreenContext, setLoading, reset])

  return <>{children}</>
}
