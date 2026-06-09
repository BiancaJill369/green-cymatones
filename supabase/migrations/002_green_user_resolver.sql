-- ============================================================
-- green.cymatones.com — Migration 002
-- User resolver for payment-first account creation.
-- Called by green-stripe-webhook via:
--   admin.rpc('green_get_user_id_by_email', { p_email: email })
-- Returns the auth.users id for an email, or NULL if none exists
-- (the webhook then creates the auth user).
-- SECURITY DEFINER so it can read the auth schema; only the
-- service_role (used by the webhook) may execute it.
-- ============================================================

CREATE OR REPLACE FUNCTION public.green_get_user_id_by_email(p_email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;
$$;

-- Lock down execution: not callable by anon/authenticated clients.
REVOKE ALL ON FUNCTION public.green_get_user_id_by_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.green_get_user_id_by_email(TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.green_get_user_id_by_email(TEXT) TO service_role;
