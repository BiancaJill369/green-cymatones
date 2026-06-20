import { useEffect, useMemo, useState } from 'react'
import '../../styles/admin.css'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabaseClient'

interface Overview {
  total_members: number
  active_subscriptions: number
  new_members_7d: number
  active_members_7d: number
  oracle_pulls: number
  angel_readings: number
  journals: number
  art_pieces: number
  blooms_earned: number
  stars_saved: number
  listening_minutes: number
}

interface Member {
  user_id: string
  display_name: string | null
  email: string
  status: string | null
  joined: string | null
  oracle_pulls: number
  angel_readings: number
  journals: number
  art_pieces: number
  blooms: number
  listening_minutes: number
  last_active: string | null
}

interface TopTrack {
  track_id: string
  title: string | null
  category: string | null
  minutes: number
  plays: number
}

type SortKey = keyof Pick<
  Member,
  'oracle_pulls' | 'angel_readings' | 'journals' | 'art_pieces' | 'blooms' | 'listening_minutes'
>

const KPIS: { key: keyof Overview; label: string }[] = [
  { key: 'total_members', label: 'Total members' },
  { key: 'active_subscriptions', label: 'Active subs' },
  { key: 'new_members_7d', label: 'New (7d)' },
  { key: 'active_members_7d', label: 'Active (7d)' },
  { key: 'oracle_pulls', label: 'Oracle pulls' },
  { key: 'angel_readings', label: 'Angel readings' },
  { key: 'journals', label: 'Journals' },
  { key: 'art_pieces', label: 'Art pieces' },
  { key: 'blooms_earned', label: 'Blooms earned' },
  { key: 'stars_saved', label: 'Stars saved' },
  { key: 'listening_minutes', label: 'Listening min' },
]

const COLS: { key: SortKey; label: string }[] = [
  { key: 'oracle_pulls', label: 'Oracle' },
  { key: 'angel_readings', label: 'Angel' },
  { key: 'journals', label: 'Journals' },
  { key: 'art_pieces', label: 'Art' },
  { key: 'blooms', label: 'Blooms' },
  { key: 'listening_minutes', label: 'Min' },
]

const fdate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : '—'

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [tracks, setTracks] = useState<TopTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('listening_minutes')

  useEffect(() => {
    if (!isAdmin) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      const [ov, mem, top] = await Promise.all([
        supabase.rpc('green_admin_overview'),
        supabase.rpc('green_admin_members'),
        supabase.rpc('green_admin_top_tracks', { days: 7 }),
      ])
      if (cancelled) return
      if (ov.error || mem.error || top.error) {
        setError(ov.error?.message || mem.error?.message || top.error?.message || 'Failed to load')
      } else {
        setOverview(ov.data as Overview)
        setMembers((mem.data ?? []) as Member[])
        setTracks((top.data ?? []) as TopTrack[])
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0)),
    [members, sortKey],
  )

  if (!isAdmin) return null

  return (
    <div className="admin">
      <div className="wrap">
        <h1>God Mode</h1>
        <p className="admin-sub">Platform analytics — counts only, no member content.</p>

        {loading ? (
          <p className="admin-msg">Loading platform data…</p>
        ) : error ? (
          <p className="admin-msg admin-err">
            {error}
            <br />
            <span>Run supabase/migrations/green_admin_rpcs.sql if you haven’t yet.</span>
          </p>
        ) : (
          <>
            <div className="admin-kpis">
              {overview &&
                KPIS.map((k) => (
                  <div key={k.key} className="admin-kpi">
                    <span className="admin-kpi-val">{overview[k.key] ?? 0}</span>
                    <span className="admin-kpi-label">{k.label}</span>
                  </div>
                ))}
            </div>

            <h2 className="admin-h2">Top tracks · last 7 days</h2>
            {tracks.length === 0 ? (
              <p className="admin-msg">No listening yet this week.</p>
            ) : (
              <ol className="admin-tracks">
                {tracks.map((t) => (
                  <li key={t.track_id} className="admin-track">
                    <span className="at-name">{t.title ?? t.track_id}</span>
                    <span className="at-cat">{t.category ?? '—'}</span>
                    <span className="at-stat">{t.minutes} min · {t.plays} plays</span>
                  </li>
                ))}
              </ol>
            )}

            <h2 className="admin-h2">Members · {members.length}</h2>
            <div className="admin-sort">
              Sort by:
              {COLS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className={`admin-sort-btn${sortKey === c.key ? ' is-active' : ''}`}
                  onClick={() => setSortKey(c.key)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Status</th>
                    <th>Joined</th>
                    {COLS.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                    <th>Last active</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((m) => (
                    <tr key={m.user_id}>
                      <td className="am-name">{m.display_name || m.email}</td>
                      <td>{m.status ?? '—'}</td>
                      <td>{fdate(m.joined)}</td>
                      <td>{m.oracle_pulls}</td>
                      <td>{m.angel_readings}</td>
                      <td>{m.journals}</td>
                      <td>{m.art_pieces}</td>
                      <td>{m.blooms}</td>
                      <td>{m.listening_minutes}</td>
                      <td>{fdate(m.last_active)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
