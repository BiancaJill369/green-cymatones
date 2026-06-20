import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/tones.css'
import { useAuth } from '../hooks/useAuth'
import { useFrequencyStore } from '../stores/frequencyStore'
import type { Track } from '../stores/frequencyStore'
import { useSeedStore } from '../stores/seedStore'
import TrackList from '../components/tones/TrackList'
import TonePlayer from '../components/tones/TonePlayer'
import TrackInfo from '../components/tones/TrackInfo'

const TONES_THRESHOLD = 420 // 7 minutes/day

export default function TonesPage() {
  const { user } = useAuth()
  const tracksByCategory = useFrequencyStore((s) => s.tracksByCategory)
  const currentTrack = useFrequencyStore((s) => s.currentTrack)
  const todaySeconds = useFrequencyStore((s) => s.todaySeconds)
  const loadTracks = useFrequencyStore((s) => s.loadTracks)
  const loadListening = useFrequencyStore((s) => s.loadListening)
  const playTrack = useFrequencyStore((s) => s.playTrack)
  const tonesEarned = useSeedStore((s) => s.todayGrants.includes('tones'))
  const loadTodayGrants = useSeedStore((s) => s.loadTodayGrants)

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [infoTrack, setInfoTrack] = useState<Track | null>(null)
  const [infoMode, setInfoMode] = useState<'description' | 'details'>('description')

  useEffect(() => {
    void loadTracks()
  }, [loadTracks])
  useEffect(() => {
    if (user?.id) {
      void loadListening(user.id)
      void loadTodayGrants(user.id)
    }
  }, [user?.id, loadListening, loadTodayGrants])
  // NOTE: audio is intentionally NOT stopped when this panel closes — the single
  // global Howler instance (frequencyStore) keeps playing across panels. The
  // garden MiniPlayer controls stop/pause. Listening still flushes on pause/stop/
  // track-change and every ~10s.

  const categories = Object.keys(tracksByCategory)
  const onPlay = (t: Track) => {
    if (user?.id) playTrack(t, user.id)
  }
  const onDescribe = (t: Track) => {
    setInfoMode('description')
    setInfoTrack(t)
  }
  const openDetails = () => {
    if (currentTrack) {
      setInfoMode('details')
      setInfoTrack(currentTrack)
    }
  }
  const pct = Math.min(100, (todaySeconds / TONES_THRESHOLD) * 100)
  const groupTracks = selectedGroup ? tracksByCategory[selectedGroup] : null

  return (
    <div className="tones">
      <div className="wrap">
        <h1>Frequency Mushroom</h1>

        {tonesEarned ? (
          <div className="reward">🌳 You earned today's Resonance Willow seed — back tomorrow</div>
        ) : (
          <div className="reward">
            Listen 7 minutes today to earn a Resonance Willow seed
            <div className="bar">
              <span style={{ width: `${pct}%` }} />
            </div>
            <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
              {Math.min(todaySeconds, TONES_THRESHOLD)} / {TONES_THRESHOLD}s
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#9bbfa6' }}>Loading tones…</p>
        ) : groupTracks ? (
          <>
            <button type="button" className="tone-group-back" onClick={() => setSelectedGroup(null)}>
              ← All groups
            </button>
            <h2 className="cat">{selectedGroup}</h2>
            <TrackList
              tracks={groupTracks}
              currentId={currentTrack?.id ?? null}
              onPlay={onPlay}
              onDescribe={onDescribe}
            />
          </>
        ) : (
          <div className="tone-groups">
            {categories.map((g) => (
              <button key={g} type="button" className="tone-group" onClick={() => setSelectedGroup(g)}>
                <span className="tg-name">{g}</span>
                <span className="tg-count">{tracksByCategory[g].length} tones</span>
              </button>
            ))}
          </div>
        )}

        <Link to="/garden" className="back-link">
          Back to garden
        </Link>
      </div>

      <TonePlayer onDetails={openDetails} />

      {infoTrack && (
        <TrackInfo
          track={infoTrack}
          mode={infoMode}
          onClose={() => setInfoTrack(null)}
          onPlay={
            infoMode === 'description'
              ? () => {
                  onPlay(infoTrack)
                  setInfoTrack(null)
                }
              : undefined
          }
        />
      )}
    </div>
  )
}
