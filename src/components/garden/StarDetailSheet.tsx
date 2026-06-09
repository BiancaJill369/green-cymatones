import { useSkyStore } from '../../stores/skyStore'
import type { SkyStar } from '../../stores/skyStore'

interface Props {
  star: SkyStar
  onClose: () => void
}

export default function StarDetailSheet({ star, onClose }: Props) {
  const removeStar = useSkyStore((s) => s.removeStar)

  const handleRemove = async () => {
    await removeStar(star.id)
    onClose()
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center gap-2 rounded-t-2xl bg-night-sky/90 px-6 py-5 text-center text-moon backdrop-blur">
      <p className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif", color: star.color }}>
        {star.label}
      </p>
      <p className="italic text-green-200" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {star.detail}
      </p>
      <div className="mt-1 flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={handleRemove}
          className="rounded-full border border-red-400/60 px-4 py-1.5 text-red-200 hover:bg-red-900/30"
        >
          Remove from sky
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-green-700/50 px-4 py-1.5 hover:bg-green-900/40"
        >
          Close
        </button>
      </div>
    </div>
  )
}
