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

// The Mushroom shows EXACTLY these 5 groups. Each track's `category` is matched by
// substring (case/space-insensitive, like violet's normalizeCategory) so we hit the
// real stored strings without hardcoding their exact casing. Non-matching = hidden.
const GROUPS: { label: string; match: (c: string) => boolean }[] = [
  { label: 'Bach Flowers', match: (c) => c.includes('bach') },
  { label: 'Chakra Colors', match: (c) => c.includes('chakra') || c.includes('color') || c.includes('colour') },
  { label: 'Emotions', match: (c) => c.includes('emotion') },
  { label: 'Immune System', match: (c) => c.includes('immune') || c.includes('detox') },
  { label: 'Aura', match: (c) => c.includes('aura') },
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
let tonesGateBusy = false // guards against a double-grant while the upsert is in flight

export const useFrequencyStore = create<FrequencyState>((set, get) => {
  // flush accrued real-playing seconds to green_listening_daily(user_id, listen_date, seconds);
  // once today crosses 7 minutes, grant one Resonance Willow seed (capped by the seed economy).
  const accrue = async (userId: string) => {
    if (pending <= 0) return
    const delta = pending
    pending = 0
    const today = new Date().toISOString().slice(0, 10)
    const row = (
      await supabase
        .from('green_listening_daily')
        .select('seconds')
        .eq('user_id', userId)
        .eq('listen_date', today)
        .maybeSingle()
    ).data
    const prevTotal = (row?.seconds as number) || 0
    const newTotal = prevTotal + delta

    await supabase.from('green_listening_daily').upsert(
      { user_id: userId, listen_date: today, seconds: newTotal },
      { onConflict: 'user_id,listen_date' },
    )
    set({ todaySeconds: newTotal })

    // 7-minute gate → grantSeed('tones'). DB UNIQUE + todayGrants keep it to once/day.
    if (newTotal >= TONES_THRESHOLD && !tonesGateBusy) {
      const seed = useSeedStore.getState()
      if (!seed.todayGrants.includes('tones')) {
        tonesGateBusy = true
        try {
          const r = await seed.grantSeed({ userId, activityType: 'tones', sourceKey: 'tones' })
          if (r.granted && r.bloom) {
            useToastStore
              .getState()
              .push(`🌱 You earned a ${r.bloom.display_name} seed — it'll bloom in your garden tomorrow`)
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
      const { data, error } = await supabase
        .from('frequency_tracks')
        .select('id,slug,name,category,hz,audio_url,duration_seconds,related_chakra,notes,metadata')
        .eq('is_active', true)
        .order('category')
        .order('name')
      if (error) {
        console.error('loadTracks error', error)
        return
      }
      const tracks = (data ?? []) as Track[]
      const used = new Set<string>()
      const grouped: Record<string, Track[]> = {}
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
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('green_listening_daily')
        .select('seconds')
        .eq('user_id', userId)
        .eq('listen_date', today)
        .maybeSingle()
      set({ todaySeconds: (data?.seconds as number) || 0 })
    },

    playTrack: async (track, userId) => {
      void accrue(userId) // flush whatever was accrued on the previous track
      stopPolling()
      if (sound) {
        sound.stop()
        sound.unload()
        sound = null
      }
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
