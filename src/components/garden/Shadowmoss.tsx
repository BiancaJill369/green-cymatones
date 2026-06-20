import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useShadowmossStore } from '../../stores/shadowmossStore'
import { useCompanionsStore } from '../../stores/companionsStore'

/* Shadowmoss sprite + animations lifted from shadowmoss_cat_mock.html.
   Facing-flip lives on .sm-flip and bob/breathe on .sm-cat so both apply
   (the mock had them on one element, which clobbered the flip). */
const STYLES = `
.shadowmoss{position:absolute;bottom:23%;z-index:7;cursor:pointer;transition:left 6s ease-in-out}
.shadowmoss.reduced{transition:none}
.sm-flip{transform-origin:center bottom}
.sm-cat{display:block;width:clamp(96px,28vw,138px);height:auto;overflow:visible;
  filter:drop-shadow(0 8px 10px rgba(0,0,0,.4));animation:smBob 6s ease-in-out infinite}
.shadowmoss.paused .sm-cat{animation:smBreathe 3.5s ease-in-out infinite}
@keyframes smBob{0%,100%{transform:translateY(0)}25%{transform:translateY(-5px)}75%{transform:translateY(-5px)}}
@keyframes smBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.shadowmoss .tail{transform-box:fill-box;transform-origin:78% 60%;animation:smTail 3.5s ease-in-out infinite}
@keyframes smTail{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(10deg)}}
.shadowmoss .eyelid{transform-box:fill-box;transform-origin:center;animation:smBlink 5.5s ease-in-out infinite}
@keyframes smBlink{0%,94%,100%{transform:scaleY(0)}96%,98%{transform:scaleY(1)}}
.sm-bubble{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:12px;z-index:8;
  width:max(190px,46vw);max-width:240px;padding:14px 16px;border-radius:16px;background:rgba(255,255,255,.96);
  box-shadow:0 10px 30px rgba(0,0,0,.3);text-align:left}
.sm-bubble::after{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);
  border:9px solid transparent;border-top-color:rgba(255,255,255,.96);border-bottom:0}
.sm-iam{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.15rem;color:#0c3a25;line-height:1.4}
.sm-row{display:flex;align-items:center;gap:8px;margin-top:10px}
.sm-heart{font-size:1.3rem;cursor:pointer;background:none;border:none;padding:0;line-height:1;color:#e0392b;
  filter:grayscale(1) opacity(.5);transition:filter .2s ease,transform .2s ease}
.sm-heart.fav{filter:none;animation:smPop .4s ease}
@keyframes smPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
.sm-save-note{font-size:.72rem;color:#caa23f;font-weight:600}
.shadowmoss.fig8 .sm-flip{animation:smFig8 2.2s ease-in-out infinite}
@keyframes smFig8{0%,100%{transform:translateX(0)}25%{transform:translateX(-14px)}75%{transform:translateX(14px)}}
@media (prefers-reduced-motion:reduce){
  .shadowmoss{transition:none}
  .sm-cat,.shadowmoss .tail,.shadowmoss .eyelid,.shadowmoss.fig8 .sm-flip{animation:none}
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

  const rendezvous = useCompanionsStore((s) => s.rendezvous)
  const [x, setX] = useState(12)
  const [facing, setFacing] = useState(1)
  const [bubble, setBubble] = useState(false)
  const [sitting, setSitting] = useState(false)
  const [fig8, setFig8] = useState(false)
  const xRef = useRef(12)
  const reduced = useRef(prefersReducedMotion())

  useEffect(() => {
    void loadStatements()
  }, [loadStatements])

  const speak = () => {
    const s = pickStatement()
    if (s && user?.id) void recordEncounter(user.id, s.id)
    setSitting(true)
    setBubble(true)
  }

  // gentle wander → pause → speak → resume loop
  useEffect(() => {
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const after = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms))

    const sit = () => {
      if (cancelled) return
      if (useCompanionsStore.getState().rendezvous) return after(1200, sit) // locked
      speak()
      after(4800, () => {
        if (cancelled) return
        setBubble(false)
        after(1200, move)
      })
    }
    const move = () => {
      if (cancelled) return
      if (useCompanionsStore.getState().rendezvous) return after(1200, move) // locked
      setSitting(false)
      setBubble(false)
      const target = 8 + Math.random() * 70
      setFacing(target >= xRef.current ? 1 : -1)
      xRef.current = target
      setX(target)
      useCompanionsStore.getState().setCatX(target) // publish for the gardener
      after(6200, sit) // matches the 6s left transition
    }

    if (reduced.current) {
      after(2500, () => {
        if (!cancelled) speak()
      })
    } else {
      after(800, move)
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Respond to a shared rendezvous: the gardener initiates, the cat walks to the
  // meet point and plays its part; on release the cat resumes its own wander.
  useEffect(() => {
    if (!rendezvous) {
      setFig8(false)
      setSitting(false)
      setBubble(false)
      return
    }
    const target = Math.max(6, Math.min(92, rendezvous.x + 7))
    if (!reduced.current) {
      setFacing(-1) // face the gardener (to our left)
      xRef.current = target
      setX(target)
      useCompanionsStore.getState().setCatX(target)
    }
    const arrive = reduced.current ? 0 : 1500
    const t = setTimeout(() => {
      if (rendezvous.type === 'iam') speak()
      else {
        setSitting(true)
        if (rendezvous.type === 'figure8') setFig8(true)
      }
    }, arrive)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendezvous])

  return (
    <div
      className={`shadowmoss${reduced.current ? ' reduced' : ''}${sitting ? ' paused' : ''}${fig8 ? ' fig8' : ''}`}
      style={{ left: `${x}%` }}
      onClick={() => speak()}
      role="button"
      aria-label="Shadowmoss the garden spirit"
    >
      <style>{STYLES}</style>

      {bubble && current && (
        <div className="sm-bubble" onClick={(e) => e.stopPropagation()}>
          <div className="sm-iam">{current.text}</div>
          <div className="sm-row">
            <button
              type="button"
              className={`sm-heart${current.isFavorite ? ' fav' : ''}`}
              onClick={() => user?.id && void toggleFavorite(user.id)}
              aria-label={current.isFavorite ? 'Remove from sky' : 'Save to sky'}
            >
              ♥
            </button>
            {current.isFavorite && <span className="sm-save-note">✨ saved to your sky</span>}
          </div>
        </div>
      )}

      <div className="sm-flip" style={{ transform: `scaleX(${facing})` }}>
        <svg className="sm-cat" viewBox="0 0 150 150" aria-hidden="true">
          {/* tail curling around the side */}
          <g className="tail">
            <path d="M115 118 C150 116 152 78 132 64 C146 82 132 100 112 102 Z" fill="#141419" />
            <ellipse cx="135" cy="70" rx="9" ry="11" fill="#141419" />
          </g>
          {/* round fat sitting body */}
          <ellipse cx="75" cy="106" rx="42" ry="38" fill="#17171e" />
          <ellipse cx="60" cy="138" rx="12" ry="8" fill="#15151b" />
          <ellipse cx="90" cy="138" rx="12" ry="8" fill="#15151b" />
          <ellipse cx="62" cy="92" rx="14" ry="20" fill="#26262f" opacity=".45" />
          {/* round head */}
          <ellipse cx="75" cy="60" rx="33" ry="29" fill="#191921" />
          {/* ears */}
          <path d="M50 42 L43 18 L70 36 Z" fill="#191921" />
          <path d="M100 42 L107 18 L80 36 Z" fill="#191921" />
          <path d="M52 38 L48 25 L62 36 Z" fill="#3a2730" opacity=".8" />
          <path d="M98 38 L102 25 L88 36 Z" fill="#3a2730" opacity=".8" />
          {/* eyes */}
          <g>
            <ellipse cx="62" cy="58" rx="9" ry="11" fill="#cfe87a" />
            <ellipse cx="88" cy="58" rx="9" ry="11" fill="#cfe87a" />
            <ellipse cx="62" cy="59" rx="3.2" ry="9" fill="#0c0c12" />
            <ellipse cx="88" cy="59" rx="3.2" ry="9" fill="#0c0c12" />
            <circle cx="59.5" cy="53" r="2" fill="#fff" opacity=".9" />
            <circle cx="85.5" cy="53" r="2" fill="#fff" opacity=".9" />
            <rect className="eyelid" x="52" y="47" width="20" height="23" rx="10" fill="#191921" />
            <rect className="eyelid" x="78" y="47" width="20" height="23" rx="10" fill="#191921" />
          </g>
          {/* nose + mouth */}
          <path d="M71 68 L79 68 L75 73 Z" fill="#e88aa8" />
          <path
            d="M75 73 Q70 78 65 75 M75 73 Q80 78 85 75"
            stroke="#0c0c12"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          {/* whiskers */}
          <g stroke="#b9c2c8" strokeWidth="1" opacity=".65" strokeLinecap="round" fill="none">
            <path d="M52 66 L24 62" />
            <path d="M52 70 L24 72" />
            <path d="M52 74 L26 80" />
            <path d="M98 66 L126 62" />
            <path d="M98 70 L126 72" />
            <path d="M98 74 L124 80" />
          </g>
        </svg>
      </div>
    </div>
  )
}
