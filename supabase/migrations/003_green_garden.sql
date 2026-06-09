-- ============================================================
-- green.cymatones.com — Migration 003
-- Garden schema: green_garden_beds, green_garden_elements
-- Runs on the SHARED CymaTones Supabase project (green_ prefix).
-- No signup trigger — beds are provisioned on first garden load.
-- Derived from the bible §3.7 (garden_beds) and §3.8 (garden_elements).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- green_garden_beds ---------------------------------------------
CREATE TABLE IF NOT EXISTS green_garden_beds (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bed_type    TEXT NOT NULL CHECK (bed_type IN ('herb_garden', 'wild_meadow', 'forest_floor')),
    name        TEXT,
    layout_data JSONB DEFAULT '{}',
    is_unlocked BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, bed_type)
);
CREATE INDEX IF NOT EXISTS idx_green_garden_beds_user ON green_garden_beds(user_id);
ALTER TABLE green_garden_beds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "green: manage own garden beds" ON green_garden_beds;
CREATE POLICY "green: manage own garden beds"
    ON green_garden_beds FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- green_garden_elements -----------------------------------------
CREATE TABLE IF NOT EXISTS green_garden_elements (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bed_id             UUID NOT NULL REFERENCES green_garden_beds(id) ON DELETE CASCADE,
    element_type       TEXT NOT NULL CHECK (element_type IN
                       ('seed', 'sprout', 'plant', 'tree', 'flower', 'mushroom',
                        'journal_book', 'tuning_fork', 'decoration')),
    seed_source        TEXT NOT NULL CHECK (seed_source IN
                       ('oracle_draw', 'journal_entry', 'tuning_seed', 'manual')),
    -- card_id references a green oracle card (table arrives in a later chunk);
    -- left as a plain UUID for now so this migration has no forward dependency.
    card_id            UUID,
    position_x         DECIMAL(5,2) NOT NULL DEFAULT 0,
    position_y         DECIMAL(5,2) NOT NULL DEFAULT 0,
    scale              DECIMAL(3,2) DEFAULT 1.00,
    rotation           INTEGER DEFAULT 0,
    growth_stage       INTEGER DEFAULT 0 CHECK (growth_stage BETWEEN 0 AND 5),
    growth_started_at  TIMESTAMPTZ DEFAULT NOW(),
    growth_completed_at TIMESTAMPTZ,
    is_movable         BOOLEAN DEFAULT TRUE,
    metadata           JSONB DEFAULT '{}',
    created_at         TIMESTAMPTZ DEFAULT NOW(),
    updated_at         TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_green_garden_elements_user ON green_garden_elements(user_id);
CREATE INDEX IF NOT EXISTS idx_green_garden_elements_bed ON green_garden_elements(bed_id);
ALTER TABLE green_garden_elements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "green: manage own garden elements" ON green_garden_elements;
CREATE POLICY "green: manage own garden elements"
    ON green_garden_elements FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
