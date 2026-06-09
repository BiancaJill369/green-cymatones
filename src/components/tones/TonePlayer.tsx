import { useAuth } from '../../hooks/useAuth'
import { useFrequencyStore } from '../../stores/frequencyStore'

function mmss(sec: number | null): string {
  if (sec == null) return '—'
  const s = Math.max(0, Math.round(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function TonePlayer() {
  const { user } = useAuth()
  const track = useFrequencyStore((s) => s.currentTrack)
  const isPlaying = useFrequencyStore((s) => s.isPlaying)
  const pos = useFrequencyStore((s) => s.positionSec)
  const togglePlay = useFrequencyStore((s) => s.togglePlay)

  if (!track) return null

  const dur = track.duration_seconds ?? 0
  const pct = dur > 0 ? Math.min(100, (pos / dur) * 100) : 0
  const tag = typeof track.metadata?.tagline === 'string' ? track.metadata.tagline : null

  return (
    <div className="tone-player">
      <div className="inner">
        <div className="row">
          <button
            type="button"
            className="pp"
            onClick={() => user?.id && togglePlay(user.id)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tp-name">{track.name}</div>
            {tag && <div className="tp-notes">{tag}</div>}
          </div>
        </div>
        <div className="row">
          <div className="progress">
            <span style={{ width: `${pct}%` }} />
          </div>
          <div className="time">
            {mmss(pos)} / {dur ? mmss(dur) : '—'}
          </div>
        </div>
        {track.notes && <div className="tp-notes">{track.notes}</div>}
      </div>
    </div>
  )
}
