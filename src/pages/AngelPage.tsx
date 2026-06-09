import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/angel.css'
import { useAuth } from '../hooks/useAuth'
import { useAngelStore } from '../stores/angelStore'
import AngelKeypad from '../components/oracle/AngelKeypad'
import AngelReadingView from '../components/oracle/AngelReading'

export default function AngelPage() {
  const { user } = useAuth()
  const currentReading = useAngelStore((s) => s.currentReading)
  const getReading = useAngelStore((s) => s.getReading)
  const recordDraw = useAngelStore((s) => s.recordDraw)

  const [busy, setBusy] = useState(false)

  // AngelKeypad validates 1–999 internally and calls this with the number.
  const handleReveal = async (n: number) => {
    setBusy(true)
    const reading = await getReading(n)
    if (reading && user?.id) await recordDraw(user.id, n)
    setBusy(false)
  }

  const readAnother = () => useAngelStore.setState({ currentReading: null })

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

  return <AngelKeypad onReveal={handleReveal} busy={busy} />
}
