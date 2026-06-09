const MOODS = [
  'calm',
  'joyful',
  'grateful',
  'tender',
  'restless',
  'heavy',
  'hopeful',
  'inspired',
]

interface Props {
  value: string
  onChange: (mood: string) => void
}

export default function MoodPicker({ value, onChange }: Props) {
  return (
    <div className="mood-row" role="group" aria-label="Pick a mood">
      {MOODS.map((m) => (
        <button
          key={m}
          type="button"
          className={`mood-chip${value === m ? ' selected' : ''}`}
          aria-pressed={value === m}
          onClick={() => onChange(value === m ? '' : m)}
        >
          {m}
        </button>
      ))}
    </div>
  )
}
