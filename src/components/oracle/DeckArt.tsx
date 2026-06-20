import type { OracleDeck } from '../../stores/oracleStore'

export type DeckKind = 'forest' | 'herb' | 'flower'

// map a deck to its generator/art kind via its bed_type
export function deckKind(deck: Pick<OracleDeck, 'bed_type'>): DeckKind {
  if (deck.bed_type === 'forest_floor') return 'forest'
  if (deck.bed_type === 'herb_garden') return 'herb'
  return 'flower'
}

// gold corner flourish (4 corners via the .flo tl/tr/bl/br transforms)
function Flo({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg className={`flo ${pos}`} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M6 34 C6 16 16 6 34 6" stroke="#f0dca0" strokeWidth="2" fill="none" />
      <circle cx="34" cy="6" r="2.4" fill="#f0dca0" />
      <path d="M10 34 C10 22 22 10 30 12" stroke="#f0dca0" strokeWidth="1.2" fill="none" opacity=".7" />
    </svg>
  )
}

export function DeckFlourishes() {
  return (
    <>
      <Flo pos="tl" />
      <Flo pos="tr" />
      <Flo pos="bl" />
      <Flo pos="br" />
    </>
  )
}

// The three signature deck illustrations (from oracle_decks_mock.html).
export default function DeckArt({ kind }: { kind: DeckKind }) {
  if (kind === 'forest') {
    return (
      <svg className="art" viewBox="0 0 320 250" aria-hidden="true">
        <defs>
          <radialGradient id="dfg" cx="50%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#19623f" />
            <stop offset="60%" stopColor="#0d3b27" />
            <stop offset="100%" stopColor="#06180f" />
          </radialGradient>
        </defs>
        <rect width="320" height="250" fill="url(#dfg)" />
        <circle cx="232" cy="56" r="20" fill="#f5efcf" opacity=".92" />
        <circle cx="225" cy="52" r="20" fill="url(#dfg)" />
        <g fill="#dfeac0">
          <circle cx="60" cy="44" r="1.4" />
          <circle cx="110" cy="30" r="1.1" />
          <circle cx="280" cy="100" r="1.2" />
          <circle cx="40" cy="110" r="1" />
          <circle cx="300" cy="40" r="1.1" />
        </g>
        <path d="M0 210 Q160 188 320 210 L320 250 L0 250 Z" fill="#0a2417" />
        <rect x="151" y="150" width="16" height="70" rx="4" fill="#3a2a18" />
        <path
          d="M159 220 L159 165 M159 185 L142 172 M159 185 L176 172 M159 200 L146 192 M159 200 L172 192"
          stroke="#3a2a18"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <g>
          <circle cx="159" cy="120" r="46" fill="#1d6b42" />
          <circle cx="120" cy="138" r="34" fill="#175a37" />
          <circle cx="198" cy="138" r="34" fill="#175a37" />
          <circle cx="140" cy="104" r="30" fill="#2a7d50" />
          <circle cx="180" cy="104" r="30" fill="#2a7d50" />
          <circle cx="159" cy="92" r="26" fill="#36925e" />
        </g>
        <path d="M133 92 a26 26 0 0 1 52 0" stroke="#bfe6b0" strokeWidth="2" fill="none" opacity=".5" />
        <g fill="#e7cf86">
          <circle cx="80" cy="170" r="2" />
          <circle cx="240" cy="160" r="2" />
          <circle cx="200" cy="195" r="1.6" />
        </g>
      </svg>
    )
  }
  if (kind === 'herb') {
    return (
      <svg className="art" viewBox="0 0 320 250" aria-hidden="true">
        <defs>
          <radialGradient id="dhg" cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#2c7048" />
            <stop offset="60%" stopColor="#194d31" />
            <stop offset="100%" stopColor="#0a2b1b" />
          </radialGradient>
        </defs>
        <rect width="320" height="250" fill="url(#dhg)" />
        <circle cx="160" cy="118" r="74" fill="none" stroke="#e7cf86" strokeWidth="1.5" opacity=".5" />
        <circle cx="160" cy="118" r="64" fill="none" stroke="#e7cf86" strokeWidth=".8" opacity=".35" />
        <path d="M160 210 C160 170 160 120 160 70" stroke="#2f6b46" strokeWidth="5" fill="none" strokeLinecap="round" />
        <g fill="#7cae74" stroke="#9fc796" strokeWidth="1">
          <ellipse cx="132" cy="150" rx="22" ry="11" transform="rotate(-28 132 150)" />
          <ellipse cx="188" cy="150" rx="22" ry="11" transform="rotate(28 188 150)" />
          <ellipse cx="128" cy="118" rx="24" ry="11" transform="rotate(-22 128 118)" />
          <ellipse cx="192" cy="118" rx="24" ry="11" transform="rotate(22 192 118)" />
          <ellipse cx="134" cy="88" rx="20" ry="10" transform="rotate(-18 134 88)" />
          <ellipse cx="186" cy="88" rx="20" ry="10" transform="rotate(18 186 88)" />
          <ellipse cx="160" cy="66" rx="13" ry="20" />
        </g>
        <g fill="#cfe9c4" opacity=".8">
          <circle cx="150" cy="120" r="2.2" />
          <circle cx="172" cy="96" r="2" />
          <circle cx="160" cy="150" r="2" />
        </g>
      </svg>
    )
  }
  return (
    <svg className="art" viewBox="0 0 320 250" aria-hidden="true">
      <defs>
        <radialGradient id="dwg" cx="50%" cy="22%" r="85%">
          <stop offset="0%" stopColor="#3a8a55" />
          <stop offset="45%" stopColor="#1f6038" />
          <stop offset="100%" stopColor="#0b2c1b" />
        </radialGradient>
      </defs>
      <rect width="320" height="250" fill="url(#dwg)" />
      <circle cx="160" cy="40" r="46" fill="#f6efc7" opacity=".18" />
      <path d="M0 200 Q160 178 320 200 L320 250 L0 250 Z" fill="#0c3120" />
      <g stroke="#2f7d4d" strokeWidth="3" strokeLinecap="round">
        <path d="M40 220 Q44 196 38 180" />
        <path d="M280 220 Q276 196 284 182" />
        <path d="M120 226 Q124 206 118 192" />
        <path d="M210 226 Q206 206 214 192" />
      </g>
      <g stroke="#2f7d4d" strokeWidth="4" fill="none" strokeLinecap="round">
        <path d="M110 222 C108 180 112 150 110 120" />
        <path d="M160 226 C160 184 160 150 160 104" />
        <path d="M210 222 C212 180 208 152 210 124" />
      </g>
      <g transform="translate(110,114)" fill="#6f93da">
        <g>
          <ellipse rx="7" ry="14" />
          <ellipse rx="7" ry="14" transform="rotate(60)" />
          <ellipse rx="7" ry="14" transform="rotate(120)" />
          <ellipse rx="7" ry="14" transform="rotate(30)" />
          <ellipse rx="7" ry="14" transform="rotate(90)" />
          <ellipse rx="7" ry="14" transform="rotate(150)" />
        </g>
        <circle r="5" fill="#3b5aa6" />
      </g>
      <g transform="translate(160,98)">
        <g fill="#e36f80">
          <ellipse cx="0" cy="-12" rx="13" ry="15" />
          <ellipse cx="-13" cy="2" rx="13" ry="15" />
          <ellipse cx="13" cy="2" rx="13" ry="15" />
          <ellipse cx="0" cy="10" rx="13" ry="13" />
        </g>
        <circle r="6" fill="#2f2330" />
      </g>
      <g transform="translate(210,118)">
        <g fill="#f3ecd6">
          <ellipse rx="5" ry="13" />
          <ellipse rx="5" ry="13" transform="rotate(45)" />
          <ellipse rx="5" ry="13" transform="rotate(90)" />
          <ellipse rx="5" ry="13" transform="rotate(135)" />
        </g>
        <circle r="6" fill="#ecc44e" />
      </g>
    </svg>
  )
}
