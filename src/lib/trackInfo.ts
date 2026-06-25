import type { Track } from '../stores/frequencyStore'

/**
 * The layered TCM/Western description for a track. green reads the shared
 * CymaTones `tracks` table via select('*'), so the layered text can live in a
 * few shapes depending on the row — we check them all and use whichever is
 * populated (matching how violet.cymatones surfaces description_layered):
 *   1. a TOP-LEVEL `description_layered` jsonb column
 *   2. metadata.description_layered
 *   3. flat keys on metadata (tcm / western / …)
 *   4. top-level columns (tcm / western / description / notes / …)
 */
export interface Layered {
  lead?: string
  tcm?: string
  western?: string
  root?: string
  related: string[]
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

export function layeredFor(track: Track): Layered {
  const top = track as unknown as Record<string, unknown>
  const md = asObj(track.metadata) ?? {}

  // candidate sources in priority order
  const sources: Record<string, unknown>[] = []
  const topDL = asObj(top.description_layered)
  if (topDL) sources.push(topDL)
  const mdDL = asObj(md.description_layered)
  if (mdDL) sources.push(mdDL)
  sources.push(md) // flat metadata keys
  sources.push(top) // top-level columns

  const pick = (...keys: string[]): string | undefined => {
    for (const s of sources) for (const k of keys) {
      const v = str(s[k])
      if (v) return v
    }
    return undefined
  }

  let relatedRaw: string | undefined
  for (const s of sources) {
    const v = str(s.related_ailments) ?? str(s.related) ?? str(s.related_conditions)
    if (v) {
      relatedRaw = v
      break
    }
  }
  const related = relatedRaw
    ? relatedRaw
        .split(/[,;]\s*|\n+/)
        .map((x) => x.trim())
        .filter(Boolean)
    : []

  return {
    lead: pick('lead', 'description', 'summary', 'notes'),
    tcm: pick('tcm', 'tcm_lens', 'tcm_view', 'chinese', 'tcm_description'),
    western: pick('western', 'western_view', 'western_framing', 'western_description'),
    root: pick('tcm_root_cause', 'root_cause', 'underneath', 'root'),
    related,
  }
}

export function hasLayered(l: Layered): boolean {
  return !!(l.lead || l.tcm || l.western || l.root || l.related.length)
}
