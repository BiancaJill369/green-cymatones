import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmailEntryForm from '../components/auth/EmailEntryForm'
import CodeEntryForm from '../components/auth/CodeEntryForm'
import { useAuth } from '../hooks/useAuth'

export default function AuthPage() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const { session } = useAuth()
  const navigate = useNavigate()

  // Once a session exists (after verifyOtp), just leave the auth page.
  // Do NOT decide membership here — that would race loadGreenContext and can
  // bounce an active member to /subscribe. Home + AuthGuard make the call once
  // membership has loaded (isLoading === false).
  useEffect(() => {
    if (session) navigate('/', { replace: true })
  }, [session, navigate])

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-night-sky px-6 text-moon">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-green-300">Log in to your garden</h1>
        <p className="mt-1 text-sm text-moon/60">
          {step === 'email'
            ? 'Enter your email and we’ll send an 8-digit code.'
            : 'Check your inbox for the code.'}
        </p>
      </div>

      {step === 'email' ? (
        <EmailEntryForm
          onSuccess={(value) => {
            setEmail(value)
            setStep('code')
          }}
        />
      ) : (
        <CodeEntryForm email={email} onBack={() => setStep('email')} />
      )}
    </main>
  )
}
