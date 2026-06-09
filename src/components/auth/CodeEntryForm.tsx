import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'

interface Props {
  email: string
  onBack: () => void
}

export default function CodeEntryForm({ email, onBack }: Props) {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (code.length !== 8) return
    setError(null)
    setSubmitting(true)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    setSubmitting(false)
    if (verifyError) {
      setError("That code didn't match or expired.")
      return
    }
    // Success: session is set. AuthProvider's listener loads green context
    // and AuthPage's gate-route effect navigates from here.
  }

  const handleResend = async () => {
    setError(null)
    setResent(false)
    // Resend re-runs Step 1 (login-only OTP) for the same email.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (otpError) {
      setError('Could not resend the code. Try again.')
      return
    }
    setResent(true)
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <p className="text-center text-sm text-moon/70">
        We sent an 8-digit code to <span className="text-moon">{email}</span>.
      </p>

      <input
        id="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="\d{8}"
        maxLength={8}
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
        placeholder="00000000"
        className="rounded-lg border border-green-700/50 bg-night-sky px-4 py-3 text-center text-2xl tracking-[0.4em] text-moon outline-none focus:border-green-400"
      />

      <button
        type="submit"
        disabled={submitting || code.length !== 8}
        className="rounded-lg bg-green-500 px-4 py-3 font-semibold text-night-sky transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Verifying…' : 'Verify & enter'}
      </button>

      {error && <p className="text-center text-red-300">{error}</p>}
      {resent && !error && (
        <p className="text-center text-green-300">New code sent.</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-moon/60 hover:text-moon"
        >
          ← Use a different email
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="text-green-300 hover:text-green-200"
        >
          Resend code
        </button>
      </div>
    </form>
  )
}
