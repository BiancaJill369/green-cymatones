import type { GardenElement } from '../../stores/gardenStore'

interface Props {
  label: string
  // base greenery seed count (purely decorative until real elements arrive)
  greeneryCount?: number
  elements: GardenElement[]
}

export default function GardenBed({ label, greeneryCount = 5, elements }: Props) {
  const greenery = Array.from({ length: greeneryCount }, (_, i) => {
    const left = 12 + (i * 76) / Math.max(1, greeneryCount - 1)
    const delay = (i % 5) * 0.6
    return { left, delay }
  })

  return (
    <div className="garden-bed">
      <span className="garden-bed__label">{label}</span>

      {/* decorative greenery base so empty beds still read as alive */}
      {greenery.map((g, i) => (
        <span
          key={`g-${i}`}
          className="garden-sprout"
          style={{ left: `${g.left}%`, animationDelay: `${g.delay}s` }}
        />
      ))}

      {/* real planted elements (none yet; mapped by position when they exist) */}
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
