import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DrawResult } from '../../stores/oracleStore'

interface Props {
  result: DrawResult
  deckName: string
  onBack: () => void
}

export default function CardDraw({ result, deckName, onBack }: Props) {
  const { card, isNew, bedName } = result
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setFlipped(true), 350)
    return () => clearTimeout(id)
  }, [])

  // Forecast revealed line-by-line.
  const lines = useMemo(() => {
    if (!card) return []
    return card.forecast
      .split(/(?<=[.!?])\s+/)
      .map((l) => l.trim())
      .filter(Boolean)
  }, [card])

  if (!card) {
    return (
      <div className="oracle">
        <p>That deck has no card available right now.</p>
        <div className="actions">
          <button type="button" className="btn" onClick={onBack}>
            Back to decks
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="oracle">
      <h1 className="serif">{deckName}</h1>

      <div className="flip">
        <div className={`flip-inner${flipped ? ' flipped' : ''}`}>
          <div className="flip-face flip-front">
            <span className="mark">🌿</span>
            <span className="serif" style={{ fontSize: '1.3rem' }}>
              {deckName}
            </span>
          </div>
          <div className="flip-face flip-back">
            <span className="card-num">No. {card.card_number}</span>
            <span className="card-name">{card.name}</span>
            <span className="card-visual">{card.visual_description}</span>
            <div className="forecast">
              {lines.map((line, i) => (
                <span
                  key={i}
                  className="reveal"
                  style={{ animationDelay: `${0.6 + i * 0.35}s` }}
                >
                  {line}
                </span>
              ))}
            </div>
            <span className="card-affirm">{card.affirmation}</span>
          </div>
        </div>
      </div>

      <p className="seed-note">
        {isNew
          ? `🌱 A seed was planted in your ${bedName ?? 'garden'}.`
          : 'You already drew this deck today.'}
      </p>

      <div className="actions">
        <button type="button" className="btn" onClick={onBack}>
          Back to decks
        </button>
        <Link to="/garden" className="btn btn-primary">
          Back to garden
        </Link>
      </div>
    </div>
  )
}
