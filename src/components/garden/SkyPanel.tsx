import { useSkyStore } from '../../stores/skyStore'

export default function SkyPanel() {
  const stars = useSkyStore((s) => s.stars)
  const removeStar = useSkyStore((s) => s.removeStar)

  return (
    <div className="sky-panel">
      <h1>Your Sky of Stars</h1>
      <p className="sky-sub">Angel numbers and I AM statements you’ve pinned as stars.</p>

      {stars.length === 0 ? (
        <p className="sky-empty">
          No stars yet — save an angel number, or favorite an I AM from Shadowmoss, to light one.
        </p>
      ) : (
        <ul className="sky-list">
          {stars.map((s) => (
            <li key={s.id} className="sky-row">
              <span className="sky-dot" style={{ color: s.color }} />
              <div className="sky-text">
                <span className="sky-label">{s.label}</span>
                <span className="sky-detail">{s.detail}</span>
              </div>
              <button
                type="button"
                className="sky-remove"
                onClick={() => void removeStar(s.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
