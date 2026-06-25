import type { GardenElement as El } from '../../stores/gardenStore'
import GardenElement from './GardenElement'
import PlantGrid, { type Cell } from './PlantGrid'

interface Props {
  variant: 'herb' | 'meadow'
  label: string
  planted: El[]
  editMode: boolean
  selectedId: string | null
  onSelect: (el: El) => void
  onLongPress: (el: El) => void
  onMove: (id: string, x: number, y: number) => void
  divider?: boolean
  planting?: { occupied: Cell[]; onPick: (cell: Cell) => void }
}

export default function GardenBed({
  variant,
  label,
  planted,
  editMode,
  selectedId,
  onSelect,
  onLongPress,
  onMove,
  divider,
  planting,
}: Props) {
  // The realistic grass + flowers now live in <GardenForeground>; this bed only
  // hosts the user's actually-planted elements (and the placement grid while planting).
  return (
    <div className={`bed ${variant}${planting ? ' planting' : ''}`}>
      <div className="bed-label">{label}</div>

      {planted.map((el) => (
        <GardenElement
          key={el.id}
          element={el}
          variant="low"
          editMode={editMode}
          selected={selectedId === el.id}
          onSelect={onSelect}
          onLongPress={onLongPress}
          onMove={onMove}
        />
      ))}

      {planting && <PlantGrid occupied={planting.occupied} onPick={planting.onPick} />}

      {divider && <div className="divider" />}
    </div>
  )
}
