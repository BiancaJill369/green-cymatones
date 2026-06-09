import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

interface Props {
  onSuccess: (email: string) => void
}

export default function EmailEntryForm({ onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    // LOGIN ONLY — shouldCreateUser:false means auth never creates an account.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    })
    setSubmitting(false)
    if (otpError) {
      setError('No Green account for this email.')
      return
    }
    onSuccess(email.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-2 text-left">
        <label htmlFor="email" className="text-sm text-moon/70">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-lg border border-green-700/50 bg-night-sky px-4 py-3 text-moon outline-none focus:border-green-400"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || email.trim().length === 0}
        className="rounded-lg bg-green-500 px-4 py-3 font-semibold text-night-sky transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Sending code…' : 'Send my login code'}
      </button>

      {error && (
        <div className="flex flex-col gap-2 rounded-lg border border-green-700/40 bg-green-900/30 p-4 text-center">
          <p className="text-moon/90">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/subscribe')}
            className="font-semibold text-green-300 underline underline-offset-4 hover:text-green-200"
          >
            Subscribe to join
          </button>
        </div>
      )}
    </form>
  )
}
