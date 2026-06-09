import type { GardenElement } from '../../stores/gardenStore'

type Variant = 'low' | 'forest'

interface Props {
  label: string
  variant: Variant
  elements: GardenElement[]
}

// Placeholder forest greenery — a few of these are tall enough to cross the horizon.
const TREES = [
  { left: 8, h: 150, cw: 70, ch: 84 },
  { left: 22, h: 120, cw: 56, ch: 66 },
  { left: 37, h: 250, cw: 96, ch: 120 },
  { left: 52, h: 140, cw: 62, ch: 74 },
  { left: 67, h: 270, cw: 104, ch: 130 },
  { left: 80, h: 128, cw: 58, ch: 68 },
  { left: 92, h: 165, cw: 72, ch: 86 },
]
const MUSHROOMS = [{ left: 15 }, { left: 45 }, { left: 74 }]

export default function GardenBed({ label, variant, elements }: Props) {
  if (variant === 'forest') {
    return (
      <div className="garden-bed--forest">
        <span className="garden-bed__label">{label}</span>

        {TREES.map((t, i) => (
          <span
            key={`t-${i}`}
            className="garden-tree"
            style={{ left: `${t.left}%`, height: `${t.h}px`, animationDelay: `${(i % 4) * 0.5}s` }}
          >
            <span className="garden-tree__canopy" style={{ width: `${t.cw}px`, height: `${t.ch}px` }} />
            <span className="garden-tree__trunk" />
          </span>
        ))}
        {MUSHROOMS.map((m, i) => (
          <span key={`m-${i}`} className="garden-mushroom" style={{ left: `${m.left}%` }} />
        ))}

        {/* real planted trees/mushrooms (none yet; mapped by position when they exist) */}
        {elements.map((el) => (
          <span
            key={el.id}
            className="garden-tree"
            style={{ left: `${el.position_x}%`, height: `${130 + el.growth_stage * 28}px` }}
          >
            <span className="garden-tree__canopy" style={{ width: '70px', height: '84px' }} />
            <span className="garden-tree__trunk" />
          </span>
        ))}
      </div>
    )
  }

  // low bed (herb / wild meadow)
  const greenery = Array.from({ length: 5 }, (_, i) => ({ left: 12 + i * 19, delay: (i % 5) * 0.6 }))
  return (
    <div className="garden-bed">
      <span className="garden-bed__label">{label}</span>

      {greenery.map((g, i) => (
        <span
          key={`g-${i}`}
          className="garden-sprout"
          style={{ left: `${g.left}%`, animationDelay: `${g.delay}s` }}
        />
      ))}

      {elements.map((el) => (
        <span
          key={el.id}
          className="garden-sprout"
          style={{
            left: `${el.position_x}%`,
            bottom: `${el.position_y}%`,
            transform: `scale(${el.scale}) rotate(${el.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
