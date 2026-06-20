import type { GardenElement as El } from '../../stores/gardenStore'
import GardenElement from './GardenElement'

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
}: Props) {
  // The realistic grass + flowers now live in <GardenForeground>; this bed only
  // hosts the user's actually-planted elements.
  return (
    <div className={`bed ${variant}`}>
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

      {divider && <div className="divider" />}
    </div>
  )
}
