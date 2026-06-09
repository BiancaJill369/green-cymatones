import type { AngelReading as Reading } from '../../stores/angelStore'

export default function AngelReading({ reading }: { reading: Reading }) {
  return (
    <div className="angel-reading">
      <span className="ar-number">Angel Number {reading.number}</span>
      <h1 className="ar-title">{reading.title}</h1>
      <p className="ar-archetype">{reading.archetype}</p>

      <div className="ar-section">
        <h2>Meaning</h2>
        <p>{reading.meaning}</p>
      </div>
      <div className="ar-section">
        <h2>Message</h2>
        <p>{reading.message}</p>
      </div>
      <div className="ar-section">
        <h2>Action</h2>
        <p>{reading.action}</p>
      </div>

      <span className="ar-hz">✦ Resonates at {reading.resonant_frequency} Hz</span>

      <p className="ar-affirm">{reading.affirmation}</p>
    </div>
  )
}
