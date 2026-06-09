import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { hasActiveGreen } from '../lib/greenSubscription'

export default function SubscribePage() {
  const { session, user, greenSubscription, isLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  const cta = lapsed ? 'Reactivate — $8/mo' : 'Subscribe — $8/mo'
  // A logged-in (lapsed) member already has a known email; a new visitor types one.
  const lockedEmail = session ? user?.email ?? '' : ''

  const startCheckout = async (checkoutEmail: string) => {
    setError(null)
    if (!checkoutEmail) {
      setError('Enter your email to continue.')
      return
    }
    setBusy(true)
    const { data, error: fnError } = await supabase.functions.invoke<{
      url?: string
      error?: string
    }>('green-stripe-checkout', { body: { email: checkoutEmail } })

    if (fnError || !data?.url) {
      setBusy(false)
      setError(data?.error || fnError?.message || 'Could not start checkout. Please try again.')
      return
    }
    // Hand off to Stripe Checkout. The account is created by the webhook after payment.
    window.location.href = data.url
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    startCheckout(session ? lockedEmail : email.trim())
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-night-sky px-6 text-center text-moon">
      <h1 className="text-3xl font-semibold text-green-300">{heading}</h1>
      <p className="max-w-md text-moon/70">
        Bloom membership unlocks the oracle, your living garden, frequency tones,
        the greenhouse journal, and more — for $8/month.
      </p>

      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
        {session ? (
          <p className="text-sm text-moon/60">
            Signed in as <span className="text-moon">{lockedEmail}</span>
          </p>
        ) : (
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-green-700/50 bg-night-sky px-4 py-3 text-moon outline-none focus:border-green-400"
          />
        )}

        <button
          type="submit"
          disabled={busy || (!session && email.trim().length === 0)}
          className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-night-sky transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Starting checkout…' : cta}
        </button>
      </form>

      {error && <p className="max-w-sm text-red-300">{error}</p>}

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
