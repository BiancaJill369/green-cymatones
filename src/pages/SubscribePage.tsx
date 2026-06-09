import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasActiveGreen } from '../lib/greenSubscription'

export default function SubscribePage() {
  const { session, greenSubscription, isLoading, signOut } = useAuth()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky text-moon/70">
        <p className="animate-pulse">Loading…</p>
      </div>
    )
  }

  // Active subscribers never need this page.
  if (session && hasActiveGreen(greenSubscription)) {
    return <Navigate to="/garden" replace />
  }

  const lapsed = !!greenSubscription // a row exists but is not active = lapsed
  const heading = lapsed ? 'Reactivate your membership' : 'Join the Green Garden'
  const cta = lapsed ? 'Reactivate — $15/mo' : 'Subscribe — $15/mo'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-night-sky px-6 text-center text-moon">
      <h1 className="text-3xl font-semibold text-green-300">{heading}</h1>
      <p className="max-w-md text-moon/70">
        Bloom membership unlocks the oracle, your living garden, frequency tones,
        the greenhouse journal, and more — for $15/month.
      </p>

      <button
        type="button"
        disabled
        title="Checkout arrives in the next update"
        className="cursor-not-allowed rounded-lg bg-green-500 px-6 py-3 font-semibold text-night-sky opacity-50"
      >
        {cta} · Checkout (next chunk)
      </button>

      <div className="mt-2 text-sm text-moon/60">
        {session ? (
          <button type="button" onClick={handleSignOut} className="hover:text-moon">
            Sign out
          </button>
        ) : (
          <Link to="/auth" className="text-green-300 hover:text-green-200">
            Already a member? Log in
          </Link>
        )}
      </div>
    </main>
  )
}
