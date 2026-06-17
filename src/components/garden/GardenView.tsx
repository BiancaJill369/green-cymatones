import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '../../styles/garden.css'
import '../../styles/hub.css'
import { useTimeOfDay } from '../../hooks/useTimeOfDay'
import { useAuth } from '../../hooks/useAuth'
import { useGardenStore } from '../../stores/gardenStore'
import type { BedType, GardenElement as El } from '../../stores/gardenStore'
import { useOracleStore } from '../../stores/oracleStore'
import { useSkyStore } from '../../stores/skyStore'
import type { SkyStar } from '../../stores/skyStore'
import SkyBackground from './SkyBackground'
import SkyStars from './SkyStars'
import StarDetailSheet from './StarDetailSheet'
import GardenBed from './GardenBed'
import GardenElement from './GardenElement'
import Creatures from './Creatures'
import Shadowmoss from './Shadowmoss'
import Toasts from '../common/Toasts'
import CharacterCreator, { CHARACTERS } from '../character/CharacterCreator'
import MiniPlayer from './MiniPlayer'
import SkyPanel from './SkyPanel'
import OraclePage from '../../pages/OraclePage'
import AngelPage from '../../pages/AngelPage'
import JournalPage from '../../pages/JournalPage'
import TonesPage from '../../pages/TonesPage'
import EaselPage from '../../pages/EaselPage'

const PANELS = ['oracle', 'angel', 'journal', 'tones', 'easel', 'sky'] as const
type Panel = (typeof PANELS)[number]

const HOTSPOTS: { panel: Panel; emoji: string; label: string; top: number; left: number }[] = [
  { panel: 'angel', emoji: '🔢', label: 'Angel Numbers', top: 18, left: 14 },
  { panel: 'sky', emoji: '✨', label: 'Sky of Stars', top: 12, left: 82 },
  { panel: 'oracle', emoji: '🃏', label: 'Oracle', top: 60, left: 17 },
  { panel: 'tones', emoji: '🍄', label: 'Frequencies', top: 64, left: 44 },
  { panel: 'journal', emoji: '📖', label: 'Greenhouse', top: 60, left: 71 },
  { panel: 'easel', emoji: '🎨', label: 'Art Easel', top: 82, left: 86 },
]

