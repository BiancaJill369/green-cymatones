import type { JSX } from 'react'

/**
 * Real per-species floral art (replaces the old stem + colored-ball render).
 * Each render_key has a SEEDLING (day planted, stage 0) and a BLOOM (after the
 * next-day growth tick, stage ≥ 1). viewBox 0 0 60 90, plant anchored at the
 * bottom (y≈90 = ground) so it grows upward from the grid cell.
 */

const STEM = '#2f7d4d'
const STEM_DK = '#2f6b46'

function leafPair(y: number, len: number): JSX.Element {
  return (
    <g key={y} fill="#9dc183" stroke="#7fae74" strokeWidth="0.8">
      <ellipse cx={30 - len * 0.7} cy={y} rx={len} ry={len * 0.42} transform={`rotate(-30 ${30 - len * 0.7} ${y})`} />
      <ellipse cx={30 + len * 0.7} cy={y} rx={len} ry={len * 0.42} transform={`rotate(30 ${30 + len * 0.7} ${y})`} />
    </g>
  )
}

function radial(petals: number, build: (i: number) => JSX.Element): JSX.Element[] {
  return Array.from({ length: petals }, (_, i) => build(i))
}

const ART: Record<string, { seedling: JSX.Element; bloom: JSX.Element }> = {
  // ---- SAGE: sage leaves + purple flower tip ----
  sage: {
    seedling: (
      <g>
        <path d="M30 90 L30 64" stroke={STEM} strokeWidth="3.4" fill="none" strokeLinecap="round" />
        {leafPair(70, 6)}
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 24" stroke={STEM_DK} strokeWidth="3.6" fill="none" strokeLinecap="round" />
        {leafPair(74, 9)}
        {leafPair(60, 8.5)}
        {leafPair(46, 7.5)}
        <g fill="#9b6fc9">
          <circle cx="30" cy="22" r="3.4" />
          <circle cx="25" cy="28" r="2.8" />
          <circle cx="35" cy="28" r="2.8" />
          <circle cx="30" cy="33" r="2.6" />
        </g>
      </g>
    ),
  },

  // ---- LAVENDER: thin stems + purple floret spikes ----
  lavender: {
    seedling: (
      <g>
        <g stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M28 90 L26 66" />
          <path d="M33 90 L35 68" />
        </g>
        <g fill="#8a63c9">
          <circle cx="26" cy="64" r="2.4" />
          <circle cx="35" cy="66" r="2.4" />
        </g>
      </g>
    ),
    bloom: (
      <g>
        <g stroke={STEM} strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M30 90 L23 42" />
          <path d="M30 90 L30 34" />
          <path d="M30 90 L37 44" />
        </g>
        {/* floret spikes — stacked little ovals */}
        {[
          { x: 23, y: 42 },
          { x: 30, y: 34 },
          { x: 37, y: 44 },
        ].map((s, si) => (
          <g key={si} fill={si % 2 ? '#b57edc' : '#8a63c9'}>
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse key={i} cx={s.x} cy={s.y - 16 + i * 3.2} rx="2.6" ry="2" />
            ))}
          </g>
        ))}
      </g>
    ),
  },

  // ---- OAK: trunk + lobed-leaf canopy + acorn ----
  oak: {
    seedling: (
      <g>
        <rect x="27.5" y="62" width="5" height="28" rx="2" fill="#5a3b22" />
        <path d="M30 64 q-12 -2 -10 -12 q8 4 10 12 z" fill="#4f7942" stroke="#3c6234" strokeWidth="0.6" />
        <path d="M30 60 q12 -2 10 -12 q-8 4 -10 12 z" fill="#4f7942" stroke="#3c6234" strokeWidth="0.6" />
      </g>
    ),
    bloom: (
      <g>
        <rect x="26.5" y="56" width="7" height="34" rx="2.5" fill="#5a3b22" />
        <g fill="#4f7942">
          <circle cx="30" cy="34" r="16" />
          <circle cx="17" cy="40" r="11" />
          <circle cx="43" cy="40" r="11" />
          <circle cx="22" cy="26" r="10" />
          <circle cx="38" cy="26" r="10" />
        </g>
        <g fill="#3c6234" opacity="0.45">
          <circle cx="24" cy="38" r="5" />
          <circle cx="37" cy="32" r="5" />
        </g>
        {/* acorn */}
        <g transform="translate(43,49)">
          <ellipse cx="0" cy="2.5" rx="3" ry="4" fill="#c9a06a" />
          <path d="M-3.4 0.5 a3.4 2.2 0 0 1 6.8 0 z" fill="#6b4a2b" />
        </g>
      </g>
    ),
  },

  // ---- WILLOW: trunk + drooping wispy branches ----
  willow: {
    seedling: (
      <g>
        <rect x="28" y="60" width="4.5" height="30" rx="2" fill="#5a3b22" />
        <g stroke="#7bbf8a" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M30 60 Q24 68 23 80" />
          <path d="M30 60 Q36 68 37 80" />
        </g>
      </g>
    ),
    bloom: (
      <g>
        <rect x="27" y="44" width="6" height="46" rx="2.5" fill="#5a3b22" />
        <ellipse cx="30" cy="40" rx="16" ry="8" fill="#6fae7e" opacity="0.5" />
        <g stroke="#7bbf8a" strokeWidth="1.3" fill="none" strokeLinecap="round">
          <path d="M30 38 Q16 50 15 84" />
          <path d="M30 36 Q22 52 21 86" />
          <path d="M30 35 Q30 56 30 88" />
          <path d="M30 36 Q38 52 39 86" />
          <path d="M30 38 Q44 50 45 84" />
        </g>
        <g fill="#8fce9a">
          {[15, 21, 30, 39, 45].map((x, i) => (
            <ellipse key={i} cx={x} cy={84 - (i % 2) * 4} rx="1.6" ry="3.2" />
          ))}
        </g>
      </g>
    ),
  },

  // ---- CORNFLOWER: fringed blue star-petal flower ----
  cornflower: {
    seedling: (
      <g>
        <path d="M30 90 L30 60" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="72" rx="6" ry="2.6" fill="#3a8a50" transform="rotate(-25 24 72)" />
        <ellipse cx="30" cy="56" rx="4" ry="6" fill="#6f93da" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 40" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="66" rx="7" ry="3" fill="#3a8a50" transform="rotate(-28 22 66)" />
        <ellipse cx="38" cy="58" rx="7" ry="3" fill="#3a8a50" transform="rotate(28 38 58)" />
        <g transform="translate(30,34)">
          {/* fringed star petals */}
          <g fill="#6f93da">
            {radial(8, (i) => (
              <path key={i} d="M0 0 L-2.4 -13 L0 -10 L2.4 -13 Z" transform={`rotate(${i * 45})`} />
            ))}
          </g>
          <g fill="#88a8e6">
            {radial(8, (i) => (
              <ellipse key={i} cx="0" cy="-7" rx="2.4" ry="6" transform={`rotate(${i * 45 + 22})`} />
            ))}
          </g>
          <circle r="3.4" fill="#3b5aa6" />
        </g>
      </g>
    ),
  },

  // ---- POPPY: coral cupped petals + dark center ----
  poppy: {
    seedling: (
      <g>
        <path d="M30 90 Q31 70 30 58" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="30" cy="55" rx="4.5" ry="6" fill="#e0563f" transform="rotate(-12 30 55)" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 40" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="23" cy="64" rx="6.5" ry="2.8" fill="#3a8a50" transform="rotate(-25 23 64)" />
        <g transform="translate(30,34)">
          <g fill="#e0563f">
            <ellipse cx="0" cy="-9" rx="11" ry="12" />
            <ellipse cx="-10" cy="2" rx="11" ry="12" />
            <ellipse cx="10" cy="2" rx="11" ry="12" />
            <ellipse cx="0" cy="8" rx="11" ry="11" />
          </g>
          <g fill="#e8775e" opacity="0.6">
            <ellipse cx="0" cy="-7" rx="5" ry="6" />
          </g>
          <circle r="5" fill="#2f2330" />
          <g fill="#1a1420">
            {radial(8, (i) => (
              <circle key={i} cx="0" cy="-4.6" r="0.9" transform={`rotate(${i * 45})`} />
            ))}
          </g>
        </g>
      </g>
    ),
  },

  // ---- STARFLOWER: violet pointed star petals + dark center ----
  starflower: {
    seedling: (
      <g>
        <path d="M30 90 L30 58" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="70" rx="6" ry="2.6" fill="#3a8a50" transform="rotate(25 36 70)" />
        <path d="M30 56 L27 48 L30 52 L33 48 Z" fill="#9b6fc9" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 40" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="64" rx="6.5" ry="2.8" fill="#3a8a50" transform="rotate(-25 22 64)" />
        <g transform="translate(30,34)">
          <g fill="#9b6fc9">
            {radial(6, (i) => (
              <path key={i} d="M0 0 L-4 -16 L0 -13 L4 -16 Z" transform={`rotate(${i * 60})`} />
            ))}
          </g>
          <g fill="#b98cd6">
            {radial(6, (i) => (
              <path key={i} d="M0 0 L-2.6 -10 L0 -8 L2.6 -10 Z" transform={`rotate(${i * 60 + 30})`} />
            ))}
          </g>
          <circle r="3.6" fill="#2f2330" />
          <circle r="1.6" fill="#f2c14e" />
        </g>
      </g>
    ),
  },

  // ---- CHAMOMILE: white daisy heads + feathery foliage ----
  chamomile: {
    seedling: (
      <g>
        <path d="M30 90 L30 62" stroke={STEM} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g stroke="#7fae74" strokeWidth="1" fill="none">
          <path d="M30 74 L24 70 M30 74 L36 70 M30 68 L25 65 M30 68 L35 65" />
        </g>
        <circle cx="30" cy="58" r="3" fill="#f2c14e" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 40" stroke={STEM} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g stroke="#7fae74" strokeWidth="1" fill="none" strokeLinecap="round">
          <path d="M30 70 L22 66 M30 70 L38 66 M30 62 L23 58 M30 62 L37 58" />
        </g>
        {[
          { x: 30, y: 34 },
          { x: 19, y: 44 },
          { x: 41, y: 46 },
        ].map((f, fi) => (
          <g key={fi} transform={`translate(${f.x},${f.y})`}>
            <g fill="#f7f3e8">
              {radial(10, (i) => (
                <ellipse key={i} cx="0" cy="-6" rx="1.6" ry="5" transform={`rotate(${i * 36})`} />
              ))}
            </g>
            <circle r="2.8" fill="#f2c14e" />
          </g>
        ))}
      </g>
    ),
  },

  // ---- ROSEMARY: woody sprig of needle leaves + pale-blue flowers ----
  rosemary: {
    seedling: (
      <g>
        <path d="M30 90 L30 62" stroke="#4f6b3e" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <g stroke="#5f8a4e" strokeWidth="1.2" strokeLinecap="round">
          <path d="M30 72 L24 70 M30 72 L36 70 M30 66 L25 64 M30 66 L35 64" />
        </g>
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 30" stroke="#4f6b3e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <g stroke="#5f8a4e" strokeWidth="1.2" strokeLinecap="round">
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i}>
              <path d={`M30 ${72 - i * 5} L${22 - (i % 2)} ${70 - i * 5}`} />
              <path d={`M30 ${72 - i * 5} L${38 + (i % 2)} ${70 - i * 5}`} />
            </g>
          ))}
        </g>
        <g fill="#9fb6e0">
          <circle cx="24" cy="50" r="1.8" />
          <circle cx="37" cy="42" r="1.8" />
          <circle cx="26" cy="36" r="1.8" />
        </g>
      </g>
    ),
  },

  // ---- MINT: square stem + paired serrated leaves ----
  mint: {
    seedling: (
      <g>
        <path d="M30 90 L30 64" stroke="#2f8a50" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <path d="M30 70 q-10 -2 -11 -10 q9 1 11 10 z" fill="#3fae5e" stroke="#2f8a50" strokeWidth="0.6" />
        <path d="M30 66 q10 -2 11 -10 q-9 1 -11 10 z" fill="#3fae5e" stroke="#2f8a50" strokeWidth="0.6" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 30" stroke="#2f8a50" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        {[68, 54, 40].map((y, i) => (
          <g key={i}>
            <path d={`M30 ${y} q-12 -2 -13 -11 q11 1 13 11 z`} fill="#3fae5e" stroke="#2f8a50" strokeWidth="0.6" />
            <path d={`M30 ${y - 4} q12 -2 13 -11 q-11 1 -13 11 z`} fill="#3fae5e" stroke="#2f8a50" strokeWidth="0.6" />
          </g>
        ))}
        <g fill="#cdb8e6">
          <circle cx="30" cy="28" r="2" />
          <circle cx="27" cy="32" r="1.6" />
          <circle cx="33" cy="32" r="1.6" />
        </g>
      </g>
    ),
  },

  // ---- ECHINACEA: drooping pink petals + raised copper cone ----
  echinacea: {
    seedling: (
      <g>
        <path d="M30 90 L30 58" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="23" cy="70" rx="6" ry="2.6" fill="#3a8a50" transform="rotate(-25 23 70)" />
        <ellipse cx="30" cy="54" rx="4" ry="6" fill="#d488ad" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 38" stroke={STEM} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="64" rx="6.5" ry="2.8" fill="#3a8a50" transform="rotate(-25 22 64)" />
        <g transform="translate(30,33)">
          <g fill="#d488ad">
            {radial(12, (i) => (
              <ellipse key={i} cx="0" cy="-12" rx="2.6" ry="7" transform={`rotate(${i * 30}) translate(0 2)`} />
            ))}
          </g>
          <ellipse cx="0" cy="-1" rx="5" ry="6" fill="#b5651d" />
          <ellipse cx="0" cy="-3" rx="4" ry="3.5" fill="#cf7d2a" />
        </g>
      </g>
    ),
  },

  // ---- BIRCH: slender white trunk + airy canopy ----
  birch: {
    seedling: (
      <g>
        <rect x="28.5" y="60" width="3.5" height="30" rx="1.5" fill="#e8e6df" />
        <path d="M30 62 q-9 -1 -9 -9 q7 2 9 9 z" fill="#7fc08a" />
        <path d="M30 58 q9 -1 9 -9 q-7 2 -9 9 z" fill="#7fc08a" />
      </g>
    ),
    bloom: (
      <g>
        <rect x="28" y="48" width="4.5" height="42" rx="2" fill="#eceae2" />
        <g stroke="#2a2620" strokeWidth="1" strokeLinecap="round">
          <path d="M28.6 58 L31.4 58 M28.6 70 L31 70 M29 80 L31.6 80" />
        </g>
        <g fill="#7fc08a">
          <circle cx="30" cy="34" r="13" />
          <circle cx="19" cy="40" r="9" />
          <circle cx="41" cy="40" r="9" />
          <circle cx="24" cy="28" r="8" />
          <circle cx="37" cy="28" r="8" />
        </g>
        <g fill="#a7d8ad" opacity="0.5">
          <circle cx="26" cy="34" r="4" />
          <circle cx="36" cy="30" r="4" />
        </g>
      </g>
    ),
  },

  // ---- ROWAN: canopy + red berry clusters ----
  rowan: {
    seedling: (
      <g>
        <rect x="28" y="60" width="4.5" height="30" rx="2" fill="#5a4a36" />
        <path d="M30 62 q-9 -1 -9 -9 q7 2 9 9 z" fill="#3f7a48" />
        <path d="M30 58 q9 -1 9 -9 q-7 2 -9 9 z" fill="#3f7a48" />
      </g>
    ),
    bloom: (
      <g>
        <rect x="27" y="54" width="6" height="36" rx="2.5" fill="#5a4a36" />
        <g fill="#3f7a48">
          <circle cx="30" cy="34" r="15" />
          <circle cx="18" cy="40" r="10" />
          <circle cx="42" cy="40" r="10" />
          <circle cx="23" cy="27" r="9" />
          <circle cx="37" cy="27" r="9" />
        </g>
        <g fill="#d23b2a">
          {[
            [22, 40],
            [38, 38],
            [30, 46],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="1.8" />
              <circle cx={x - 3} cy={y + 2} r="1.8" />
              <circle cx={x + 3} cy={y + 2} r="1.8" />
              <circle cx={x} cy={y + 4} r="1.8" />
            </g>
          ))}
        </g>
      </g>
    ),
  },

  // ---- CHERRY BLOSSOM: dark trunk + cloud of pink blossom ----
  cherry_blossom: {
    seedling: (
      <g>
        <rect x="28" y="60" width="4.5" height="30" rx="2" fill="#4a3322" />
        <circle cx="24" cy="56" r="3" fill="#f4b8cf" />
        <circle cx="36" cy="56" r="3" fill="#f4b8cf" />
      </g>
    ),
    bloom: (
      <g>
        <rect x="27" y="54" width="6" height="36" rx="2.5" fill="#4a3322" />
        <path d="M30 60 L20 50 M30 58 L40 48" stroke="#4a3322" strokeWidth="2.4" strokeLinecap="round" />
        <g fill="#f7c9dd">
          <circle cx="30" cy="32" r="15" />
          <circle cx="18" cy="38" r="10" />
          <circle cx="42" cy="38" r="10" />
          <circle cx="23" cy="25" r="9" />
          <circle cx="37" cy="25" r="9" />
        </g>
        <g fill="#fff">
          {[
            [24, 32],
            [36, 30],
            [30, 38],
            [18, 38],
            [42, 36],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`}>
              {radial(5, (j) => (
                <circle key={j} cx="0" cy="-2.6" r="1.6" transform={`rotate(${j * 72})`} />
              ))}
              <circle r="0.9" fill="#e88aa8" />
            </g>
          ))}
        </g>
      </g>
    ),
  },

  // ---- DAISY: white petals + yellow center ----
  daisy: {
    seedling: (
      <g>
        <path d="M30 90 L30 58" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="70" rx="6" ry="2.6" fill="#3a8a50" transform="rotate(-25 24 70)" />
        <circle cx="30" cy="55" r="3" fill="#f2c14e" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 38" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="64" rx="6.5" ry="2.8" fill="#3a8a50" transform="rotate(-25 22 64)" />
        <g transform="translate(30,33)">
          <g fill="#fbf8f0">
            {radial(12, (i) => (
              <ellipse key={i} cx="0" cy="-11" rx="2.6" ry="7" transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r="4.5" fill="#f2c14e" />
          <circle r="2.6" fill="#e0a92e" />
        </g>
      </g>
    ),
  },

  // ---- BUTTERCUP: glossy round yellow petals ----
  buttercup: {
    seedling: (
      <g>
        <path d="M30 90 L30 58" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M24 70 l-5 -3 l5 0 l-3 -4 z" fill="#3a8a50" />
        <circle cx="30" cy="55" r="3.5" fill="#f7d12e" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 40" stroke={STEM} strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path d="M22 64 l-6 -3 l6 0 l-4 -5 z" fill="#3a8a50" />
        <g transform="translate(30,34)">
          <g fill="#f7d12e">
            {radial(5, (i) => (
              <ellipse key={i} cx="0" cy="-8" rx="6" ry="7.5" transform={`rotate(${i * 72})`} />
            ))}
          </g>
          <g fill="#ffe87a" opacity="0.7">
            {radial(5, (i) => (
              <ellipse key={i} cx="0" cy="-7" rx="3" ry="4" transform={`rotate(${i * 72})`} />
            ))}
          </g>
          <circle r="3" fill="#caa12a" />
        </g>
      </g>
    ),
  },

  // ---- FOXGLOVE: tall spike of hanging tubular bells ----
  foxglove: {
    seedling: (
      <g>
        <path d="M30 90 L30 56" stroke="#3a7d4d" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="74" rx="7" ry="3" fill="#3a8a50" transform="rotate(-22 24 74)" />
        <ellipse cx="36" cy="78" rx="7" ry="3" fill="#3a8a50" transform="rotate(22 36 78)" />
        <ellipse cx="31" cy="54" rx="3" ry="4" fill="#c07fcf" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 18" stroke="#3a7d4d" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="74" rx="8" ry="3.4" fill="#3a8a50" transform="rotate(-22 22 74)" />
        <ellipse cx="38" cy="78" rx="8" ry="3.4" fill="#3a8a50" transform="rotate(22 38 78)" />
        <g>
          {[60, 52, 44, 36, 28, 22].map((y, i) => {
            const big = i < 3
            const w = big ? 5 : 3.4
            const h = big ? 7 : 5
            const side = i % 2 ? 1 : -1
            return (
              <g key={i} transform={`translate(${30 + side * (big ? 7 : 5)},${y})`}>
                <ellipse rx={w} ry={h} fill={i % 2 ? '#c07fcf' : '#b06ec2'} />
                <ellipse cx="0" cy={h * 0.4} rx={w * 0.5} ry={h * 0.4} fill="#7a4a90" opacity="0.7" />
              </g>
            )
          })}
        </g>
      </g>
    ),
  },

  // ---- FORGET-ME-NOT: cluster of tiny blue 5-petal flowers ----
  forget_me_not: {
    seedling: (
      <g>
        <path d="M30 90 L30 60" stroke={STEM} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="24" cy="72" rx="5.5" ry="2.4" fill="#3a8a50" transform="rotate(-25 24 72)" />
        <circle cx="30" cy="56" r="2.4" fill="#7aa6e0" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 46" stroke={STEM} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="22" cy="66" rx="6" ry="2.6" fill="#3a8a50" transform="rotate(-25 22 66)" />
        {[
          [30, 36],
          [22, 42],
          [38, 42],
          [26, 48],
          [35, 48],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <g fill="#7aa6e0">
              {radial(5, (j) => (
                <circle key={j} cx="0" cy="-2.6" r="1.7" transform={`rotate(${j * 72})`} />
              ))}
            </g>
            <circle r="1" fill="#f2c14e" />
          </g>
        ))}
      </g>
    ),
  },

  // ---- CALIFORNIA POPPY: cupped orange petals + fine foliage ----
  california_poppy: {
    seedling: (
      <g>
        <path d="M30 90 L30 56" stroke="#4f8a5e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g stroke="#5fa06e" strokeWidth="1" strokeLinecap="round">
          <path d="M30 72 L24 66 M30 72 L36 66 M30 66 L26 60 M30 66 L34 60" />
        </g>
        <ellipse cx="30" cy="52" rx="3.5" ry="5" fill="#ef8a2a" />
      </g>
    ),
    bloom: (
      <g>
        <path d="M30 90 L30 38" stroke="#4f8a5e" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <g stroke="#5fa06e" strokeWidth="1" strokeLinecap="round">
          <path d="M30 66 L22 60 M30 66 L38 60 M30 58 L24 52 M30 58 L36 52" />
        </g>
        <g transform="translate(30,33)">
          <g fill="#f59325">
            <ellipse cx="0" cy="-8" rx="9" ry="11" />
            <ellipse cx="-8" cy="2" rx="9" ry="11" />
            <ellipse cx="8" cy="2" rx="9" ry="11" />
            <ellipse cx="0" cy="7" rx="9" ry="10" />
          </g>
          <g fill="#f7b347" opacity="0.7">
            <ellipse cx="0" cy="-4" rx="5" ry="6" />
          </g>
          <circle r="2.6" fill="#e07a16" />
        </g>
      </g>
    ),
  },
}

const TREES = new Set(['oak', 'willow', 'birch', 'rowan', 'cherry_blossom'])

export function isSpecies(renderKey: string | null): boolean {
  return !!renderKey && renderKey in ART
}

export default function SpeciesArt({
  renderKey,
  stage,
}: {
  renderKey: string
  stage: number
}) {
  const def = ART[renderKey]
  if (!def) return null
  const bloom = stage >= 1
  const isTree = TREES.has(renderKey)
  // seedling small; bloom grows gently with the day-based stage (art only)
  const h = bloom
    ? (isTree ? 60 : 44) + (Math.min(stage, 5) - 1) * (isTree ? 7 : 3.5)
    : isTree
      ? 34
      : 28
  return (
    <svg
      className="species-art"
      viewBox="0 0 60 90"
      height={h}
      width={h * (60 / 90)}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {bloom ? def.bloom : def.seedling}
    </svg>
  )
}
