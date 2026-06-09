interface Props {
  value: string
  error: string | null
  canReveal: boolean
  busy: boolean
  onDigit: (d: string) => void
  onBackspace: () => void
  onClear: () => void
  onReveal: () => void
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function AngelKeypad({
  value,
  error,
  canReveal,
  busy,
  onDigit,
  onBackspace,
  onClear,
  onReveal,
}: Props) {
  return (
    <div className="angel-keypad">
      <div className="angel-display" aria-label="entered number">
        {value || '—'}
      </div>
      {error && <p className="angel-error">{error}</p>}

      <div className="keys">
        {DIGITS.map((d) => (
          <button key={d} type="button" className="key" onClick={() => onDigit(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="key key-util" onClick={onClear}>
          Clear
        </button>
        <button type="button" className="key" onClick={() => onDigit('0')}>
          0
        </button>
        <button type="button" className="key key-util" onClick={onBackspace} aria-label="Backspace">
          ⌫
        </button>
      </div>

      <button type="button" className="key-reveal" disabled={!canReveal || busy} onClick={onReveal}>
        {busy ? 'Revealing…' : 'Reveal'}
      </button>
    </div>
  )
}
