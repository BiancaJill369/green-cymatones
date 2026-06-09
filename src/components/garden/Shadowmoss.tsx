import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useShadowmossStore } from '../../stores/shadowmossStore'

/* NOTE: placeholder cat sprite. Swap the <svg> + sm* keyframes with the approved
   shadowmoss_cat_mock.html art when available — behavior below stays unchanged. */
const STYLES = `
.shadowmoss{position:absolute;bottom:27%;z-index:7;width:92px;cursor:pointer;transition:left 7s ease-in-out}
.shadowmoss.reduced{transition:none}
.sm-flip{transform-origin:center bottom}
.sm-cat{display:block;width:92px;height:auto;animation:smBob 3.2s ease-in-out infinite}
@keyframes smBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.sm-tail{transform-origin:14px 6px;animation:smTail 2.6s ease-in-out infinite}
@keyframes smTail{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(11deg)}}
.sm-eyes{transform-origin:center;animation:smBlink 5.5s infinite}
@keyframes smBlink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.12)}}
.sm-bubble{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:10px;width:max(180px,46vw);max-width:240px;
  background:rgba(11,16,38,.94);border:1px solid rgba(207,232,122,.5);border-radius:14px;padding:10px 12px;color:#f4f9f0;
  font-family:'Cormorant Garamond',serif;text-align:center;backdrop-filter:blur(4px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.sm-bubble::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:7px solid transparent;border-top-color:rgba(11,16,38,.94)}
.sm-text{display:block;font-size:1.15rem;line-height:1.3;font-style:italic;color:#eaf3d6}
.sm-heart{margin-top:6px;background:none;border:none;font-size:1.2rem;cursor:pointer;line-height:1}
.sm-saved{display:block;margin-top:4px;font-family:'Inter',system-ui,sans-serif;font-size:.7rem;color:#cfe87a}
@media (prefers-reduced-motion:reduce){
  .shadowmoss{transition:none}
  .sm-cat,.sm-tail,.sm-eyes{animation:none}
}
`

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Shadowmoss() {
  const { user } = useAuth()
  const loadStatements = useShadowmossStore((s) => s.loadStatements)
  const pickStatement = useShadowmossStore((s) => s.pickStatement)
  const recordEncounter = useShadowmossStore((s) => s.recordEncounter)
  const toggleFavorite = useShadowmossStore((s) => s.toggleFavorite)
  const current = useShadowmossStore((s) => s.currentStatement)

  const [x, setX] = useState(18)
  const [facing, setFacing] = useState(1)
  const [bubble, setBubble] = useState(false)
  const xRef = useRef(18)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    void loadStatements()
  }, [loadStatements])

  const speak = () => {
    const s = pickStatement()
    if (s && user?.id) void recordEncounter(user.id, s.id)
    setBubble(true)
  }

  // gentle wander → pause → speak → resume loop (occasional, not constant)
  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms))
    }

    const sit = () => {
      if (cancelled) return
      speak()
      after(6500, () => {
        if (cancelled) return
        setBubble(false)
        after(1500, move)
      })
    }
    const move = () => {
      if (cancelled) return
      setBubble(false)
      const target = 8 + Math.random() * 78
      setFacing(target >= xRef.current ? 1 : -1)
      xRef.current = target
      setX(target)
      after(7200, sit) // matches the CSS left transition
    }

    if (reduced.current) {
      after(2500, () => {
        if (!cancelled) speak()
      })
    } else {
      after(3500, move)
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return (
    <div
      className={`shadowmoss${reduced.current ? ' reduced' : ''}`}
      style={{ left: `${x}%` }}
      onClick={() => speak()}
      role="button"
      aria-label="Shadowmoss the garden spirit"
    >
      <style>{STYLES}</style>

      {bubble && current && (
        <div className="sm-bubble" onClick={(e) => e.stopPropagation()}>
          <span className="sm-text">{current.text}</span>
          <button
            type="button"
            className="sm-heart"
            onClick={() => user?.id && void toggleFavorite(user.id)}
            aria-label={current.isFavorite ? 'Remove from sky' : 'Save to sky'}
          >
            {current.isFavorite ? '💛' : '🤍'}
          </button>
          {current.isFavorite && <span className="sm-saved">✨ saved to your sky</span>}
        </div>
      )}

      <div className="sm-flip" style={{ transform: `scaleX(${facing})` }}>
        <svg className="sm-cat" viewBox="0 0 110 98" fill="none" aria-hidden="true">
          {/* tail */}
          <path
            className="sm-tail"
            d="M86 72 q24 -4 20 -30 q-3 -14 -14 -11 q9 4 7 15 q-3 16 -18 17 z"
            fill="#141414"
          />
          {/* fluffy body */}
          <path
            d="M24 94 q-12 -1 -10 -28 q2 -22 19 -31 q-4 -11 3 -18 q6 7 12 5 q9 -5 16 0 q7 2 13 -5 q7 7 3 18 q17 9 19 31 q2 27 -10 28 z"
            fill="#1b1b1b"
          />
          {/* chest fluff highlight */}
          <path
            d="M46 92 q-7 -16 9 -30 q16 14 9 30 z"
            fill="#262626"
          />
          {/* ears */}
          <path d="M33 32 l-7 -20 q12 2 16 14 z" fill="#1b1b1b" />
          <path d="M77 32 l7 -20 q-12 2 -16 14 z" fill="#1b1b1b" />
          {/* eyes (blink) */}
          <g className="sm-eyes">
            <ellipse cx="44" cy="46" rx="6.5" ry="8.5" fill="#cfe87a" />
            <ellipse cx="66" cy="46" rx="6.5" ry="8.5" fill="#cfe87a" />
            <ellipse cx="44" cy="47" rx="2.2" ry="6.5" fill="#0c0c0c" />
            <ellipse cx="66" cy="47" rx="2.2" ry="6.5" fill="#0c0c0c" />
          </g>
          {/* nose */}
          <path d="M52 56 h6 l-3 4 z" fill="#caa46a" />
          {/* whiskers */}
          <path d="M40 58 q-12 -1 -18 2 M40 61 q-12 2 -17 7" stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round" />
          <path d="M70 58 q12 -1 18 2 M70 61 q12 2 17 7" stroke="#3a3a3a" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}
