import { create } from 'zustand'
import { Howl } from 'howler'
import { supabase } from '../lib/supabaseClient'
import { useToastStore } from './toastStore'

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

const TUNING_THRESHOLD = 180 // 3 minutes/day → one tuning mushroom

interface FrequencyState {
  tracksByCategory: Record<string, Track[]>
  currentTrack: Track | null
  isPlaying: boolean
  positionSec: number
  todaySeconds: number
  tuningEarned: boolean
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

export const useFrequencyStore = create<FrequencyState>((set, get) => {
  // flush accrued real-playing seconds to green_listening_daily; award a mushroom at the threshold
  const accrue = async (userId: string) => {
    if (pending <= 0) return
    const delta = pending
    pending = 0
    const today = new Date().toISOString().slice(0, 10)
    const row = (
      await supabase
        .from('green_listening_daily')
        .select('*')
        .eq('user_id', userId)
        .eq('listen_date', today)
        .maybeSingle()
    ).data
    const prevTotal = (row?.total_seconds as number) || 0
    const wasEarned = !!row?.tuning_seed_earned
    const newTotal = prevTotal + delta
    const award = !wasEarned && newTotal >= TUNING_THRESHOLD

    await supabase.from('green_listening_daily').upsert(
      {
        user_id: userId,
        listen_date: today,
        total_seconds: newTotal,
        tuning_seed_earned: wasEarned || award,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,listen_date' },
    )
    set({ todaySeconds: newTotal, tuningEarned: wasEarned || award })

    if (award) {
      const bed = (
        await supabase
          .from('green_garden_beds')
          .select('id')
          .eq('user_id', userId)
          .eq('bed_type', 'forest_floor')
          .single()
      ).data
      if (bed) {
        await supabase.from('green_garden_elements').insert({
          user_id: userId,
          bed_id: bed.id,
          element_type: 'mushroom',
          seed_source: 'tuning_seed',
          position_x: 10 + Math.random() * 80,
          position_y: 15 + Math.random() * 65,
          growth_stage: 0,
        })
      }
      useToastStore.getState().push('🍄 A tuning mushroom sprouted in your Forest Floor')
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
    tuningEarned: false,

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
      const grouped: Record<string, Track[]> = {}
      for (const t of (data ?? []) as Track[]) {
        const cat = t.category || 'Other'
        ;(grouped[cat] ??= []).push(t)
      }
      set({ tracksByCategory: grouped })
    },

    loadListening: async (userId) => {
      const today = new Date().toISOString().slice(0, 10)
      const { data } = await supabase
        .from('green_listening_daily')
        .select('*')
        .eq('user_id', userId)
        .eq('listen_date', today)
        .maybeSingle()
      set({
        todaySeconds: (data?.total_seconds as number) || 0,
        tuningEarned: !!data?.tuning_seed_earned,
      })
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
