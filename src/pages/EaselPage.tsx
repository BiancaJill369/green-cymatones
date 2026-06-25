import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/easel.css'
import { useAuth } from '../hooks/useAuth'
import { useArtStore } from '../stores/artStore'
import type { GameHandle } from '../components/easel/gameTypes'
import GardenColoring from '../components/easel/games/GardenColoring'
import PixelMosaic from '../components/easel/games/PixelMosaic'
import MandalaBloom from '../components/easel/games/MandalaBloom'
import ZenGarden from '../components/easel/games/ZenGarden'
import SaveBar from '../components/easel/SaveBar'
import Gallery from '../components/easel/Gallery'

type LiveGame = 'garden_coloring' | 'pixel_mosaic' | 'mandala_bloom' | 'zen_rake'

const GAMES = [
  { type: 'garden_coloring', label: 'Garden Coloring', emoji: '🌼', desc: 'Fill a line-art garden', live: true },
  { type: 'pixel_mosaic', label: 'Pixel Mosaic', emoji: '🔲', desc: 'Paint a stained-glass grid', live: true },
  { type: 'mandala_bloom', label: 'Mandala Bloom', emoji: '🌀', desc: 'Mirrored mandala strokes', live: true },
  { type: 'zen_rake', label: 'Zen Garden', emoji: '🏯', desc: 'Rake flowing sand', live: true },
  { type: 'petal_drop', label: 'Petal Drop', emoji: '🌸', desc: 'Stamp flower petals', live: false },
  { type: 'watercolor_meadow', label: 'Watercolor Meadow', emoji: '🖌️', desc: 'Soft blending brush', live: false },
] as const

export default function EaselPage() {
  const { user } = useAuth()
  const loadCreations = useArtStore((s) => s.loadCreations)
  const [active, setActive] = useState<LiveGame | null>(null)
  const [showGallery, setShowGallery] = useState(false)
  const gameRef = useRef<GameHandle | null>(null)

  useEffect(() => {
    if (user?.id) void loadCreations(user.id)
  }, [user?.id, loadCreations])

  if (active) {
    const label = GAMES.find((g) => g.type === active)?.label
    return (
      <div className="easel">
        <div className="easel-head">
          <button type="button" className="easel-back" onClick={() => setActive(null)}>
            ← Easel
          </button>
          <h1>{label}</h1>
        </div>
        {active === 'garden_coloring' ? (
          <GardenColoring ref={gameRef} />
        ) : active === 'pixel_mosaic' ? (
          <PixelMosaic ref={gameRef} />
        ) : active === 'mandala_bloom' ? (
          <MandalaBloom ref={gameRef} />
        ) : (
          <ZenGarden ref={gameRef} />
        )}
        <SaveBar
          gameType={active}
          gameRef={gameRef}
          onSaved={() => {
            setActive(null)
            setShowGallery(true)
          }}
        />
      </div>
    )
  }

  return (
    <div className="easel">
      <h1>Art Easel</h1>
      <p className="easel-sub">A quiet place to make something with your hands.</p>

      <div className="easel-tabs">
        <button
          type="button"
          className={showGallery ? '' : 'active'}
          onClick={() => setShowGallery(false)}
        >
          Art
        </button>
        <button
          type="button"
          className={showGallery ? 'active' : ''}
          onClick={() => setShowGallery(true)}
        >
          My Gallery
        </button>
      </div>

      {showGallery ? (
        <Gallery />
      ) : (
        <div className="game-grid">
          {GAMES.map((g) => (
            <button
              key={g.type}
              type="button"
              className={`game-tile${g.live ? '' : ' soon'}`}
              disabled={!g.live}
              onClick={() => g.live && setActive(g.type as LiveGame)}
            >
              <span className="gt-emoji">{g.emoji}</span>
              <span className="gt-name">{g.label}</span>
              <span className="gt-desc">{g.live ? g.desc : 'Coming soon'}</span>
            </button>
          ))}
        </div>
      )}

      <Link to="/garden" className="easel-back-link">
        Back to garden
      </Link>
    </div>
  )
}
