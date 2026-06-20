import { useId } from 'react'
import {
  CLOTH_COLORS,
  DEFAULT_AVATAR,
  HAIR_COLORS,
  SKIN_TONES,
  hexFor,
} from '../../lib/gardenerOptions'
import type { GardenerAvatar } from '../../lib/gardenerOptions'

/**
 * The Gardener — a reusable layered-SVG character (ported from violet, green
 * reskin). Draw order: skin → outfit → hair → face → accessory → shoes.
 */
export default function Gardener({
  avatar,
  size = 200,
  ariaLabel = 'Your gardener',
}: {
  avatar?: Partial<GardenerAvatar> | null
  size?: number
  ariaLabel?: string
}) {
  const a: GardenerAvatar = { ...DEFAULT_AVATAR, ...(avatar || {}) }
  const uid = useId().replace(/[:]/g, '-')
  const patternId = `gp-${a.pattern}-${uid}`

  const skin = hexFor(SKIN_TONES, a.skin, '#e6b896')
  const hair = hexFor(HAIR_COLORS, a.hair_color, '#5a3520')
  const cloth = hexFor(CLOTH_COLORS, a.cloth_color, '#86a06e')

  const fillStyle = a.pattern === 'solid' ? cloth : `url(#${patternId})`
  const accent = 'rgba(255,255,255,0.42)'

  return (
    <svg viewBox="0 0 200 260" width={size} role="img" aria-label={ariaLabel} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <Patterns id={patternId} pattern={a.pattern} cloth={cloth} accent={accent} />
      </defs>
      <SkinBase skin={skin} />
      <Outfit outfit={a.outfit} fillStyle={fillStyle} accentColor={cloth} />
      <Hair style={a.hair_style} color={hair} />
      <Face />
      <Accessory id={a.accessory} cloth={cloth} />
      <Shoes id={a.shoes} cloth={cloth} />
    </svg>
  )
}

function Patterns({
  id,
  pattern,
  cloth,
  accent,
}: {
  id: string
  pattern: string
  cloth: string
  accent: string
}) {
  if (pattern === 'solid') return null
  const common = { id, patternUnits: 'userSpaceOnUse' as const }
  if (pattern === 'floral') {
    return (
      <pattern {...common} width={18} height={18}>
        <rect width="18" height="18" fill={cloth} />
        <circle cx="9" cy="9" r="1.6" fill={accent} />
        <circle cx="9" cy="5" r="1.6" fill={accent} />
        <circle cx="9" cy="13" r="1.6" fill={accent} />
        <circle cx="5" cy="9" r="1.6" fill={accent} />
        <circle cx="13" cy="9" r="1.6" fill={accent} />
      </pattern>
    )
  }
  if (pattern === 'gingham') {
    return (
      <pattern {...common} width={14} height={14}>
        <rect width="14" height="14" fill={cloth} />
        <rect x="0" y="0" width="7" height="7" fill={accent} />
        <rect x="7" y="7" width="7" height="7" fill={accent} />
      </pattern>
    )
  }
  if (pattern === 'polka') {
    return (
      <pattern {...common} width={14} height={14}>
        <rect width="14" height="14" fill={cloth} />
        <circle cx="7" cy="7" r="2.4" fill={accent} />
      </pattern>
    )
  }
  if (pattern === 'stripes') {
    return (
      <pattern {...common} width={10} height={10}>
        <rect width="10" height="10" fill={cloth} />
        <rect x="0" y="0" width="3" height="10" fill={accent} />
      </pattern>
    )
  }
  if (pattern === 'leafy') {
    return (
      <pattern {...common} width={18} height={18}>
        <rect width="18" height="18" fill={cloth} />
        <path d="M9 4 Q13 7 9 12 Q5 7 9 4 Z" fill={accent} />
        <path d="M9 7 L9 12" stroke={cloth} strokeWidth="0.7" />
      </pattern>
    )
  }
  return null
}

