import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  onReveal: (n: number) => void
  busy?: boolean
}

const AKP_STYLES = `
.akp{position:relative;min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  padding:24px;font-family:'Inter',system-ui,sans-serif;overflow:hidden;
  --green-deep:#041811;--green-1:#06241a;--green-2:#0a3a28;--green-3:#0e4a33;
  --emerald:#34d27e;--gold:#e8c66a;--gold-bright:#ffe9a8;--gold-deep:#caa23f;
  --silver:#cdd6db;--silver-br:#eef3f5;--silver-dk:#9aa6ac;--display:'Cormorant Garamond',serif;
  background:radial-gradient(120% 90% at 50% 10%,#0c3526 0%,#06231a 45%,#02110b 100%)}
.akp *{box-sizing:border-box;margin:0;padding:0}
.akp .stars{position:absolute;inset:0;z-index:0;pointer-events:none}
.akp .star{position:absolute;border-radius:50%;background:#fff;animation:akpTwinkle 3.5s ease-in-out infinite}
@keyframes akpTwinkle{0%,100%{opacity:.15}50%{opacity:.9}}
.akp .nebula{position:absolute;width:520px;height:520px;border-radius:50%;z-index:0;pointer-events:none;
  background:radial-gradient(circle,rgba(52,210,126,.18),transparent 65%);filter:blur(20px);
  top:8%;left:50%;transform:translateX(-50%);animation:akpBreathe 9s ease-in-out infinite}
@keyframes akpBreathe{0%,100%{opacity:.5;transform:translateX(-50%) scale(1)}50%{opacity:.85;transform:translateX(-50%) scale(1.08)}}
.akp .relic{position:relative;z-index:2;width:330px;max-width:100%;padding:26px 24px 28px;border-radius:26px;
  background:radial-gradient(130% 80% at 50% 0%,rgba(52,210,126,.16),transparent 60%),
    linear-gradient(165deg,var(--green-3),var(--green-1) 55%,var(--green-deep));
  border:2px solid transparent;
  box-shadow:0 0 0 1px rgba(205,214,219,.35) inset,0 0 38px rgba(232,198,106,.18),0 22px 60px rgba(0,0,0,.55);
  animation:akpFrameGlow 6s ease-in-out infinite}
@keyframes akpFrameGlow{0%,100%{box-shadow:0 0 0 1px rgba(205,214,219,.35) inset,0 0 30px rgba(232,198,106,.14),0 22px 60px rgba(0,0,0,.55)}
  50%{box-shadow:0 0 0 1px rgba(205,214,219,.55) inset,0 0 52px rgba(52,210,126,.3),0 22px 60px rgba(0,0,0,.55)}}
.akp .relic::before{content:"";position:absolute;inset:7px;border-radius:19px;
  border:1px solid rgba(232,198,106,.6);box-shadow:0 0 10px rgba(232,198,106,.25) inset;pointer-events:none}
.akp .relic::after{content:"";position:absolute;inset:11px;border-radius:15px;
  border:1px solid rgba(205,214,219,.45);pointer-events:none}
.akp .fil{position:absolute;width:56px;height:56px;z-index:3;pointer-events:none;animation:akpFilShimmer 5s ease-in-out infinite}
.akp .fil.tl{top:2px;left:2px}.akp .fil.tr{top:2px;right:2px;transform:scaleX(-1)}
.akp .fil.bl{bottom:2px;left:2px;transform:scaleY(-1)}.akp .fil.br{bottom:2px;right:2px;transform:scale(-1,-1)}
@keyframes akpFilShimmer{0%,100%{opacity:.75}50%{opacity:1}}
.akp .title{position:relative;z-index:4;text-align:center;font-family:var(--display);font-weight:600;
  font-size:1.5rem;letter-spacing:.06em;color:var(--gold-bright);text-shadow:0 0 14px rgba(232,198,106,.5);margin-bottom:2px}
.akp .subtitle{position:relative;z-index:4;text-align:center;font-size:.62rem;letter-spacing:.42em;
  text-transform:uppercase;color:var(--silver);opacity:.8;margin-bottom:16px}
.akp .display{position:relative;z-index:4;height:78px;border-radius:14px;margin-bottom:18px;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:radial-gradient(120% 120% at 50% 0%,#0a2e20,#03130d);border:1px solid rgba(232,198,106,.55);
  box-shadow:0 0 18px rgba(52,210,126,.25) inset,0 2px 6px rgba(0,0,0,.5)}
.akp .display .sheen{position:absolute;top:0;left:-60%;width:60%;height:100%;
  background:linear-gradient(105deg,transparent,rgba(255,233,168,.18),transparent);animation:akpSheen 4.5s ease-in-out infinite}
@keyframes akpSheen{0%{left:-60%}55%,100%{left:140%}}
.akp .digits{font-family:var(--display);font-weight:700;font-size:2.9rem;letter-spacing:.14em;
  color:var(--gold-bright);text-shadow:0 0 16px rgba(52,210,126,.6),0 0 4px rgba(232,198,106,.8);min-height:1em}
.akp .digits.placeholder{color:rgba(205,214,219,.32);text-shadow:none;font-size:1.5rem;letter-spacing:.2em}
.akp .pad{position:relative;z-index:4;display:grid;grid-template-columns:repeat(3,1fr);gap:11px}
.akp .key{font-family:var(--display);font-weight:600;font-size:1.5rem;color:var(--gold-bright);height:54px;border-radius:13px;cursor:pointer;
  background:linear-gradient(160deg,var(--green-3),var(--green-1));border:1px solid rgba(205,214,219,.32);
  box-shadow:0 0 0 1px rgba(232,198,106,.25) inset,0 4px 10px rgba(0,0,0,.4);
  transition:transform .12s ease,box-shadow .15s ease,background .15s ease;text-shadow:0 0 8px rgba(232,198,106,.35)}
.akp .key:hover{background:linear-gradient(160deg,#12613f,var(--green-2));
  box-shadow:0 0 0 1px rgba(232,198,106,.6) inset,0 0 16px rgba(52,210,126,.4),0 4px 10px rgba(0,0,0,.4)}
.akp .key:active{transform:translateY(2px) scale(.97)}
.akp .key.util{font-family:'Inter',system-ui,sans-serif;font-size:.8rem;letter-spacing:.04em;color:var(--silver-br);text-shadow:none}
.akp .key.reveal{grid-column:1 / -1;height:50px;font-family:'Inter',system-ui,sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.14em;
  text-transform:uppercase;color:#04130c;margin-top:3px;
  background:linear-gradient(135deg,var(--gold-bright),var(--gold) 50%,var(--gold-deep));
  border:1px solid rgba(255,233,168,.7);text-shadow:none;box-shadow:0 0 18px rgba(232,198,106,.5),0 4px 12px rgba(0,0,0,.45)}
.akp .key.reveal:hover{box-shadow:0 0 30px rgba(255,233,168,.7),0 4px 12px rgba(0,0,0,.45)}
.akp .key.reveal:disabled{opacity:.4;cursor:not-allowed;box-shadow:none}
.akp .hint{position:relative;z-index:4;text-align:center;font-size:.68rem;color:var(--silver-dk);margin-top:12px;min-height:1em}
.akp .back-link{position:relative;z-index:4;font-size:.8rem;color:var(--silver-dk);text-decoration:none}
.akp .back-link:hover{color:var(--silver-br)}
@media (prefers-reduced-motion: reduce){.akp *{animation:none!important}}
`

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

