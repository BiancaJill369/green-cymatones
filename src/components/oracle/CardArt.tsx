import { useId, useMemo } from 'react'
import '../../styles/card-art.css'
import type { DeckKind } from './DeckArt'

/**
 * Generative oracle card art (from oracle_card_art_proto.html). Every card's
 * illustration is derived from a deterministic seed = hash(kind + '|' + title),
 * so all 99 cards get distinct, consistent vector art. Three generators by deck:
 * herb sprig / forest tree / wild-meadow flower, each on the deck's radial bg
 * with a few twinkles. Idle sway + twinkle animate; bloom-in plays on mount.
 */
const PETALS = ['#6f93da', '#e36f80', '#ecc44e', '#b98cd6', '#f3ecd6', '#e8884a', '#7fc6c0']
const BG: Record<DeckKind, [string, string, string]> = {
  herb: ['#2c7048', '#194d31', '#0a2b1b'],
  forest: ['#19623f', '#0d3b27', '#06180f'],
  flower: ['#3a8a55', '#1f6038', '#0b2c1b'],
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rng(seed: number): () => number {
  let x = seed || 1
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return (x >>> 0) / 4294967296
  }
}

function bg(defsId: string, c: [string, string, string]): string {
  return `<defs><radialGradient id="${defsId}" cx="50%" cy="34%" r="80%">
    <stop offset="0%" stop-color="${c[0]}"/><stop offset="55%" stop-color="${c[1]}"/><stop offset="100%" stop-color="${c[2]}"/>
  </radialGradient></defs><rect width="200" height="240" fill="url(#${defsId})"/>`
}

function twinkles(r: () => number): string {
  let s = ''
  for (let i = 0; i < 5; i++) {
    const x = 20 + r() * 160
    const y = 18 + r() * 70
    s += `<circle class="twinkle" style="animation-delay:${(r() * 3).toFixed(2)}s" cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(0.8 + r() * 1.2).toFixed(1)}" fill="#e7cf86"/>`
  }
  return s
}

function herb(r: () => number): string {
  const hue = 90 + Math.floor(r() * 60)
  const pairs = 3 + Math.floor(r() * 2)
  const leaf = `hsl(${hue} 42% 52%)`
  const edge = `hsl(${hue} 45% 70%)`
  let g = `<path d="M100 220 C100 170 100 120 100 ${70 - pairs * 4}" stroke="hsl(${hue} 40% 38%)" stroke-width="5" fill="none" stroke-linecap="round"/>`
  for (let i = 0; i < pairs; i++) {
    const y = 158 - i * 30
    const len = 22 - i * 2
    const rot = 24 + i * 2
    g += `<ellipse cx="${100 - len * 0.7}" cy="${y}" rx="${len}" ry="10" fill="${leaf}" stroke="${edge}" stroke-width="1" transform="rotate(${-rot} ${100 - len * 0.7} ${y})"/>`
    g += `<ellipse cx="${100 + len * 0.7}" cy="${y}" rx="${len}" ry="10" fill="${leaf}" stroke="${edge}" stroke-width="1" transform="rotate(${rot} ${100 + len * 0.7} ${y})"/>`
  }
  g += `<ellipse cx="100" cy="${66 - pairs * 4}" rx="11" ry="18" fill="hsl(${hue} 45% 60%)"/>`
  return `<g class="plant bloom">${g}</g>`
}

function forest(r: () => number): string {
  const hue = 140 + Math.floor(r() * 25)
  const blobs = 4 + Math.floor(r() * 3)
  let g = `<rect x="93" y="150" width="14" height="70" rx="4" fill="#3a2a18"/><g>`
  const tones = [`hsl(${hue} 50% 28%)`, `hsl(${hue} 48% 38%)`, `hsl(${hue} 46% 48%)`]
  for (let i = 0; i < blobs; i++) {
    const a = (i / blobs) * Math.PI * 2
    const R = 24 + r() * 8
    const cx = 100 + Math.cos(a) * 22 * r()
    const cy = 112 + Math.sin(a) * 16 * r()
    g += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${R.toFixed(0)}" fill="${tones[i % 3]}"/>`
  }
  g += `<circle cx="100" cy="104" r="26" fill="hsl(${hue} 46% 52%)"/></g>`
  return `<g class="plant bloom">${g}</g>`
}

function flower(r: () => number): string {
  const petalN = 5 + Math.floor(r() * 4)
  const col = PETALS[Math.floor(r() * PETALS.length)]
  const center = r() < 0.5 ? '#ecc44e' : '#2f2330'
  let g = `<path d="M100 222 C98 180 102 150 100 120" stroke="#2f7d4d" stroke-width="4" fill="none" stroke-linecap="round"/>`
  g += `<ellipse cx="78" cy="168" rx="16" ry="7" fill="#2f8a50" transform="rotate(-25 78 168)"/>`
  g += `<ellipse cx="122" cy="180" rx="14" ry="6" fill="#2f8a50" transform="rotate(25 122 180)"/>`
  g += `<g class="bloom" style="transform-origin:100px 104px"><g transform="translate(100,104)">`
  for (let i = 0; i < petalN; i++) {
    const rot = (360 / petalN) * i
    g += `<ellipse rx="9" ry="20" fill="${col}" transform="rotate(${rot})"/>`
  }
  g += `<circle r="8" fill="${center}"/></g></g>`
  return `<g class="plant">${g}</g>`
}

export default function CardArt({
  kind,
  title,
  size = 200,
}: {
  kind: DeckKind
  title: string
  size?: number
}) {
  const uid = useId().replace(/[:]/g, '-')
  const inner = useMemo(() => {
    const r = rng(hash(`${kind}|${title}`))
    const art = kind === 'herb' ? herb(r) : kind === 'forest' ? forest(r) : flower(r)
    return bg(`ca-${uid}`, BG[kind]) + twinkles(rng(hash(title))) + art
  }, [kind, title, uid])

  return (
    <svg
      className="card-art"
      viewBox="0 0 200 240"
      width={size}
      role="img"
      aria-label={`${title} illustration`}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  )
}
