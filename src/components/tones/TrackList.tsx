import type { Track } from '../../stores/frequencyStore'

function mmss(sec: number | null): string {
  if (sec == null) return ''
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function tagline(t: Track): string | null {
  const v = t.metadata?.tagline
  return typeof v === 'string' ? v : null
}

interface Props {
  tracks: Track[]
  currentId: string | null
  onPlay: (t: Track) => void
}

export default function TrackList({ tracks, currentId, onPlay }: Props) {
  return (
    <div className="track-list">
      {tracks.map((t) => {
        const tag = tagline(t)
        return (
          <button
            key={t.id}
            type="button"
            className={`track-row${t.id === currentId ? ' active' : ''}`}
            onClick={() => onPlay(t)}
          >
            <div className="tr-main">
              <div className="tr-name">{t.name}</div>
              {tag && <div className="tr-tag">{tag}</div>}
            </div>
            <div className="tr-meta">
              {t.hz != null && <span className="chip hz">{t.hz} Hz</span>}
              {t.related_chakra && <span className="chip">{t.related_chakra}</span>}
              {t.duration_seconds != null && <span>{mmss(t.duration_seconds)}</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