function SkinBase({ skin }: { skin: string }) {
  return (
    <g>
      <rect x="82" y="200" width="12" height="40" rx="4" fill={skin} />
      <rect x="106" y="200" width="12" height="40" rx="4" fill={skin} />
      <ellipse cx="88" cy="246" rx="9" ry="5" fill={skin} />
      <ellipse cx="112" cy="246" rx="9" ry="5" fill={skin} />
      <rect x="58" y="108" width="12" height="52" rx="6" fill={skin} />
      <rect x="130" y="108" width="12" height="52" rx="6" fill={skin} />
      <circle cx="64" cy="164" r="7" fill={skin} />
      <circle cx="136" cy="164" r="7" fill={skin} />
      <rect x="92" y="86" width="16" height="14" fill={skin} />
      <circle cx="100" cy="58" r="32" fill={skin} />
      <ellipse cx="83" cy="66" rx="4" ry="2.5" fill="rgba(214,120,140,0.35)" />
      <ellipse cx="117" cy="66" rx="4" ry="2.5" fill="rgba(214,120,140,0.35)" />
    </g>
  )
}

function Face() {
  return (
    <g>
      <ellipse cx="88" cy="62" rx="2.4" ry="3" fill="#2a2330" />
      <ellipse cx="112" cy="62" rx="2.4" ry="3" fill="#2a2330" />
      <circle cx="88.7" cy="60.8" r="0.6" fill="#fff" />
      <circle cx="112.7" cy="60.8" r="0.6" fill="#fff" />
      <path d="M94 74 Q100 78 106 74" stroke="#2a2330" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </g>
  )
}

