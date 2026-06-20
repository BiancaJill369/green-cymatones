import type { OracleDeck, OracleCard, DailyDraw } from '../../stores/oracleStore'
import DeckArt, { DeckFlourishes, deckKind } from './DeckArt'
import CardArt from './CardArt'

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
        return (
          <button
            key={deck.id}
            type="button"
            className="deck"
            disabled={!!drawn}
            onClick={() => !drawn && onSelect(deck.id)}
          >
            <div className="deck-inner">
              <DeckFlourishes />
              <DeckArt kind={deckKind(deck)} />
            </div>
            <div className="deck-plate">
              <div className="deck-name">{deck.name}</div>
              {drawn ? (
                <>
                  {drawn.card && (
                    <span className="deck-card-art">
                      <CardArt kind={deckKind(deck)} title={drawn.card.name} size={52} />
                    </span>
                  )}
                  <div className="deck-card-name">{drawn.card?.name ?? 'Your card'}</div>
                  <span className="deck-pill">DRAWN TODAY</span>
                </>
              ) : (
                <div className="deck-hint">Tap to draw today’s card</div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
