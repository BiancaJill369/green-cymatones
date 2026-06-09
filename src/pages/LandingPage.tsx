import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasActiveGreen } from '../lib/greenSubscription'

export default function LandingPage() {
  const { session, greenSubscription, isLoading } = useAuth()

  // Active members go straight to their garden.
  if (!isLoading && session && hasActiveGreen(greenSubscription)) {
    return <Navigate to="/garden" replace />
  }

  return (
    <main className="min-h-screen w-full bg-night-sky text-moon flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-green-300">
          green.cymatones.com
        </h1>
        <p className="text-lg text-moon/80">
          The Green Oracle &amp; Garden — coming soon.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/subscribe"
          className="rounded-lg bg-green-500 px-6 py-3 font-semibold text-night-sky transition hover:bg-green-400"
        >
          Subscribe — $15/mo
        </Link>
        <Link
          to="/auth"
          className="rounded-lg border border-green-700/50 px-6 py-3 font-semibold text-moon transition hover:bg-green-900/40"
        >
          Log in
        </Link>
      </div>
    </main>
  )
}