function Outfit({
  outfit,
  fillStyle,
  accentColor,
}: {
  outfit: string
  fillStyle: string
  accentColor: string
}) {
  const aline = 'M 78 104 L 60 205 L 140 205 L 122 104 Z'
  const aShort = 'M 78 104 L 64 178 L 136 178 L 122 104 Z'
  switch (outfit) {
    case 'sundress':
      return (
        <g>
          <path d={aline} fill={fillStyle} />
          <path d="M 84 96 L 88 104 M 116 96 L 112 104" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'gardening_dress':
      return (
        <g>
          <path d={aline} fill={fillStyle} />
          <path d="M 70 104 Q 78 96 86 104" fill={fillStyle} />
          <path d="M 114 104 Q 122 96 130 104" fill={fillStyle} />
          <rect x="86" y="160" width="28" height="22" rx="3" fill={accentColor} opacity="0.55" />
          <line x1="86" y1="166" x2="114" y2="166" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </g>
      )
    case 'pinafore':
      return (
        <g>
          <path d={aline} fill={fillStyle} />
          <rect x="86" y="104" width="28" height="40" fill={fillStyle} />
          <path d="M 88 104 L 88 92 M 112 104 L 112 92" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <rect x="86" y="104" width="28" height="40" fill="none" stroke="rgba(0,0,0,0.15)" />
        </g>
      )
    case 'wrap_dress':
      return (
        <g>
          <path d={aline} fill={fillStyle} />
          <path d="M 78 104 L 100 160 L 122 104" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="2" />
          <ellipse cx="100" cy="158" rx="6" ry="3" fill={accentColor} opacity="0.85" />
        </g>
      )
    case 'overalls':
      return (
        <g>
          <path d={aShort} fill={fillStyle} />
          <rect x="86" y="104" width="28" height="36" fill={fillStyle} />
          <path d="M 88 104 L 88 92 M 112 104 L 112 92" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
          <circle cx="92" cy="112" r="2" fill={accentColor} />
          <circle cx="108" cy="112" r="2" fill={accentColor} />
        </g>
      )
    case 'tunic_skirt':
      return (
        <g>
          <path d="M 78 104 L 74 148 L 126 148 L 122 104 Z" fill={fillStyle} />
          <path d="M 74 148 L 58 205 L 142 205 L 126 148 Z" fill={fillStyle} />
          <line x1="74" y1="148" x2="126" y2="148" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" />
          <path d="M 70 104 Q 78 96 86 104" fill={fillStyle} />
          <path d="M 114 104 Q 122 96 130 104" fill={fillStyle} />
        </g>
      )
    case 'romper':
      return (
        <g>
          <path d="M 78 104 L 74 175 L 126 175 L 122 104 Z" fill={fillStyle} />
          <path d="M 74 175 L 78 195 L 98 195 L 99 175 Z" fill={fillStyle} />
          <path d="M 101 175 L 102 195 L 122 195 L 126 175 Z" fill={fillStyle} />
          <path d="M 86 96 L 88 104 M 114 96 L 112 104" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        </g>
      )
    case 'apron_dress':
    default:
      return (
        <g>
          <path d={aline} fill={fillStyle} />
          <rect x="86" y="120" width="28" height="80" fill="#fcfaf4" opacity="0.85" />
          <path d="M 78 120 L 122 120" stroke={accentColor} strokeWidth="2" />
          <circle cx="100" cy="120" r="3" fill={accentColor} />
          <path d="M 92 120 L 96 100 M 108 120 L 104 100" stroke={accentColor} strokeWidth="1.5" fill="none" />
        </g>
      )
  }
}

function Hair({ style, color }: { style: string; color: string }) {
  switch (style) {
    case 'pixie':
      return <path d="M 70 56 Q 70 26 100 26 Q 130 26 130 56 Q 128 60 116 56 Q 100 50 84 56 Q 72 60 70 56 Z" fill={color} />
    case 'bob':
      return (
        <g>
          <path d="M 68 58 Q 68 26 100 26 Q 132 26 132 58 L 132 80 Q 132 88 118 86 Q 100 82 82 86 Q 68 88 68 80 Z" fill={color} />
          <path d="M 76 44 Q 100 36 124 44 L 124 54 Q 100 50 76 54 Z" fill={color} />
        </g>
      )
    case 'long':
      return (
        <g>
          <path d="M 66 56 Q 66 26 100 26 Q 134 26 134 56 L 138 160 Q 134 168 124 165 Q 124 130 130 100 Q 100 110 70 100 Q 76 130 76 165 Q 66 168 62 160 Z" fill={color} />
          <path d="M 76 42 Q 100 34 124 42 L 124 52 Q 100 48 76 52 Z" fill={color} />
        </g>
      )
    case 'ponytail':
      return (
        <g>
          <path d="M 68 58 Q 68 26 100 26 Q 132 26 132 58 Q 130 64 118 60 Q 100 54 84 60 Q 70 64 68 58 Z" fill={color} />
          <path d="M 132 50 Q 162 80 150 130 Q 142 132 138 124 Q 144 100 130 76 Z" fill={color} />
          <circle cx="140" cy="60" r="3" fill="#c68a3a" />
        </g>
      )
    case 'braids':
      return (
        <g>
          <path d="M 66 56 Q 66 26 100 26 Q 134 26 134 56 Q 132 62 120 58 Q 100 52 80 58 Q 68 62 66 56 Z" fill={color} />
          <path d="M 70 60 Q 56 100 60 150 Q 70 152 76 148 Q 78 100 86 64 Z" fill={color} />
          <path d="M 130 60 Q 144 100 140 150 Q 130 152 124 148 Q 122 100 114 64 Z" fill={color} />
          <circle cx="68" cy="150" r="3" fill="#c68a3a" />
          <circle cx="132" cy="150" r="3" fill="#c68a3a" />
        </g>
      )
    case 'bun':
      return (
        <g>
          <circle cx="100" cy="22" r="14" fill={color} />
          <path d="M 68 58 Q 68 30 100 30 Q 132 30 132 58 Q 130 64 116 60 Q 100 54 84 60 Q 70 64 68 58 Z" fill={color} />
        </g>
      )
    case 'curls':
      return (
        <g>
          <path d="M 66 60 Q 60 38 78 32 Q 78 22 96 26 Q 100 18 110 26 Q 124 22 128 36 Q 142 36 138 60 Q 134 66 122 60 Q 100 54 78 60 Q 70 66 66 60 Z" fill={color} />
          <circle cx="70" cy="76" r="6" fill={color} />
          <circle cx="130" cy="76" r="6" fill={color} />
        </g>
      )
    case 'wavy':
    default:
      return (
        <g>
          <path d="M 64 58 Q 64 26 100 26 Q 136 26 136 58 Q 144 100 140 140 Q 132 142 128 134 Q 132 100 124 76 Q 100 70 76 76 Q 68 100 72 134 Q 68 142 60 140 Q 56 100 64 58 Z" fill={color} />
          <path d="M 76 44 Q 96 36 124 50 L 122 56 Q 100 48 76 54 Z" fill={color} />
        </g>
      )
  }
}

function Accessory({ id, cloth }: { id: string; cloth: string }) {
  switch (id) {
    case 'flower_crown':
      // wildflowers: cornflower / poppy / buttercup
      return (
        <g>
          {[68, 84, 100, 116, 132].map((cx, i) => (
            <Flower key={i} cx={cx} cy={30 + (i % 2 === 0 ? 0 : -2)} color={['#6f93da', '#e0563f', '#f2c14e'][i % 3]} />
          ))}
        </g>
      )
    case 'sun_hat':
      return (
        <g>
          <ellipse cx="100" cy="34" rx="50" ry="9" fill="#d8b878" />
          <path d="M 78 34 Q 78 14 100 14 Q 122 14 122 34 Z" fill="#c79a55" />
          <rect x="78" y="30" width="44" height="6" fill={cloth} opacity="0.85" />
        </g>
      )
    case 'bandana':
      return (
        <g>
          <path d="M 68 36 Q 100 18 132 36 L 130 50 Q 100 44 70 50 Z" fill={cloth} />
          <path d="M 68 36 Q 100 18 132 36" fill="none" stroke="rgba(0,0,0,0.15)" />
        </g>
      )
    case 'single_bloom':
      return <Flower cx={128} cy={38} color="#6f93da" />
    case 'leaf_clip':
      return (
        <g transform="translate(122 38) rotate(-22)">
          <path d="M 0 0 Q 12 6 0 14 Q -6 7 0 0 Z" fill="#86a06e" />
          <path d="M 0 2 L 0 12" stroke="#566e45" strokeWidth="0.8" />
        </g>
      )
    case 'none':
    default:
      return null
  }
}

function Flower({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy - 3} r="3" fill={color} />
      <circle cx={cx - 3} cy={cy} r="3" fill={color} />
      <circle cx={cx + 3} cy={cy} r="3" fill={color} />
      <circle cx={cx} cy={cy + 3} r="3" fill={color} />
      <circle cx={cx} cy={cy} r="1.6" fill="#f2c14e" />
    </g>
  )
}

