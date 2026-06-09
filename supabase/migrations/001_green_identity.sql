-- ============================================================
-- green.cymatones.com — Migration 001
-- Identity schema: green_profiles, green_subscriptions
-- Runs on the SHARED CymaTones Supabase project.
-- All green tables use the green_ prefix.
-- No auth.users trigger (shared auth pool).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- green_profiles ------------------------------------------------
CREATE TABLE IF NOT EXISTS green_profiles (
    id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email          TEXT NOT NULL,
    display_name   TEXT,
    avatar_url     TEXT,
    character_type TEXT CHECK (character_type IN
                   ('moss_sprite','fern_walker','vine_weaver','pond_guardian','bark_sage','dew_drop')),
    character_name TEXT DEFAULT 'Shadowmoss',
    is_admin       BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE green_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "green: read own profile" ON green_profiles;
CREATE POLICY "green: read own profile"
    ON green_profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "green: insert own profile" ON green_profiles;
CREATE POLICY "green: insert own profile"
    ON green_profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "green: update own profile" ON green_profiles;
CREATE POLICY "green: update own profile"
    ON green_profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "green: admins read all profiles" ON green_profiles;
CREATE POLICY "green: admins read all profiles"
    ON green_profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM green_profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- green_subscriptions (own Stripe) ------------------------------
CREATE TABLE IF NOT EXISTS green_subscriptions (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id     TEXT,
    stripe_subscription_id TEXT,
    status                 TEXT NOT NULL CHECK (status IN
                           ('active','canceled','past_due','unpaid','trialing')),
    current_period_start   TIMESTAMPTZ,
    current_period_end     TIMESTAMPTZ,
    cancel_at_period_end   BOOLEAN DEFAULT FALSE,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);
CREATE INDEX IF NOT EXISTS idx_green_subs_user ON green_subscriptions(user_id);
ALTER TABLE green_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "green: read own subscription" ON green_subscriptions;
CREATE POLICY "green: read own subscription"
    ON green_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "green: admins read all subscriptions" ON green_subscriptions;
CREATE POLICY "green: admins read all subscriptions"
    ON green_subscriptions FOR SELECT
    USING (EXISTS (SELECT 1 FROM green_profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- Admin grant (run AFTER Bianca + Lakisha have green_profiles):
-- UPDATE green_profiles SET is_admin = TRUE WHERE email IN ('bruehlig@gmail.com','<lakisha-email>');
