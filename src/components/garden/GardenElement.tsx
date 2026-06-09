import type { GardenElement as El } from '../../stores/gardenStore'

// forest tree ramp per stage: 0 mound → 5 full canopy
const TREE = [
  { h: 22, cw: 20, ch: 20, trunk: 0 },
  { h: 40, cw: 26, ch: 26, trunk: 0 },
  { h: 76, cw: 42, ch: 44, trunk: 24 },
  { h: 116, cw: 60, ch: 64, trunk: 40 },
  { h: 156, cw: 76, ch: 82, trunk: 56 },
  { h: 204, cw: 98, ch: 104, trunk: 72 },
]

// low growth height per stage (herb / meadow)
const LOW_H = [0, 18, 30, 42, 50, 58]

interface Props {
  element: El
  variant: 'forest' | 'low'
  onTap: (el: El) => void
}

export default function GardenElement({ element, variant, onTap }: Props) {
  const stage = Math.max(0, Math.min(5, element.growth_stage))

  if (variant === 'forest') {
    const t = TREE[stage]
    return (
      <button
        type="button"
        className="g-el g-tree"
        style={{ left: `${element.position_x}%` }}
        onClick={() => onTap(element)}
        aria-label="planted tree"
      >
        <span className="gt-canopy" style={{ width: `${t.cw}px`, height: `${t.ch}px` }} />
        {t.trunk > 0 && <span className="gt-trunk" style={{ height: `${t.trunk}px` }} />}
      </button>
    )
  }

  return (
    <button
      type="button"
      className="g-el g-low"
      style={{ left: `${element.position_x}%` }}
      onClick={() => onTap(element)}
      aria-label="planted growth"
    >
      {stage === 0 ? (
        <span className="g-seed" />
      ) : (
        <span className="sprout" style={{ height: `${LOW_H[stage]}px` }}>
          {stage >= 5 && (
            <span className="flower" style={{ background: 'radial-gradient(circle,#fff,#ffd76b)' }} />
          )}
          {stage === 4 && (
            <span
              className="flower"
              style={{ width: '8px', height: '8px', background: '#cdb0ff' }}
            />
          )}
        </span>
      )}
    </button>
  )
}
