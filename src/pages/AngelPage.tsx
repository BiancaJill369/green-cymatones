import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/angel.css'
import { useAuth } from '../hooks/useAuth'
import { useAngelStore } from '../stores/angelStore'
import AngelKeypad from '../components/oracle/AngelKeypad'
import AngelReadingView from '../components/oracle/AngelReading'

export default function AngelPage() {
  const { user } = useAuth()
  const enteredNumber = useAngelStore((s) => s.enteredNumber)
  const currentReading = useAngelStore((s) => s.currentReading)
  const setEnteredNumber = useAngelStore((s) => s.setEnteredNumber)
  const getReading = useAngelStore((s) => s.getReading)
  const recordDraw = useAngelStore((s) => s.recordDraw)

  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const parsed = parseInt(enteredNumber, 10)
  const canReveal = enteredNumber.length > 0 && parsed >= 1 && parsed <= 999

  // read latest from the store so fast taps never drop a digit (stale-closure-safe)
  const onDigit = (d: string) => {
    const cur = useAngelStore.getState().enteredNumber
    if (cur.length >= 3) return // max 3 digits
    setError(null)
    setEnteredNumber(cur + d)
  }
  const onBackspace = () => {
    const cur = useAngelStore.getState().enteredNumber
    setError(null)
    setEnteredNumber(cur.slice(0, -1))
  }
  const onClear = () => {
    setError(null)
    setEnteredNumber('')
  }

  const onReveal = async () => {
    const n = parseInt(enteredNumber, 10) // strips leading zeros: 007 -> 7
    if (!n || n < 1 || n > 999) {
      setError('Enter 1–999')
      return
    }
    setBusy(true)
    setError(null)
    const reading = await getReading(n)
    if (!reading) {
      setBusy(false)
      setError('Could not load that reading. Try again.')
      return
    }
    if (user?.id) await recordDraw(user.id, n)
    setBusy(false)
  }

  const readAnother = () => {
    setEnteredNumber('')
    setError(null)
    useAngelStore.setState({ currentReading: null })
  }

  if (currentReading) {
    return (
      <div className="angel">
        <AngelReadingView reading={currentReading} />
        <button type="button" className="btn" onClick={readAnother}>
          Read another number
        </button>
        <Link to="/garden" className="back-link">
          Back to garden
        </Link>
      </div>
    )
  }

  return (
    <div className="angel">
      <h1>Angel Numbers</h1>
      <p className="subtitle">Enter a number 1–999 and reveal its message.</p>
      <AngelKeypad
        value={enteredNumber}
        error={error}
        canReveal={canReveal}
        busy={busy}
        onDigit={onDigit}
        onBackspace={onBackspace}
        onClear={onClear}
        onReveal={onReveal}
      />
      <Link to="/garden" className="back-link">
        Back to garden
      </Link>
    </div>
  )
}
