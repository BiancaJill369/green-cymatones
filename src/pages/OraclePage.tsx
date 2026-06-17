import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/oracle.css'
import { useAuth } from '../hooks/useAuth'
import { useOracleStore } from '../stores/oracleStore'
import type { DrawResult } from '../stores/oracleStore'
import type { BedType } from '../stores/gardenStore'
import { useSeedStore } from '../stores/seedStore'
import { useToastStore } from '../stores/toastStore'
import DeckSelector from '../components/oracle/DeckSelector'
import type { DrawnEntry } from '../components/oracle/DeckSelector'
import CardDraw from '../components/oracle/CardDraw'

// each oracle deck grants its own bloom (one per deck per day)
const ORACLE_SOURCE: Record<BedType, string> = {
  herb_garden: 'oracle_herb',
  forest_floor: 'oracle_forest',
  wild_meadow: 'oracle_wildmeadow',
}

export default function OraclePage() {
  const { user } = useAuth()
  const decks = useOracleStore((s) => s.decks)
  const cards = useOracleStore((s) => s.cards)
  const todayDraws = useOracleStore((s) => s.todayDraws)
  const isLoaded = useOracleStore((s) => s.isLoaded)
  const loadDecks = useOracleStore((s) => s.loadDecks)
  const loadTodayDraws = useOracleStore((s) => s.loadTodayDraws)
  const drawCard = useOracleStore((s) => s.drawCard)
  const grantSeed = useSeedStore((s) => s.grantSeed)
  const loadTodayGrants = useSeedStore((s) => s.loadTodayGrants)
  const pushToast = useToastStore((s) => s.push)

  const [activeDeckId, setActiveDeckId] = useState<string | null>(null)
  const [result, setResult] = useState<DrawResult | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isLoaded) void loadDecks()
  }, [isLoaded, loadDecks])

  useEffect(() => {
    if (user?.id) {
      void loadTodayDraws(user.id)
      void loadTodayGrants(user.id)
    }
  }, [user?.id, loadTodayDraws, loadTodayGrants])

  const drawnByDeck = useMemo(() => {
    const map = new Map<string, DrawnEntry>()
    todayDraws.forEach((draw) => {
      map.set(draw.deck_id, { draw, card: cards.find((c) => c.id === draw.card_id) })
    })
    return map
  }, [todayDraws, cards])

  const allDrawn = decks.length > 0 && drawnByDeck.size >= decks.length
  const activeDeck = decks.find((d) => d.id === activeDeckId)

  const handleSelect = async (deckId: string) => {
    if (busy || !user?.id) return
    setActiveDeckId(deckId)
    setBusy(true)
    const r = await drawCard(deckId, user.id)
    setBusy(false)
    setResult(r)

    // grant the deck's bloom seed (capped one per deck per day)
    if (r.isNew && r.bedType) {
      const sourceKey = ORACLE_SOURCE[r.bedType]
      const g = await grantSeed({ userId: user.id, activityType: sourceKey, sourceKey })
      if (g.granted && g.bloom) {
        pushToast(`🌱 You earned a ${g.bloom.display_name} seed — it'll bloom in your garden tomorrow`)
      }
    }
  }

  const handleBack = () => {
    setActiveDeckId(null)
    setResult(null)
  }

  // Draw-in-progress / result takeover view.
  if (activeDeckId && result) {
    return <CardDraw result={result} deckName={activeDeck?.name ?? 'Oracle'} onBack={handleBack} />
  }

  return (
    <div className="oracle">
      <h1>Today’s Oracle</h1>
      <p className="subtitle">One draw per deck, each day. Every card plants a seed.</p>

      {!isLoaded ? (
        <p className="subtitle" style={{ marginTop: 28 }}>
          Loading your decks…
        </p>
      ) : decks.length === 0 ? (
        <p className="subtitle" style={{ marginTop: 28 }}>
          No decks available right now.
        </p>
      ) : (
        <>
          <DeckSelector decks={decks} drawnByDeck={drawnByDeck} onSelect={handleSelect} />
          {busy && (
            <p className="subtitle" style={{ marginTop: 16 }}>
              Drawing your card…
            </p>
          )}
          {allDrawn && <p className="come-back">Come back tomorrow for fresh cards.</p>}
        </>
      )}

      <div className="actions">
        <Link to="/garden" className="btn">
          Back to garden
        </Link>
      </div>
    </div>
  )
}
