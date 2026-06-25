export interface Cell {
  x: number
  y: number
}

// Portrait placement grid in section-local percentages (x = left%, y = bottom%).
// Beds are tall, so the default is many rows; each bed section is 4 cols, so the
// two side-by-side beds read as an 8-wide × 12-deep garden grid.
const DEF_COLS = 4
const DEF_ROWS = 12
const Y_MIN = 8
const Y_MAX = 94

export function gridCells(rows = DEF_ROWS, cols = DEF_COLS): Cell[] {
  const cells: Cell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        x: ((c + 0.5) / cols) * 100,
        y: Y_MIN + ((r + 0.5) / rows) * (Y_MAX - Y_MIN),
      })
    }
  }
  return cells
}

/**
 * The visible placement grid for the active section while planting a seed.
 * One tappable cell per slot; a cell holding an existing plant is occupied and
 * can't be planted on (one plant per cell).
 */
export default function PlantGrid({
  occupied,
  onPick,
  rows = DEF_ROWS,
  cols = DEF_COLS,
}: {
  occupied: Cell[]
  onPick: (cell: Cell) => void
  rows?: number
  cols?: number
}) {
  const halfX = 100 / cols / 2
  const halfY = (Y_MAX - Y_MIN) / rows / 2
  return (
    <div className="plant-grid">
      {gridCells(rows, cols).map((cell, i) => {
        const taken = occupied.some(
          (o) => Math.abs(o.x - cell.x) < halfX && Math.abs(o.y - cell.y) < halfY * 1.4,
        )
        return (
          <button
            key={i}
            type="button"
            className={`plant-cell${taken ? ' taken' : ''}`}
            style={{ left: `${cell.x}%`, bottom: `${cell.y}%` }}
            disabled={taken}
            onClick={() => !taken && onPick(cell)}
            aria-label={taken ? 'Occupied' : 'Plant here'}
          />
        )
      })}
    </div>
  )
}
