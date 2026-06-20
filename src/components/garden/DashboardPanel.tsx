import { useEffect, useState } from 'react'
import '../../styles/dashboard.css'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'
import Gardener from '../character/Gardener'

interface Metrics {
  blooms: number
  cards: number
  angels: number
  journals: number
  streak: number
  minutes: number
  art: number
  stars: number
  iam: number
}

const ZERO: Metrics = { blooms: 0, cards: 0, angels: 0, journals: 0, streak: 0, minutes: 0, art: 0, stars: 0, iam: 0 }

// consecutive-day streak ending today or yesterday, from journal entry_dates
function computeStreak(dates: string[]): number {
  const set = new Set(dates)
  if (set.size === 0) return 0
  const today = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const cursor = new Date(today)
  if (!set.has(iso(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!set.has(iso(cursor))) return 0
  }
  let streak = 0
  while (set.has(iso(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export default function DashboardPanel() {
  const { user, greenProfile, greenSubscription } = useAuth()
  const [m, setM] = useState<Metrics>(ZERO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const uid = user?.id
    if (!uid) return
    let cancelled = false

    const countOf = async (
      table: string,
      extra?: (q: ReturnType<typeof baseCount>) => ReturnType<typeof baseCount>,
    ) => {
      function baseCount() {
        return supabase.from(table).select('*', { count: 'exact', head: true }).eq('user_id', uid)
      }
      const q = extra ? extra(baseCount()) : baseCount()
      const { count } = await q
      return count ?? 0
    }

    const load = async () => {
      setLoading(true)
      const [blooms, cards, angels, art, stars, iam, listenRes, journalRes] = await Promise.all([
        countOf('green_seed_grants'),
        countOf('green_daily_draws'),
        countOf('green_angel_draws'),
        countOf('green_art_creations'),
        countOf('green_sky_stars'),
        countOf('green_shadowmoss_encounters', (q) => q.eq('is_favorite', true)),
        supabase.from('green_listening_daily').select('seconds').eq('user_id', uid),
        supabase.from('green_journal_entries').select('entry_date').eq('user_id', uid),
      ])
      const seconds = (listenRes.data ?? []).reduce(
        (sum: number, r: { seconds: number | null }) => sum + (r.seconds ?? 0),
        0,
      )
      const dates = (journalRes.data ?? []).map((r: { entry_date: string }) => r.entry_date)
      if (cancelled) return
      setM({
        blooms,
        cards,
        angels,
        journals: dates.length,
        streak: computeStreak(dates),
        minutes: Math.floor(seconds / 60),
        art,
        stars,
        iam,
      })
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const memberSince = greenSubscription?.created_at ?? greenProfile?.created_at
  const since = memberSince
    ? new Date(memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '—'
  const name = greenProfile?.character_name || greenProfile?.display_name || 'Gardener'

  const stats: { label: string; value: number; suffix?: string }[] = [
    { label: 'Blooms earned', value: m.blooms },
    { label: 'Cards drawn', value: m.cards },
    { label: 'Angel readings', value: m.angels },
    { label: 'Journal entries', value: m.journals },
    { label: 'Journal streak', value: m.streak, suffix: m.streak === 1 ? ' day' : ' days' },
    { label: 'Listening minutes', value: m.minutes },
    { label: 'Art pieces', value: m.art },
    { label: 'Stars saved', value: m.stars },
    { label: 'I AM favorites', value: m.iam },
  ]

  return (
    <div className="dashboard">
      <div className="wrap">
        <header className="dash-head">
          <div className="dash-avatar">
            <Gardener avatar={greenProfile?.avatar} size={64} ariaLabel="Your gardener" />
          </div>
          <div>
            <h1>{name}</h1>
            <p className="dash-since">Tending since {since}</p>
          </div>
        </header>

        <div className="dash-grid">
          {stats.map((s) => (
            <div key={s.label} className="dash-card">
              <span className="dash-value">{loading ? '·' : s.value}{s.suffix ?? ''}</span>
              <span className="dash-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
