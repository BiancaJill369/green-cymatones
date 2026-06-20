import type { Track } from '../../stores/frequencyStore'
import { layeredFor, hasLayered } from '../../lib/trackInfo'

/**
 * Track info sheet — the green port of violet's remedy reading surface.
 *   mode='description'  the ⓘ preview before playing (lead + TCM), with Play
 *   mode='details'      shown while a track plays — the full layered info
 */
export default function TrackInfo({
  track,
  mode,
  onPlay,
  onClose,
}: {
  track: Track
  mode: 'description' | 'details'
  onPlay?: () => void
  onClose: () => void
}) {
  const l = layeredFor(track)
  const showAll = mode === 'details'

  return (
    <div className="ti-scrim" onClick={onClose}>
      <aside className="ti-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={track.name}>
        <button type="button" className="ti-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <span className="ti-eyebrow">{mode === 'description' ? 'Description' : 'Details'}</span>
        <h2 className="ti-name">{track.name}</h2>
        <div className="ti-meta">
          {track.hz != null && <span className="chip hz">{track.hz} Hz</span>}
          {track.related_chakra && <span className="chip">{track.related_chakra}</span>}
          {track.category && <span className="chip">{track.category}</span>}
        </div>

        <div className="ti-body">
          {!hasLayered(l) ? (
            <p className="ti-empty">The deeper notes for this frequency are still being written.</p>
          ) : (
            <>
              <Section eyebrow="A gentle invitation" title="The lead" body={l.lead} />
              <Section eyebrow="Traditional Chinese Medicine" title="TCM lens" body={l.tcm} />
              {showAll && <Section eyebrow="Western framing" title="Western view" body={l.western} />}
              {showAll && <Section eyebrow="The deeper pattern" title="Underneath" body={l.root} />}
              {showAll && l.related.length > 0 && (
                <div className="ti-section">
                  <p className="ti-sec-eyebrow">Related</p>
                  <h3 className="ti-sec-title">conditions this meets</h3>
                  <ul className="ti-chips">
                    {l.related.map((c, i) => (
                      <li key={i} className="ti-chip">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {mode === 'description' && onPlay && (
          <button type="button" className="ti-play" onClick={onPlay}>
            ▶ Play this frequency
          </button>
        )}
      </aside>
    </div>
  )
}

function Section({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  if (!body) return null
  return (
    <section className="ti-section">
      <p className="ti-sec-eyebrow">{eyebrow}</p>
      <h3 className="ti-sec-title">{title}</h3>
      <p className="ti-sec-body">{body}</p>
    </section>
  )
}