export default function GardenView() {
  const timeOfDay = useTimeOfDay()
  const navigate = useNavigate()
  const { user, greenProfile, signOut } = useAuth()
  const beds = useGardenStore((s) => s.beds)
  const elements = useGardenStore((s) => s.elements)
  const loadGarden = useGardenStore((s) => s.loadGarden)
  const isEditMode = useGardenStore((s) => s.isEditMode)
  const selectedId = useGardenStore((s) => s.selectedId)
  const toggleEditMode = useGardenStore((s) => s.toggleEditMode)
  const selectElement = useGardenStore((s) => s.selectElement)
  const updateElementLocal = useGardenStore((s) => s.updateElementLocal)
  const removeElement = useGardenStore((s) => s.removeElement)
  const saveLayout = useGardenStore((s) => s.saveLayout)
  const cancelEdit = useGardenStore((s) => s.cancelEdit)
  const oracleCards = useOracleStore((s) => s.cards)
  const oracleLoaded = useOracleStore((s) => s.isLoaded)
  const loadDecks = useOracleStore((s) => s.loadDecks)
  const loadStars = useSkyStore((s) => s.loadStars)

  const [readOnlyEl, setReadOnlyEl] = useState<El | null>(null)
  const [selectedStar, setSelectedStar] = useState<SkyStar | null>(null)
  const [showCreator, setShowCreator] = useState(false)

  // Which feature panel is open is driven by the URL (?panel=…), so the pages'
  // existing "Back to garden" links (→ /garden) close the panel for free, and
  // deep links like /garden?panel=oracle work on load.
  const [searchParams, setSearchParams] = useSearchParams()
  const panelParam = searchParams.get('panel')
  const activePanel: Panel | null = (PANELS as readonly string[]).includes(panelParam ?? '')
    ? (panelParam as Panel)
    : null
  const openPanel = (p: Panel) => setSearchParams({ panel: p })
  const closePanel = () => setSearchParams({})

  useEffect(() => {
    if (user?.id) {
      void loadGarden(user.id)
      void loadStars(user.id)
    }
  }, [user?.id, loadGarden, loadStars])

  useEffect(() => {
    if (!oracleLoaded) void loadDecks()
  }, [oracleLoaded, loadDecks])

  const elementsFor = (type: BedType) => {
    const bed = beds.find((b) => b.bed_type === type)
    return bed ? elements.filter((e) => e.bed_id === bed.id) : []
  }

  const trees = useMemo(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200
    const n = Math.max(7, Math.floor(width / 150))
    return Array.from({ length: n }, (_, t) => {
      const scale = 0.7 + Math.random() * 0.9
      const left = 2 + t * (96 / Math.max(1, n - 1)) + (Math.random() * 4 - 2)
      return { left, scale, delay: Math.random() * 1.2, z: Math.round(scale * 10) }
    })
  }, [])

  const fireflies = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: `${(Math.random() * 3).toFixed(2)}s, ${(Math.random() * 2).toFixed(2)}s`,
      })),
    [],
  )

  const name = greenProfile?.display_name || user?.email || 'friend'
  const charDef = greenProfile?.character_type
    ? CHARACTERS.find((c) => c.type === greenProfile.character_type) ?? null
    : null
  const needsCharacter = !!greenProfile && !greenProfile.character_type

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  // tap routing: edit mode selects for editing; otherwise opens the read-only sheet
  const handleSelect = (el: El) => {
    if (isEditMode) selectElement(el.id)
    else setReadOnlyEl(el)
  }
  const handleLongPress = (el: El) => {
    if (!isEditMode) {
      toggleEditMode()
      selectElement(el.id)
    }
  }
  const handleMove = (id: string, x: number, y: number) => updateElementLocal(id, { position_x: x, position_y: y })

  const selectedEl = isEditMode && selectedId ? elements.find((e) => e.id === selectedId) : undefined
  const readOnlyCard = readOnlyEl ? oracleCards.find((c) => c.id === readOnlyEl.card_id) : undefined

  return (
    <div className={`stage${timeOfDay === 'night' ? ' night' : ''}${isEditMode ? ' editing' : ''}`}>
      <SkyBackground timeOfDay={timeOfDay} />
      <SkyStars onSelect={setSelectedStar} />
      <div className="horizon" aria-hidden="true" />

      {/* FOREST FLOOR */}
      <div className="forest">
        <div className="ground" />
        {trees.map((t, i) => (
          <div
            key={`tr-${i}`}
            className="tree"
            style={{ left: `${t.left}%`, transform: `translateX(-50%) scale(${t.scale})`, zIndex: t.z }}
          >
            <div className="tree-inner" style={{ animationDelay: `${t.delay}s` }}>
              <div className="trunk" />
              <div className="canopy" />
            </div>
          </div>
        ))}
        {fireflies.map((f, i) => (
          <div
            key={`ff-${i}`}
            className="firefly"
            style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: f.delay }}
          />
        ))}
        {elementsFor('forest_floor').map((el) => (
          <GardenElement
            key={el.id}
            element={el}
            variant="forest"
            editMode={isEditMode}
            selected={selectedId === el.id}
            onSelect={handleSelect}
            onLongPress={handleLongPress}
            onMove={handleMove}
          />
        ))}
      </div>

      {/* FOREGROUND beds */}
      <div className="foreground">
        <GardenBed
          variant="herb"
          label="Herb Garden"
          planted={elementsFor('herb_garden')}
          editMode={isEditMode}
          selectedId={selectedId}
          onSelect={handleSelect}
          onLongPress={handleLongPress}
          onMove={handleMove}
          divider
        />
        <GardenBed
          variant="meadow"
          label="Wild Meadow"
          planted={elementsFor('wild_meadow')}
          editMode={isEditMode}
          selectedId={selectedId}
          onSelect={handleSelect}
          onLongPress={handleLongPress}
          onMove={handleMove}
        />
      </div>

      <Creatures timeOfDay={timeOfDay} />

      <Shadowmoss />

      {/* in-scene hotspots — tap to open a feature panel over the garden */}
      {!isEditMode &&
        HOTSPOTS.map((h) => (
          <button
            key={h.panel}
            type="button"
            className="hotspot"
            style={{ left: `${h.left}%`, top: `${h.top}%` }}
            onClick={() => openPanel(h.panel)}
          >
            <span className="hs-emoji">{h.emoji}</span>
            <span className="hs-label">{h.label}</span>
          </button>
        ))}

      {/* HUD */}
      <div
        className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-3 text-sm"
        style={{ zIndex: 20 }}
      >
        {isEditMode ? (
          <span className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur">
            Tap a plant to arrange it
          </span>
        ) : charDef ? (
          <button
            type="button"
            onClick={() => setShowCreator(true)}
            title="Change character"
            className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur transition hover:bg-night-sky/70"
          >
            {charDef.emoji} {greenProfile?.character_name} the {charDef.label}
          </button>
        ) : (
          <span className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur">
            Welcome, {name}
          </span>
        )}
        {!isEditMode && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleEditMode}
              className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur transition hover:bg-night-sky/70"
            >
              ✎ Arrange garden
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-night-sky/40 px-3 py-1 text-moon backdrop-blur transition hover:bg-night-sky/70"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      <Toasts />

      {/* saved-star detail sheet */}
      {selectedStar && <StarDetailSheet star={selectedStar} onClose={() => setSelectedStar(null)} />}

      {/* read-only card sheet (outside edit mode) */}
      {!isEditMode && readOnlyEl && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 rounded-t-2xl bg-night-sky/90 px-6 py-5 text-center text-moon backdrop-blur"
        >
          <p className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {readOnlyCard?.name ?? 'A planted seed'}
          </p>
          {readOnlyCard?.affirmation && (
            <p className="italic text-green-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {readOnlyCard.affirmation}
            </p>
          )}
          <button
            type="button"
            onClick={() => setReadOnlyEl(null)}
            className="mt-1 rounded-full border border-green-700/50 px-4 py-1.5 text-sm hover:bg-green-900/40"
          >
            Close
          </button>
        </div>
      )}

      {/* edit control panel for the selected plant */}
      {isEditMode && selectedEl && selectedEl.is_movable !== false && (
        <div
          className="absolute z-40 flex w-[min(92vw,360px)] flex-col gap-3 rounded-2xl border border-green-700/50 bg-night-sky/95 p-4 text-moon backdrop-blur"
          style={{ left: '50%', bottom: '72px', transform: 'translateX(-50%)' }}
        >
          <p className="text-center text-sm text-moon/70">Arrange this plant — drag it to move</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Size</span>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={selectedEl.scale}
              onChange={(e) => updateElementLocal(selectedEl.id, { scale: Number(e.target.value) })}
              className="flex-1 accent-green-400"
            />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>Rotate</span>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={selectedEl.rotation}
              onChange={(e) => updateElementLocal(selectedEl.id, { rotation: Number(e.target.value) })}
              className="flex-1 accent-green-400"
            />
          </label>
          <button
            type="button"
            onClick={() => removeElement(selectedEl.id)}
            className="self-center rounded-full border border-red-400/60 px-4 py-1.5 text-sm text-red-200 hover:bg-red-900/30"
          >
            🗑 Remove
          </button>
        </div>
      )}

      {/* sticky edit action bar */}
      {isEditMode && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-center gap-3 bg-night-sky/90 px-4 py-3 backdrop-blur"
        >
          <button
            type="button"
            onClick={() => void cancelEdit()}
            className="rounded-full border border-green-700/50 px-5 py-2 text-moon hover:bg-green-900/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void saveLayout()}
            className="rounded-full bg-green-500 px-6 py-2 font-semibold text-night-sky hover:bg-green-400"
          >
            Save
          </button>
        </div>
      )}

      {/* Character Creator — first-entry (forced) or "Change character" (dismissable) */}
      {(needsCharacter || showCreator) && (
        <CharacterCreator onClose={() => setShowCreator(false)} dismissable={!needsCharacter} />
      )}

      {/* feature panels over the (still-mounted) garden */}
      {activePanel && (
        <>
          <div className="panel-scrim" onClick={closePanel}>
            <div className="panel-sheet" onClick={(e) => e.stopPropagation()}>
              {activePanel === 'oracle' && <OraclePage />}
              {activePanel === 'angel' && <AngelPage />}
              {activePanel === 'journal' && <JournalPage />}
              {activePanel === 'tones' && <TonesPage />}
              {activePanel === 'easel' && <EaselPage />}
              {activePanel === 'sky' && <SkyPanel />}
            </div>
          </div>
          <button type="button" className="panel-close" onClick={closePanel} aria-label="Close panel">
            ✕
          </button>
        </>
      )}

      {/* persistent global audio — survives panel open/close; hidden while the Tones panel is open */}
      {activePanel !== 'tones' && <MiniPlayer onOpen={() => openPanel('tones')} />}
    </div>
  )
}
