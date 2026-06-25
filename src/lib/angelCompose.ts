import type { AngelReading } from '../stores/angelStore'

/**
 * Runtime composition for angel numbers without a curated green_angel_readings
 * row (4-digit numbers, or any missing row). Fully deterministic for a given n —
 * no API calls, no seeded table. Green calm/frequency voice.
 */

const DIGIT: Record<number, string> = {
  0: 'the infinite — wholeness, source, and pure potential',
  1: 'new beginnings and the power of your own intention',
  2: 'trust, balance, and faith in the unfolding',
  3: 'creativity, joyful expression, and unseen support',
  4: 'steady foundations and the nearness of your guides',
  5: 'welcome change and the freedom to grow',
  6: 'home, nurturing, and tending what you love',
  7: 'deepening intuition and spiritual awakening',
  8: 'abundance, flow, and the return of what you give',
  9: 'completion, release, and stepping into service',
}

// root vibration (1–9) → a warm resonant frequency
const ROOT_HZ: Record<number, number> = {
  1: 174, 2: 285, 3: 396, 4: 417, 5: 528, 6: 639, 7: 741, 8: 852, 9: 963,
}

type Pattern =
  | 'QUAD'
  | 'TRIPLE'
  | 'ASC_SEQ'
  | 'DESC_SEQ'
  | 'PALINDROME'
  | 'TWO_PAIR'
  | 'ONE_PAIR'
  | 'MIXED'

const LEADS: Record<Pattern, string[]> = {
  QUAD: [
    'When {n} keeps appearing, a single message is being turned all the way up.',
    '{n} is a pure, concentrated signal — one truth, amplified fourfold.',
  ],
  TRIPLE: [
    '{n} carries one strong current, with a quiet thread woven through it.',
    'Three echoes in {n} make its message loud; the fourth adds a gentle turn.',
  ],
  ASC_SEQ: [
    "{n} moves like stepping stones — you're being walked forward, one step at a time.",
    'The rising order of {n} is momentum: keep going, the path is laid.',
  ],
  DESC_SEQ: [
    '{n} winds gently down — something is completing so something new can begin.',
    'The descending steps of {n} invite you to release and let things settle.',
  ],
  PALINDROME: [
    '{n} reads the same coming and going — your inner and outer worlds are aligning.',
    "Mirror-like, {n} reflects you back to yourself; what's within is taking shape without.",
  ],
  TWO_PAIR: [
    '{n} braids two energies together — a partnership of forces meeting in you.',
    'Two pairs in {n} blend their gifts; balance is the work.',
  ],
  ONE_PAIR: [
    '{n} leans on one repeated note, supported by the rest.',
    'A doubled digit in {n} asks you to lean into its theme.',
  ],
  MIXED: [
    '{n} is a small journey — four energies meeting along one path.',
    'Each digit of {n} adds its voice to a single, layered message.',
  ],
}

const TITLE: Record<Pattern, string> = {
  QUAD: 'An Amplified Signal',
  TRIPLE: 'A Strong Current',
  ASC_SEQ: 'Stepping Stones',
  DESC_SEQ: 'A Gentle Descent',
  PALINDROME: 'A Mirror Number',
  TWO_PAIR: 'Two Energies Braided',
  ONE_PAIR: 'A Repeated Note',
  MIXED: 'A Layered Message',
}

const CLOSES = [
  'Breathe with it, and let this guide your next gentle step. 🌿',
  'Let it settle softly, and trust the step in front of you. 🌿',
  'Carry it lightly today — you are exactly where you need to be. 🌿',
  'Soften, listen, and let the next small step reveal itself. 🌿',
]

const AFFIRMS = [
  'I trust {mr}, and I let it move through me. 🌿',
  'I am open to {mr}. 🌿',
  'I welcome {mr} with a calm and steady heart. 🌿',
  'I let {mr} guide my next gentle step. 🌿',
]

const digitsOf = (n: number): number[] => String(n).split('').map(Number)

function detect(d: number[]): Pattern {
  const counts: Record<number, number> = {}
  for (const x of d) counts[x] = (counts[x] ?? 0) + 1
  const vals = Object.values(counts)
  const uniq = vals.length
  const maxc = Math.max(...vals)
  const asc = d.length >= 2 && d.every((x, i) => i === 0 || x === d[i - 1] + 1)
  const desc = d.length >= 2 && d.every((x, i) => i === 0 || x === d[i - 1] - 1)
  const pal = d.length >= 2 && d.join('') === [...d].reverse().join('')

  if (uniq === 1 && d.length >= 2) return 'QUAD'
  if (maxc === 3) return 'TRIPLE'
  if (asc) return 'ASC_SEQ'
  if (desc) return 'DESC_SEQ'
  if (pal) return 'PALINDROME'
  if (uniq === 2 && vals.every((c) => c === 2)) return 'TWO_PAIR'
  if (maxc === 2) return 'ONE_PAIR'
  return 'MIXED'
}

function rootOf(n: number): number {
  let s = n
  while (s > 9) s = String(s).split('').reduce((a, c) => a + Number(c), 0)
  return s
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

export function composeAngelReading(n: number): AngelReading {
  const d = digitsOf(n)
  const pattern = detect(d)
  const lead = LEADS[pattern][n % LEADS[pattern].length].replace(/\{n\}/g, String(n))

  // unique digit meanings, in order of appearance (deduped)
  const seen = new Set<number>()
  const uniqueDigits = d.filter((x) => (seen.has(x) ? false : (seen.add(x), true)))

  let synthesis: string
  if (pattern === 'QUAD' || pattern === 'TRIPLE') {
    const counts: Record<number, number> = {}
    for (const x of d) counts[x] = (counts[x] ?? 0) + 1
    const dominant = Number(Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0])
    synthesis = `Concentrated in ${dominant}, this number speaks of ${DIGIT[dominant]}.`
    const others = uniqueDigits.filter((x) => x !== dominant)
    if (others.length) {
      synthesis += ` A quieter thread of ${list(others.map((x) => DIGIT[x]))} runs beneath it.`
    }
  } else {
    synthesis = `This number weaves ${list(uniqueDigits.map((x) => DIGIT[x]))}.`
  }

  const r = rootOf(n)
  const message = `Its root vibration is ${r} — ${DIGIT[r]}.`
  const action = CLOSES[n % CLOSES.length]
  const affirmation = AFFIRMS[n % AFFIRMS.length].replace(/\{mr\}/g, DIGIT[r])

  return {
    number: n,
    title: TITLE[pattern],
    archetype: lead,
    meaning: synthesis,
    message,
    action,
    affirmation,
    root_lesson: DIGIT[r],
    digital_root: r,
    resonant_frequency: ROOT_HZ[r] ?? 528,
    category: 'composed',
  }
}