const Filigree = ({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) => (
  <svg className={`fil ${pos}`} viewBox="0 0 56 56" fill="none" aria-hidden="true">
    <path d="M6 50 C6 26 26 6 50 6" stroke="#e8c66a" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 50 C10 30 30 10 50 10" stroke="#cdd6db" strokeWidth="1" strokeLinecap="round" opacity=".8" />
    <path d="M6 50 C6 38 14 30 26 30 C36 30 42 36 42 46" stroke="#e8c66a" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M26 30 C26 20 33 14 43 16" stroke="#e8c66a" strokeWidth="1.1" strokeLinecap="round" />
    <circle cx="44" cy="44" r="2.4" fill="#ffe9a8" />
    <circle cx="42" cy="14" r="1.8" fill="#cdd6db" />
    <path d="M18 42 C12 42 10 38 12 33" stroke="#cdd6db" strokeWidth="1" strokeLinecap="round" opacity=".85" />
  </svg>
)

export default function AngelKeypad({ onReveal, busy }: Props) {
  const [entered, setEntered] = useState('')

  const stars = useMemo(
    () =>
      Array.from({ length: 90 }, () => {
        const size = 1 + Math.random() * 2
        return {
          size,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 3.5,
        }
      }),
    [],
  )

  const n = parseInt(entered || '0', 10)
  const valid = n >= 1 && n <= 9999

  const addDigit = (d: string) => setEntered((cur) => (cur.length < 4 ? cur + d : cur))
  const backspace = () => setEntered((cur) => cur.slice(0, -1))
  const clear = () => setEntered('')
  const reveal = () => {
    if (valid && !busy) onReveal(n) // n strips leading zeros (007 -> 7)
  }

  return (
    <div className="akp">
      <style>{AKP_STYLES}</style>

      <div className="stars" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={{ width: `${s.size}px`, height: `${s.size}px`, left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
          />
        ))}
      </div>
      <div className="nebula" aria-hidden="true" />

      <div className="relic">
        <Filigree pos="tl" />
        <Filigree pos="tr" />
        <Filigree pos="bl" />
        <Filigree pos="br" />

        <div className="title">Angel Numbers</div>
        <div className="subtitle">Enter 1 – 9999</div>

        <div className="display">
          <div className="sheen" />
          <div className={`digits${entered === '' ? ' placeholder' : ''}`}>
            {entered === '' ? '— — — —' : entered}
          </div>
        </div>

        <div className="pad">
          {DIGITS.map((d) => (
            <button key={d} type="button" className="key" onClick={() => addDigit(d)}>
              {d}
            </button>
          ))}
          <button type="button" className="key util" onClick={clear}>
            Clear
          </button>
          <button type="button" className="key" onClick={() => addDigit('0')}>
            0
          </button>
          <button type="button" className="key util" onClick={backspace} aria-label="Backspace">
            ⌫
          </button>
          <button type="button" className="key reveal" disabled={!valid || busy} onClick={reveal}>
            {busy ? 'Revealing…' : 'Reveal'}
          </button>
        </div>

        <div className="hint">{busy && valid ? `✦ Revealing the message of ${n} ✦` : ''}</div>
      </div>

      <Link to="/garden" className="back-link">
        Back to garden
      </Link>
    </div>
  )
}
