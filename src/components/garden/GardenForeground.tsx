import { useMemo } from 'react'
import '../../styles/foreground.css'
import type { TimeOfDay } from '../../hooks/useTimeOfDay'

/**
 * Realistic foreground (from garden_foreground_mock.html): scattered grass
 * tufts + cute flowers (always), plus ambient critters tied to the local-time
 * sky — bees + butterflies by day (dawn/day/noon/dusk), fireflies at dusk/night.
 * Replaces the old cross-shaped grass blades.
 */
const FLOWER = ['#f5f0fa', '#f4a8c4', '#ffd66e', '#b98cd6', '#8fb6ee', '#ff9a6a']
const BFLY = ['#f4a8c4', '#ffd66e', '#8fb6ee']
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

export default function GardenForeground({ timeOfDay }: { timeOfDay: TimeOfDay }) {
  const tufts = useMemo(
    () =>
      Array.from({ length: 20 }, () => {
        const blades = 4 + Math.floor(rnd(0, 3))
        const h = rnd(20, 38)
        const w = blades * 6 + 8
        const bl = Array.from({ length: blades }, (_, i) => {
          const x = 8 + i * 6 + rnd(-2, 2)
          const bh = h * rnd(0.7, 1.05)
          const lean = rnd(-7, 7)
          return { x, bh, lean, sw: rnd(2.4, 3.4) }
        })
        return { left: rnd(0, 99), bottom: rnd(0, 24), scale: rnd(0.7, 1.3), delay: rnd(0, 4), h, w, bl }
      }),
    [],
  )

  const flowers = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        left: rnd(2, 97),
        bottom: rnd(3, 26),
        color: FLOWER[Math.floor(rnd(0, FLOWER.length))],
        scale: rnd(0.8, 1.2),
        stem: rnd(14, 26),
        delay: rnd(0, 3.6),
      })),
    [],
  )

  const bees = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => ({
        anim: i === 2 ? 'gfFlit' : 'gfFly',
        dur: rnd(11, 16),
        top: rnd(40, 62),
        delay: rnd(0, 14),
      })),
    [],
  )

  const butterflies = useMemo(
    () =>
      BFLY.map((c, i) => ({
        color: c,
        anim: i % 2 ? 'gfFlit' : 'gfFly',
        dur: rnd(13, 18),
        top: rnd(30, 55),
        delay: rnd(0, 16),
      })),
    [],
  )

  const fireflies = useMemo(
    () =>
      Array.from({ length: 10 }, () => ({
        left: rnd(5, 95),
        top: rnd(40, 72),
        delay: `${rnd(0, 9).toFixed(2)}s, ${rnd(0, 2.4).toFixed(2)}s`,
      })),
    [],
  )

  const showDay = timeOfDay !== 'night' // bees + butterflies
  const showFire = timeOfDay === 'dusk' || timeOfDay === 'night'

  return (
    <>
      <div className="gf-plants" aria-hidden="true">
        {tufts.map((t, i) => (
          <div
            key={`gt-${i}`}
            className="gf-tuft"
            style={{ left: `${t.left}%`, bottom: `${t.bottom}%`, transform: `scale(${t.scale})`, animationDelay: `${t.delay}s` }}
          >
            <svg width={t.w} height={t.h + 2} viewBox={`0 0 ${t.w} ${t.h + 2}`}>
              <defs>
                <linearGradient id={`gfb-${i}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#2c7d49" />
                  <stop offset="100%" stopColor="#6fe39a" />
                </linearGradient>
              </defs>
              {t.bl.map((b, j) => (
                <path
                  key={j}
                  d={`M${b.x} ${t.h} Q${b.x + b.lean} ${t.h - b.bh * 0.6} ${b.x + b.lean * 1.6} ${t.h - b.bh}`}
                  stroke={`url(#gfb-${i})`}
                  strokeWidth={b.sw.toFixed(1)}
                  fill="none"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        ))}

        {flowers.map((f, i) => (
          <div
            key={`gf-${i}`}
            className="gf-flower"
            style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, animationDelay: `${f.delay}s` }}
          >
            <svg width={28 * f.scale} height={f.stem + 22} viewBox={`0 0 28 ${f.stem + 22}`}>
              <path d={`M14 ${f.stem + 20} L14 14`} stroke="#2f8a50" strokeWidth="2.4" strokeLinecap="round" />
              <ellipse
                cx="9"
                cy={f.stem * 0.7 + 6}
                rx="5"
                ry="2.6"
                fill="#2f8a50"
                transform={`rotate(-30 9 ${f.stem * 0.7 + 6})`}
              />
              <g transform="translate(14,12)">
                {[0, 1, 2, 3, 4].map((p) => (
                  <ellipse key={p} rx="3.6" ry="6" fill={f.color} transform={`rotate(${p * 72})`} />
                ))}
                <circle r="3" fill="#ffcf4d" />
              </g>
            </svg>
          </div>
        ))}
      </div>

      <div className="gf-critters" aria-hidden="true">
        {showDay &&
          bees.map((b, i) => (
            <div
              key={`bee-${i}`}
              className="gf-bee"
              style={{ top: `${b.top}%`, animation: `${b.anim} ${b.dur}s linear infinite`, animationDelay: `${b.delay}s` }}
            >
              <svg width="26" height="18" viewBox="0 0 26 18">
                <ellipse className="gf-wing" cx="11" cy="6" rx="6" ry="4" fill="#eaf6ff" opacity=".8" />
                <ellipse className="gf-wing" cx="15" cy="6" rx="6" ry="4" fill="#eaf6ff" opacity=".8" />
                <ellipse cx="13" cy="11" rx="9" ry="6" fill="#f3c33b" />
                <rect x="9" y="5.5" width="3" height="11" fill="#2a2118" />
                <rect x="15" y="5.5" width="3" height="11" fill="#2a2118" />
                <circle cx="22" cy="11" r="3.4" fill="#2a2118" />
              </svg>
            </div>
          ))}

        {showDay &&
          butterflies.map((b, i) => (
            <div
              key={`bf-${i}`}
              className="gf-butterfly"
              style={{ top: `${b.top}%`, animation: `${b.anim} ${b.dur}s linear infinite`, animationDelay: `${b.delay}s` }}
            >
              <svg width="30" height="26" viewBox="0 0 30 26">
                <g className="gf-bwing">
                  <path d="M15 13 C2 0 0 12 6 14 C0 18 6 26 15 16 Z" fill={b.color} />
                </g>
                <g className="gf-bwing">
                  <path d="M15 13 C28 0 30 12 24 14 C30 18 24 26 15 16 Z" fill={b.color} />
                </g>
                <rect x="14" y="6" width="2" height="15" rx="1" fill="#2a2230" />
              </svg>
            </div>
          ))}

        {showFire &&
          fireflies.map((f, i) => (
            <div
              key={`ff-${i}`}
              className="gf-firefly"
              style={{ left: `${f.left}%`, top: `${f.top}%`, animationDelay: f.delay }}
            />
          ))}
      </div>
    </>
  )
}
