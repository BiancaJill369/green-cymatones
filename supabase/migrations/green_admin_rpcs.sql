-- ============================================================
-- green.cymatones.com — Admin (God Mode) RPCs  [CHUNK 17]
-- Run this on the SHARED CymaTones Supabase project.
--
-- HIGH-LEVEL COUNTS ONLY — never member content (no journal text,
-- no per-user card text). Every function FIRST checks green_is_admin()
-- and runs SECURITY DEFINER so the aggregates bypass per-row RLS while
-- staying locked to admins.
--
-- Assumes (already in the shared schema):
--   green_profiles(id, email, display_name, is_admin, created_at, last_active_at)
--   green_subscriptions(user_id, status)
--   green_daily_draws(user_id, drawn_at)        -- oracle pulls
--   green_angel_draws(user_id, drawn_at)        -- angel readings
--   green_journal_entries(user_id, created_at)  -- journals (COUNT only)
--   green_art_creations(user_id, created_at)    -- art pieces
--   green_seed_grants(user_id)                  -- blooms earned
--   green_sky_stars(user_id)                    -- stars saved
--   green_track_listening(user_id, track_id text, listen_date, seconds, plays)
--   tracks(id, name, category)                  -- shared CymaTones catalogue
--   green_is_admin() -> boolean
-- ============================================================

-- 1) Platform overview KPIs ----------------------------------
CREATE OR REPLACE FUNCTION green_admin_overview()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT green_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  SELECT jsonb_build_object(
    'total_members',        (SELECT count(*) FROM green_profiles),
    'active_subscriptions', (SELECT count(*) FROM green_subscriptions WHERE status = 'active'),
    'new_members_7d',       (SELECT count(*) FROM green_profiles WHERE created_at >= now() - interval '7 days'),
    'active_members_7d', (
      SELECT count(DISTINCT uid) FROM (
        SELECT user_id AS uid FROM green_daily_draws     WHERE drawn_at   >= now() - interval '7 days'
        UNION SELECT user_id   FROM green_angel_draws     WHERE drawn_at   >= now() - interval '7 days'
        UNION SELECT user_id   FROM green_journal_entries WHERE created_at >= now() - interval '7 days'
        UNION SELECT user_id   FROM green_art_creations   WHERE created_at >= now() - interval '7 days'
        UNION SELECT user_id   FROM green_track_listening WHERE listen_date >= (now() - interval '7 days')::date
      ) a
    ),
    'oracle_pulls',      (SELECT count(*) FROM green_daily_draws),
    'angel_readings',    (SELECT count(*) FROM green_angel_draws),
    'journals',          (SELECT count(*) FROM green_journal_entries),
    'art_pieces',        (SELECT count(*) FROM green_art_creations),
    'blooms_earned',     (SELECT count(*) FROM green_seed_grants),
    'stars_saved',       (SELECT count(*) FROM green_sky_stars),
    'listening_minutes', (SELECT COALESCE(floor(sum(seconds) / 60.0), 0) FROM green_track_listening)
  ) INTO result;
  RETURN result;
END $$;

-- 2) Per-member activity counts (NO content) -----------------
CREATE OR REPLACE FUNCTION green_admin_members()
RETURNS TABLE (
  user_id           uuid,
  display_name      text,
  email             text,
  status            text,
  joined            timestamptz,
  oracle_pulls      bigint,
  angel_readings    bigint,
  journals          bigint,
  art_pieces        bigint,
  blooms            bigint,
  listening_minutes bigint,
  last_active       timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT green_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN QUERY
  SELECT
    p.id, p.display_name, p.email, s.status, p.created_at,
    (SELECT count(*) FROM green_daily_draws     d  WHERE d.user_id  = p.id),
    (SELECT count(*) FROM green_angel_draws      a  WHERE a.user_id  = p.id),
    (SELECT count(*) FROM green_journal_entries  j  WHERE j.user_id  = p.id),
    (SELECT count(*) FROM green_art_creations    ar WHERE ar.user_id = p.id),
    (SELECT count(*) FROM green_seed_grants      g  WHERE g.user_id  = p.id),
    (SELECT COALESCE(floor(sum(t.seconds) / 60.0), 0)::bigint FROM green_track_listening t WHERE t.user_id = p.id),
    p.last_active_at
  FROM green_profiles p
  LEFT JOIN green_subscriptions s ON s.user_id = p.id
  ORDER BY p.created_at DESC;
END $$;

-- 3) Top tracks over the last N days -------------------------
CREATE OR REPLACE FUNCTION green_admin_top_tracks(days int DEFAULT 7)
RETURNS TABLE (
  track_id text,
  title    text,
  category text,
  minutes  bigint,
  plays    bigint
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT green_is_admin() THEN RAISE EXCEPTION 'not authorized'; END IF;
  RETURN QUERY
  SELECT
    t.track_id,
    ft.name,
    ft.category,
    floor(sum(t.seconds) / 60.0)::bigint,
    COALESCE(sum(t.plays), 0)::bigint
  FROM green_track_listening t
  LEFT JOIN tracks ft ON ft.id::text = t.track_id
  WHERE t.listen_date >= (now() - (days || ' days')::interval)::date
  GROUP BY t.track_id, ft.name, ft.category
  ORDER BY sum(t.seconds) DESC NULLS LAST
  LIMIT 10;
END $$;

GRANT EXECUTE ON FUNCTION green_admin_overview()           TO authenticated;
GRANT EXECUTE ON FUNCTION green_admin_members()            TO authenticated;
GRANT EXECUTE ON FUNCTION green_admin_top_tracks(int)      TO authenticated;
