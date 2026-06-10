import { useState } from 'react'
import { useArtStore } from '../../stores/artStore'
import type { ArtCreation } from '../../stores/artStore'

export const GAME_LABELS: Record<string, string> = {
  garden_coloring: 'Garden Coloring',
  pixel_mosaic: 'Pixel Mosaic',
  mandala_bloom: 'Mandala Bloom',
  zen_rake: 'Zen Garden',
  petal_drop: 'Petal Drop',
  watercolor_meadow: 'Watercolor Meadow',
}

export default function Gallery() {
  const creations = useArtStore((s) => s.creations)
  const deleteCreation = useArtStore((s) => s.deleteCreation)
  const [viewing, setViewing] = useState<ArtCreation | null>(null)

  if (!creations.length) {
    return <p className="easel-empty">Your gallery is empty — make something calm.</p>
  }

  return (
    <>
      <div className="gallery-grid">
        {creations.map((c) => (
          <button key={c.id} type="button" className="gallery-item" onClick={() => setViewing(c)}>
            <img src={c.thumbnail} alt={c.title ?? 'art'} />
            <span className="gi-label">{GAME_LABELS[c.game_type] ?? c.game_type}</span>
            <span className="gi-date">{c.created_at?.slice(0, 10)}</span>
          </button>
        ))}
      </div>

      {viewing && (
        <div className="gallery-view" onClick={() => setViewing(null)}>
          <div className="gv-card" onClick={(e) => e.stopPropagation()}>
            <img src={viewing.thumbnail} alt={viewing.title ?? 'art'} />
            <div className="gv-meta">
              {viewing.title || 'Untitled'} · {GAME_LABELS[viewing.game_type] ?? viewing.game_type}
            </div>
            <div className="gv-actions">
              <button
                type="button"
                className="gv-del"
                onClick={async () => {
                  await deleteCreation(viewing.id)
                  setViewing(null)
                }}
              >
                Delete
              </button>
              <button type="button" className="gv-close" onClick={() => setViewing(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
