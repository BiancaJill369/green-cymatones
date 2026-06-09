import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function GardenPage() {
  const { user, greenProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const name = greenProfile?.display_name || user?.email || 'friend'

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-night-sky px-6 text-center text-moon">
      <h1 className="text-3xl font-semibold text-green-300">Welcome, {name}</h1>
      <p className="text-moon/60">Your garden will grow here.</p>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-lg border border-green-700/50 px-5 py-2.5 text-moon transition hover:bg-green-900/40"
      >
        Sign out
      </button>
    </main>
  )
}
