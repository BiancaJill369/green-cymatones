import { create } from 'zustand'
import { Howl } from 'howler'
import { supabase } from '../lib/supabaseClient'
import { useToastStore } from './toastStore'
import { useSeedStore } from './seedStore'

// audio_url is either an absolute URL or a path in the shared CT private
// "audio-tracks" Storage bucket (resolved exactly like violet.cymatones — a 1-hour
// signed URL from the existing Supabase client; getPublicUrl 403s on a private bucket).
// Needs only VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY — no separate audio-base env var.
async function resolveAudio(path: string): Promise<string> {
  if (/^https?:\/\//.test(path)) return path // already absolute
  const { data, error } = await supabase.storage.from('audio-tracks').createSignedUrl(path, 3600)
  if (error) {
    console.error('resolveAudio createSignedUrl failed for', path, error)
    return ''
  }
  return data?.signedUrl ?? ''
}

export interface Track {
  id: string
  slug: string
  name: string
  category: string
  hz: number | null
  audio_url: string
  duration_seconds: number | null
  related_chakra: string | null
  notes: string | null
  metadata: Record<string, unknown> | null
}

const TONES_THRESHOLD = 420 // 7 minutes/day → one Resonance Willow seed (Chunk 16)

// The Mushroom shows EXACTLY these 7 groups, matched against tracks.category_text
// by substring (case/space/plural-insensitive, like violet's normalizeCategory) so
// we hit the real stored strings without hardcoding their exact casing. Any track
// whose category_text matches none of these is hidden.
const GROUPS: { label: string; match: (c: string) => boolean }[] = [
  { label: 'Bach Flowers', match: (c) => c.includes('bach') },
  { label: 'Chakra', match: (c) => c.includes('chakra') },
  { label: 'Emotions', match: (c) => c.includes('emotion') },
  { label: 'Minerals', match: (c) => c.includes('mineral') },
  { label: 'Aura', match: (c) => c.includes('aura') },
  { label: 'For Women', match: (c) => c.includes('women') },
  { label: 'Immune System', match: (c) => c.includes('immune') },
  { label: 'Eyes', match: (c) => c.includes('eye') },
  { label: 'Nose', match: (c) => c.includes('nose') },
  { label: 'Hair', match: (c) => c.includes('hair') },
  { label: 'Lungs', match: (c) => c.includes('lung') },
]

interface FrequencyState {
  tracksByCategory: Record<string, Track[]>
  currentTrack: Track | null
  isPlaying: boolean
  positionSec: number
  todaySeconds: number
  loadTracks: () => Promise<void>
  loadListening: (userId: string) => Promise<void>
  playTrack: (track: Track, userId: string) => void
  togglePlay: (userId: string) => void
  stopPlayback: (userId: string) => Promise<void>
}

// audio + accrual live outside the store (single Howl instance)
let sound: Howl | null = null
let pollId: ReturnType<typeof setInterval> | null = null
let pending = 0
let currentTrackId: string | null = null // which track the accruing seconds belong to
let tonesGateBusy = false // guards against a double-grant while the upsert is in flight

const today10 = () => new Date().toISOString().slice(0, 10)

// sum TODAY's listened seconds across all of this user's per-track rows (Chunk 17)
async function sumTodaySeconds(userId: string): Promise<number> {
  const { data } = await supabase
    .from('green_track_listening')
    .select('seconds')
    .eq('user_id', userId)
    .eq('listen_date', today10())
  return (data ?? []).reduce(
    (s: number, r: { seconds: number | null }) => s + (r.seconds ?? 0),
    0,
  )
}

export const useFrequencyStore = create<FrequencyState>((set, get) => {
  // flush accrued real-playing seconds to green_track_listening(user_id, track_id, listen_date);
  // the 7-min gate sums TODAY's seconds across every track row (Chunk 17 retires
  // green_listening_daily), then grants one Resonance Willow seed (capped by the economy).
  const accrue = async (userId: string) => {
    if (pending <= 0 || !currentTrackId) return
    const delta = pending
    pending = 0
    const today = today10()
    const trackId = currentTrackId

    const row = (
      await supabase
        .from('green_track_listening')
        .select('seconds')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .eq('listen_date', today)
        .maybeSingle()
    ).data
    const newSeconds = ((row?.seconds as number) || 0) + delta
    await supabase.from('green_track_listening').upsert(
      { user_id: userId, track_id: trackId, listen_date: today, seconds: newSeconds },
      { onConflict: 'user_id,track_id,listen_date' },
    )

    const total = await sumTodaySeconds(userId)
    set({ todaySeconds: total })

    // 7-minute gate → grantSeed('tones'). DB UNIQUE + todayGrants keep it to once/day.
    if (total >= TONES_THRESHOLD && !tonesGateBusy) {
      const seed = useSeedStore.getState()
      if (!seed.todayGrants.includes('tones')) {
        tonesGateBusy = true
        try {
          const r = await seed.grantSeed({ userId, activityType: 'tones' })
          if (r.granted && r.bloom) {
            useToastStore
              .getState()
              .push(`🌱 You earned a ${r.bloom.display_name} seed — it's waiting in your Seed Bag`)
          }
        } finally {
          tonesGateBusy = false
        }
      }
    }
  }

  const stopPolling = () => {
    if (pollId) {
      clearInterval(pollId)
      pollId = null
    }
  }

  const startPolling = (userId: string) => {
    stopPolling()
    pollId = setInterval(() => {
      if (!sound) return
      const pos = sound.seek()
      if (typeof pos === 'number') set({ positionSec: pos })
      if (sound.playing()) {
        pending += 1
        set((s) => ({ todaySeconds: s.todaySeconds + 1 })) // optimistic live progress
        if (pending >= 10) void accrue(userId)
      }
    }, 1000)
  }

  return {
    tracksByCategory: {},
    currentTrack: null,
    isPlaying: false,
    positionSec: 0,
    todaySeconds: 0,

    loadTracks: async () => {
      // select('*') so a renamed/absent column (slug/is_active/metadata) can't
      // error the whole query; we don't filter on audio_url, so tracks whose
      // audio can't resolve still appear (audio resolves lazily at play time).
      const { data, error } = await supabase
        .from('tracks') // shared CymaTones catalogue (public.tracks)
        .select('*')
        .order('name')
      if (error) {
        console.error('[mushroom] loadTracks Supabase ERROR:', error.message, error)
        return
      }
      const rows = (data ?? []) as (Track & { is_active?: boolean; category_text?: string | null })[]
      // keep active rows when the column exists; otherwise keep all (don't over-filter).
      // The shared `tracks` table stores the group in `category_text` (the same
      // column violet reads) — normalise it onto `category` for the rest of the app.
      const tracks = rows
        .filter((t) => t.is_active !== false)
        .map((t) => ({ ...t, category: (t.category_text ?? t.category ?? '') as string }))

      // DEBUG: surface exactly what came back so a category mismatch / RLS / empty
      // table is obvious from the console.
      const cats = [...new Set(tracks.map((t) => t.category ?? '(null)'))]
      if (tracks.length === 0) {
        console.warn(
          `[mushroom] tracks returned ${rows.length} rows, 0 usable. If rows exist in the DB but this is empty, the SELECT policy likely doesn’t grant "authenticated" — add a public-read RLS policy.`,
        )
      } else {
        console.log(`[mushroom] loaded ${tracks.length} tracks; distinct categories:`, cats)
      }

      const used = new Set<string>()
      const grouped: Record<string, Track[]> = {}
      // ONLY the 7 named groups, matched by substring on category_text (normalised
      // onto `category` above). Anything matching none of them is hidden.
      for (const g of GROUPS) {
        const inGroup = tracks.filter(
          (t) => !used.has(t.id) && g.match((t.category || '').toLowerCase()),
        )
        inGroup.forEach((t) => used.add(t.id))
        if (inGroup.length) grouped[g.label] = inGroup
      }
      set({ tracksByCategory: grouped })
    },

    loadListening: async (userId) => {
      set({ todaySeconds: await sumTodaySeconds(userId) })
    },

    playTrack: async (track, userId) => {
      await accrue(userId) // flush whatever was accrued on the previous track (old trackId)
      stopPolling()
      if (sound) {
        sound.stop()
        sound.unload()
        sound = null
      }
      currentTrackId = track.id
      // bump play count for this track today (Chunk 17 per-track rollup)
      const today = today10()
      const prev = (
        await supabase
          .from('green_track_listening')
          .select('plays')
          .eq('user_id', userId)
          .eq('track_id', track.id)
          .eq('listen_date', today)
          .maybeSingle()
      ).data
      await supabase.from('green_track_listening').upsert(
        { user_id: userId, track_id: track.id, listen_date: today, plays: ((prev?.plays as number) || 0) + 1 },
        { onConflict: 'user_id,track_id,listen_date' },
      )
      set({ currentTrack: track, isPlaying: true, positionSec: 0 })
      const src = await resolveAudio(track.audio_url)
      if (!src) {
        set({ isPlaying: false })
        return
      }
      sound = new Howl({
        src: [src],
        html5: true,
        onend: () => {
          void get().stopPlayback(userId)
        },
      })
      sound.play()
      startPolling(userId)
    },

    togglePlay: (userId) => {
      if (!sound) return
      if (get().isPlaying) {
        sound.pause()
        set({ isPlaying: false })
        void accrue(userId)
      } else {
        sound.play()
        set({ isPlaying: true })
        startPolling(userId)
      }
    },

    stopPlayback: async (userId) => {
      stopPolling()
      if (sound) {
        sound.stop()
        sound.unload()
        sound = null
      }
      set({ isPlaying: false, positionSec: 0 })
      await accrue(userId)
    },
  }
})
