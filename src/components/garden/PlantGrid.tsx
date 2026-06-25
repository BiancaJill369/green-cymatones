export interface Cell {
  x: number
  y: number
}

// A section's placement grid in bed-local percentages (x = left%, y = bottom%).
// The beds are now tall (~64% of the scene), so the grid is many rows deep.
const COLS = 4
const ROWS = 6
const Y_MIN = 14
const Y_MAX = 92

export function gridCells(): Cell[] {
  const cells: Cell[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push({
        x: ((c + 0.5) / COLS) * 100,
        y: Y_MIN + ((r + 0.5) / ROWS) * (Y_MAX - Y_MIN),
      })
    }
  }
  return cells
}

const CELL_HALF_X = 100 / COLS / 2
const CELL_HALF_Y = (Y_MAX - Y_MIN) / ROWS / 2

/**
 * The visible placement grid for the active section while planting a seed.
 * Renders one tappable cell per slot; a cell holding an existing plant is
 * marked occupied and can't be planted on (one plant per cell).
 */
export default function PlantGrid({
  occupied,
  onPick,
}: {
  occupied: Cell[]
  onPick: (cell: Cell) => void
}) {
  return (
    <div className="plant-grid">
      {gridCells().map((cell, i) => {
        const taken = occupied.some(
          (o) => Math.abs(o.x - cell.x) < CELL_HALF_X && Math.abs(o.y - cell.y) < CELL_HALF_Y * 1.4,
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
