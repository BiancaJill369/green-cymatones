import type { OracleDeck, OracleCard, DailyDraw } from '../../stores/oracleStore'

export interface DrawnEntry {
  draw: DailyDraw
  card: OracleCard | undefined
}

interface Props {
  decks: OracleDeck[]
  drawnByDeck: Map<string, DrawnEntry>
  onSelect: (deckId: string) => void
}

export default function DeckSelector({ decks, drawnByDeck, onSelect }: Props) {
  return (
    <div className="deck-grid">
      {decks.map((deck) => {
        const drawn = drawnByDeck.get(deck.id)
        const tint = `${deck.theme_color}22`
        return (
          <button
            key={deck.id}
            type="button"
            className="deck-tile"
            disabled={!!drawn}
            onClick={() => !drawn && onSelect(deck.id)}
            style={{ borderColor: deck.theme_color, background: tint }}
          >
            <span className="deck-name">{deck.name}</span>
            {drawn ? (
              <>
                <span className="deck-card-name">{drawn.card?.name ?? 'Your card'}</span>
                <span className="deck-drawn-tag" style={{ color: deck.theme_color }}>
                  Drawn today
                </span>
              </>
            ) : (
              <span className="deck-hint">Tap to draw today’s card</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
