import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { hasActiveGreen } from '../../lib/greenSubscription'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { session, greenSubscription, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night-sky text-moon/70">
        <p className="animate-pulse">Loading…</p>
      </div>
    )
  }
  if (!session) return <Navigate to="/auth" replace />
  if (!hasActiveGreen(greenSubscription)) return <Navigate to="/subscribe" replace />
  return <>{children}</>
}
