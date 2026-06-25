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
}

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
  const isTree = renderKey === 'oak' || renderKey === 'willow'
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
