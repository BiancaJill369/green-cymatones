import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/tones.css'
import { useAuth } from '../hooks/useAuth'
import { useFrequencyStore } from '../stores/frequencyStore'
import type { Track } from '../stores/frequencyStore'
import TrackList from '../components/tones/TrackList'
import TonePlayer from '../components/tones/TonePlayer'

const TUNING_THRESHOLD = 180

export default function TonesPage() {
  const { user } = useAuth()
  const tracksByCategory = useFrequencyStore((s) => s.tracksByCategory)
  const currentTrack = useFrequencyStore((s) => s.currentTrack)
  const todaySeconds = useFrequencyStore((s) => s.todaySeconds)
  const tuningEarned = useFrequencyStore((s) => s.tuningEarned)
  const loadTracks = useFrequencyStore((s) => s.loadTracks)
  const loadListening = useFrequencyStore((s) => s.loadListening)
  const playTrack = useFrequencyStore((s) => s.playTrack)

  useEffect(() => {
    void loadTracks()
  }, [loadTracks])
  useEffect(() => {
    if (user?.id) void loadListening(user.id)
  }, [user?.id, loadListening])
  // NOTE: audio is intentionally NOT stopped when this panel closes — the single
  // global Howler instance (frequencyStore) keeps playing across panels. The
  // garden MiniPlayer controls stop/pause. Listening still flushes on pause/stop/
  // track-change and every ~10s.

  const categories = Object.keys(tracksByCategory)
  const onPlay = (t: Track) => {
    if (user?.id) playTrack(t, user.id)
  }
  const pct = Math.min(100, (todaySeconds / TUNING_THRESHOLD) * 100)

  return (
    <div className="tones">
      <div className="wrap">
        <h1>Frequency Tones</h1>

        {!tuningEarned && (
          <div className="reward">
            Listen 3 minutes today to grow a tuning mushroom
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
              {Math.min(todaySeconds, TUNING_THRESHOLD)} / {TUNING_THRESHOLD}s
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9bbfa6' }}>Loading tones…</p>
        ) : (
          categories.map((cat) => (
            <section key={cat}>
              <h2 className="cat">{cat}</h2>
              <TrackList
                tracks={tracksByCategory[cat]}
                currentId={currentTrack?.id ?? null}
                onPlay={onPlay}
              />
            </section>
          ))
        )}

        <Link to="/garden" className="back-link">
          Back to garden
        </Link>
      </div>

      <TonePlayer />
    </div>
  )
}
