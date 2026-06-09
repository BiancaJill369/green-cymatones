import { useEffect } from 'react'
import type { AngelReading as Reading } from '../../stores/angelStore'
import { useAuth } from '../../hooks/useAuth'
import { useSkyStore } from '../../stores/skyStore'

export default function AngelReading({ reading }: { reading: Reading }) {
  const { user } = useAuth()
  const stars = useSkyStore((s) => s.stars)
  const isLoaded = useSkyStore((s) => s.isLoaded)
  const loadStars = useSkyStore((s) => s.loadStars)
  const saveStar = useSkyStore((s) => s.saveStar)

  useEffect(() => {
    if (user?.id && !isLoaded) void loadStars(user.id)
  }, [user?.id, isLoaded, loadStars])

  const saved = stars.some(
    (s) => s.source_type === 'angel_number' && s.source_ref === String(reading.number),
  )

  const onSave = () => {
    if (!user?.id || saved) return
    void saveStar({
      userId: user.id,
      sourceType: 'angel_number',
      sourceRef: String(reading.number),
      label: String(reading.number),
      detail: reading.affirmation,
      color: '#ffe9a8',
    })
  }

  return (
    <div className="angel-reading">
      <span className="ar-number">Angel Number {reading.number}</span>
      <h1 className="ar-title">{reading.title}</h1>
      <p className="ar-archetype">{reading.archetype}</p>

      <div className="ar-section">
        <h2>Meaning</h2>
        <p>{reading.meaning}</p>
      </div>
      <div className="ar-section">
        <h2>Message</h2>
        <p>{reading.message}</p>
      </div>
      <div className="ar-section">
        <h2>Action</h2>
        <p>{reading.action}</p>
      </div>

      <span className="ar-hz">✦ Resonates at {reading.resonant_frequency} Hz</span>

      <p className="ar-affirm">{reading.affirmation}</p>

      {saved ? (
        <p style={{ marginTop: '14px', color: '#aef0a0', fontWeight: 600 }}>Saved to your sky ✓</p>
      ) : (
        <button
          type="button"
          onClick={onSave}
          style={{
            marginTop: '16px',
            padding: '11px 24px',
            borderRadius: '999px',
            border: '1px solid rgba(255,233,168,.7)',
            background: 'linear-gradient(135deg,#ffe9a8,#e8c66a)',
            color: '#2a2410',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ✦ Save to Sky
        </button>
      )}
    </div>
  )
}
