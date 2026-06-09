import { supabase } from '../lib/supabaseClient'
import { useUserStore } from '../stores/userStore'

export function useAuth() {
  const session = useUserStore((s) => s.session)
  const user = useUserStore((s) => s.user)
  const greenSubscription = useUserStore((s) => s.greenSubscription)
  const greenProfile = useUserStore((s) => s.greenProfile)
  const isAdmin = useUserStore((s) => s.isAdmin)
  const isLoading = useUserStore((s) => s.isLoading)

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    session,
    user,
    greenSubscription,
    greenProfile,
    isAdmin,
    isLoading,
    signOut,
  }
}
