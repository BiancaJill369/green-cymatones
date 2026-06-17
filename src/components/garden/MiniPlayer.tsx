import { useAuth } from '../../hooks/useAuth'
import { useFrequencyStore } from '../../stores/frequencyStore'

// Persistent now-playing pill. Reads the single global Howler instance in
// frequencyStore, so it survives any panel open/close.
export default function MiniPlayer({ onOpen }: { onOpen: () => void }) {
  const { user } = useAuth()
  const track = useFrequencyStore((s) => s.currentTrack)
  const isPlaying = useFrequencyStore((s) => s.isPlaying)
  const togglePlay = useFrequencyStore((s) => s.togglePlay)
  const stopPlayback = useFrequencyStore((s) => s.stopPlayback)

  if (!track) return null

  return (
    <div className="mini-player">
      <button
        type="button"
        className="mp-pp"
        onClick={() => user?.id && togglePlay(user.id)}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button type="button" className="mp-info" onClick={onOpen}>
        <div className="mp-name">🍄 {track.name}</div>
        <div className="mp-group">{track.category}</div>
      </button>
      <button
        type="button"
        className="mp-stop"
        onClick={() => user?.id && void stopPlayback(user.id)}
        aria-label="Stop"
      >
        ✕
      </button>
    </div>
  )
}
