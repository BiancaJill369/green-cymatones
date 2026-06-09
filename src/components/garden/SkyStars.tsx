import { useSkyStore } from '../../stores/skyStore'
import type { SkyStar } from '../../stores/skyStore'

export default function SkyStars({ onSelect }: { onSelect: (star: SkyStar) => void }) {
  const stars = useSkyStore((s) => s.stars)

  return (
    <div className="sky-stars">
      {stars.map((star) => (
        <button
          key={star.id}
          type="button"
          className="sky-star"
          style={{
            left: `${star.position_x}%`,
            top: `${star.position_y}%`,
            color: star.color,
            opacity: star.brightness,
          }}
          onClick={() => onSelect(star)}
          aria-label={`saved star ${star.label}`}
        />
      ))}
    </div>
  )
}