function Shoes({ id, cloth }: { id: string; cloth: string }) {
  switch (id) {
    case 'clogs':
      return (
        <g>
          <ShoeBlock cx={88} color="#7a4a26" />
          <ShoeBlock cx={112} color="#7a4a26" />
        </g>
      )
    case 'boots':
      return (
        <g>
          <rect x="79" y="200" width="18" height="48" rx="3" fill="#5a3520" />
          <rect x="103" y="200" width="18" height="48" rx="3" fill="#5a3520" />
          <ellipse cx="88" cy="247" rx="10" ry="5" fill="#3a2110" />
          <ellipse cx="112" cy="247" rx="10" ry="5" fill="#3a2110" />
        </g>
      )
    case 'flats':
      return (
        <g>
          <path d="M 78 246 Q 88 240 98 246 L 96 250 Q 88 252 80 250 Z" fill={cloth} />
          <path d="M 102 246 Q 112 240 122 246 L 120 250 Q 112 252 104 250 Z" fill={cloth} />
        </g>
      )
    case 'sandals':
      return (
        <g>
          <ellipse cx="88" cy="248" rx="10" ry="3" fill="#7a4a26" />
          <ellipse cx="112" cy="248" rx="10" ry="3" fill="#7a4a26" />
          <path d="M 84 246 L 92 244 M 108 246 L 116 244" stroke="#7a4a26" strokeWidth="1.5" />
        </g>
      )
    case 'wellies':
      return (
        <g>
          <rect x="78" y="195" width="20" height="55" rx="4" fill={cloth} />
          <rect x="102" y="195" width="20" height="55" rx="4" fill={cloth} />
          <ellipse cx="88" cy="249" rx="11" ry="5" fill="rgba(0,0,0,0.3)" />
          <ellipse cx="112" cy="249" rx="11" ry="5" fill="rgba(0,0,0,0.3)" />
        </g>
      )
    case 'barefoot':
    default:
      return null
  }
}

function ShoeBlock({ cx, color }: { cx: number; color: string }) {
  return (
    <g>
      <rect x={cx - 9} y="240" width="18" height="10" rx="2" fill={color} />
      <ellipse cx={cx} cy="248" rx="10" ry="3" fill="rgba(0,0,0,0.25)" />
    </g>
  )
}
