import type { Track } from '../stores/frequencyStore'

/**
 * The layered TCM/Western description for a frequency track, mirroring the
 * shape violet.cymatones reads (description_layered: lead / tcm / western /
 * tcm_root_cause / related_ailments). green reads the SAME shared
 * frequency_tracks table, so we pull the layered fields out of metadata
 * (either metadata.description_layered or flat on metadata), falling back to
 * the plain `notes` column for the lead.
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

export function layeredFor(track: Track): Layered {
  const md = (track.metadata ?? {}) as Record<string, unknown>
  const nested = md.description_layered
  const dl = (nested && typeof nested === 'object' ? nested : md) as Record<string, unknown>

  const relatedRaw = dl.related_ailments ?? dl.related
  const related =
    typeof relatedRaw === 'string'
      ? relatedRaw
          .split(/[,;]\s*|\n+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : []

  return {
    lead: str(dl.lead) ?? str(track.notes),
    tcm: str(dl.tcm) ?? str(dl.tcm_lens),
    western: str(dl.western),
    root: str(dl.tcm_root_cause) ?? str(dl.root_cause),
    related,
  }
}

export function hasLayered(l: Layered): boolean {
  return !!(l.lead || l.tcm || l.western || l.root || l.related.length)
}
