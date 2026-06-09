# green.cymatones.com — Handoff

## 2026-06-08 — CHUNK 8b.1: Celestial Filigree Angel Keypad ✅ DONE (code)

- Replaced `components/oracle/AngelKeypad.tsx` with the approved **celestial relic** (mock-matched): deep-green filigree relic, gold/silver double frame, SVG filigree corners, 90-star starfield, nebula breathe, frame glow, display sheen — all self-contained `.akp` styles + `akp*` keyframes in the component (no CSS file touched).
- Keypad is now **self-contained** (owns its digit input, max 3, validates 1–999) and calls **`onReveal(n)`** with the validated number (leading zeros stripped). Uses functional `setState` so fast taps never drop a digit.
- `pages/AngelPage.tsx` adapted minimally: its reveal handler now receives `n` (`getReading(n)` + `recordDraw(userId, n)` → render `<AngelReading/>`). Reading view + "Read another" unchanged. (This small adaptation was required by the new `onReveal(n)` signature; `angelStore`, routes, and `angel.css` are untouched — `angel.css` keeps the reading-view styles; its old flat-keypad classes are now unused/harmless.)
- **Verified in browser** (temp route, removed before commit): relic + 90 stars + 4 filigree corners render; digit entry (max 3, 4th ignored); Reveal disabled until 1–999; clicking Reveal fires `onReveal(123)` (hint "✦ Revealing the message of 123 ✦"). `prefers-reduced-motion` stills the animations (`.akp * { animation: none }`). Build clean.

---

## 2026-06-08 — CHUNK 8b: Angel Numbers Keypad + Reading ✅ DONE (code)

- `components/oracle/AngelKeypad.tsx` — celestial (moon/gold) numeric pad: big display, 0–9, ⌫, Clear, Reveal; max 3 digits; Reveal disabled unless 1–999.
- `components/oracle/AngelReading.tsx` — gold serif title + archetype, Meaning/Message/Action sections, "✦ Resonates at {Hz}" chip, pinned "I AM …" affirmation. **No Save-to-Sky (Chunk 9), no tone (Chunk 11).**
- `pages/AngelPage.tsx` + `styles/angel.css` — Reveal: `parseInt` (strips leading zeros, 007→7), rejects 0/blank/>999 with inline "Enter 1–999", then `getReading(n)` + `recordDraw(userId, n)` → renders the reading; "Read another number" resets the pad + clears `currentReading`.
- `App.tsx`: `/angel` behind `AuthGuard`. `GardenView` HUD: "🔢 Angel Numbers" link next to "Draw today's cards".
- Hardened `onDigit`/`onBackspace` to read the latest value from the store (fast taps never drop a digit).
- **Verified in browser** (temp route + seeded reading, removed before commit): keypad enters digits (max 3), ⌫/Clear work, Reveal disabled for empty/`0`, enabled for `777` and `007`; the reading view shows title/archetype/Meaning/Message/Action + Hz chip + affirmation; "Read another" resets everything. Build clean; reduced-motion preserved.
- **Live confirm (you):** entering 1–999 → Reveal shows that row from `green_angel_readings` and logs a `green_angel_draws` row. (Reveal hits Supabase, which hangs in the local sandbox — store calls are spec-exact.)

---

## 2026-06-08 — CHUNK 8a: Angel Oracle Store ✅ DONE (code)

- **DB (already live, Bianca):** `green_angel_readings` (999 rows) + `green_angel_draws` with RLS. No migrations run this chunk.
- **Code:** `stores/angelStore.ts` — `enteredNumber`, `currentReading`, `drawHistory` + `getReading(n)` (reads `green_angel_readings` by number, sets `currentReading`) and `recordDraw(userId, n)` (inserts a `green_angel_draws` row, prepends to `drawHistory`). Build clean. **No UI yet (that's 8b).**
- Bundle size unchanged — nothing imports the store until 8b (expected).

---

## 2026-06-08 — CHUNK 7b: Garden Edit Mode ✅ DONE (code)

- **`gardenStore`** added: `isEditMode`, `selectedId`, `dirty` set, `userId`, + `toggleEditMode`, `selectElement`, `updateElementLocal` (local + marks dirty), `removeElement` (DB delete + toast), `saveLayout` (persist dirty `position_x/y/scale/rotation` + exit), `cancelEdit` (re-fetch from DB + exit).
- **Entry:** "✎ Arrange garden" button in the HUD; **long-press** a plant also enters edit mode and selects it.
- **Edit UX:** tap a plant → glow ring + control panel (Size slider 0.5–2, Rotate slider −180–180, 🗑 Remove); **drag** the plant to move (pointer events, position computed as % of the plant's bed rect, clamped 0–100). Sticky **Save / Cancel** bar. `is_movable === false` fixtures are skipped.
- **Rendering:** `GardenElement` applies `transform: translateX(-50%) scale() rotate()` with `transform-origin: bottom center`; `touch-action: none` for smooth touch drag.
- Outside edit mode, tapping a plant still opens the read-only card/affirmation sheet (7a).
- **Verified in browser** (temp route + seeded plant, removed before commit): entering edit mode shows the action bar + hint; selecting shows the ring + panel + 2 sliders + Remove; scale→1.5 and rotate→60 apply to the transform independently; a simulated drag moved the plant to 72%/50% within its bed (clamped); dirty-tracking flags the element. Build clean; reduced-motion preserved.
- **Live confirm (you):** drag/scale/rotate a plant → **Save** persists (reload keeps the new values); **Cancel** reverts to last saved; remove deletes the row. (DB writes hang in the local sandbox, so Save/Cancel/Remove persistence is verified by code against the spec, not live.)

---

## 2026-06-08 — CHUNK 7a: Seed Growth Over Days + Real Element Rendering ✅ DONE (code)

- **Growth model:** `gardenStore.loadGarden` now runs `applyGrowth` after fetching elements — one stage per real day since `growth_started_at` (capped at 5), persists changed stages, and stamps `growth_completed_at` on first reaching stage 5.
- **Bloom toast:** newly-bloomed plants push a "{card} has fully bloomed" toast (new `stores/toastStore.ts` + `components/common/Toasts.tsx`, auto-dismiss 4s; card name looked up in `oracleStore.cards`).
- **Real elements:** `components/garden/GardenElement.tsx` renders by `element_type` + `growth_stage`:
  - forest (`forest_floor`): stage 0 mound → 5 full canopy tree (trunk appears at stage 2+);
  - herb/meadow: stage 0 seed dot → 1 sprout → … → 4 bud → 5 open flower.
  `GardenView` maps real `green_garden_elements` into their bed by `bed_id` at `position_x`; ambient placeholder greenery stays underneath for atmosphere.
- **Tap sheet:** tapping a plant opens a bottom sheet with its source card name + affirmation.
- **Verified in browser** (temp preview route + seeded elements at stages 0/2/3/4/5, removed before commit): real trees ramp 21→106→179px across stages, low plants ramp by stage (seed→flower), tap sheet shows "Basil — The Protector" + "I AM rooted and protected.", bloom toast renders. Build clean; reduced-motion preserved.
- **Live confirm (you):** draw a card → stage-0 seed appears in its bed; back-date that row's `growth_started_at` in Supabase → its stage advances on reload (0→5); hitting stage 5 fires the bloom toast + stamps `growth_completed_at`. (Local sandbox can't reach Supabase, so the day-by-day advance is verified by the stage-rendering + the spec-exact growth math.)

---

## 2026-06-08 — CHUNK 6b: Oracle Draw Flow + Seed Drop ✅ DONE (code)

- `components/oracle/DeckSelector.tsx` — 3 tiles themed by `deck.theme_color`; drawn decks show their card face-up + "Drawn today" (disabled); all-drawn → "Come back tomorrow for fresh cards."
- `components/oracle/CardDraw.tsx` — 3D flip (rotateY 600ms) to the face: name + number + visual_description, forecast revealed line-by-line, affirmation pinned in Cormorant; "seed planted in your {bed}" + Back to decks / Back to garden.
- `pages/OraclePage.tsx` + `styles/oracle.css` (garden palette, prefers-reduced-motion).
- `oracleStore`: added `drawCard(deckId, userId)` (one draw/deck/day, avoids last-5 repeat, inserts `green_daily_draws` + drops a `growth_stage:0` seed into the matching bed) and `loadTodayDraws`.
- `App.tsx`: `/oracle` behind `AuthGuard`. `GardenView` HUD: "🃏 Draw today's cards" link.
- **Verified in browser** (temp preview routes + seeded sample data, all removed before commit): DeckSelector renders 3 theme-colored tiles; tapping draws → CardDraw flips to the card with line-by-line forecast, gold affirmation, and seed confirmation; drawn decks lock with "Drawn today"; all-drawn shows the come-back message. Build clean.
- **Note:** the live end-to-end draw (real `green_daily_draws` row + seed appearing in the garden) needs your real Supabase + a logged-in subscriber — the local sandbox can't reach Supabase. The logic matches the chunk spec exactly. New seeds show in the garden on next load (growth over days + edit-mode are Chunk 7).

---

## 2026-06-08 — CHUNK 6a: Oracle Schema + Decks + 99 Cards ✅ DONE

- **DB (Bianca, already applied):** ran `004_green_oracle.sql` + `004b_seed_oracle_cards.sql` in the CT Supabase — 3 decks, 99 cards (33/deck), `green_daily_draws`, the garden-element card FK, all with RLS. Confirmed by Bianca.
- **Code:** `stores/oracleStore.ts` added — `decks`, `cards`, `todayDraws` + `loadDecks()` reading `green_oracle_decks` + `green_oracle_cards`. Build clean. **No UI yet (that's 6b).**
- ⚠️ **Repo bookkeeping gap (non-blocking):** the two `.sql` files are **not** saved under `supabase/migrations/` — their text never came through in chat. The tables are live in Supabase so nothing is broken; paste the SQL anytime and I'll backfill `004_green_oracle.sql` + `004b_seed_oracle_cards.sql` so the repo stays the source of truth.

---

## 2026-06-08 — CHUNK 5.1: Tiered Garden Layout (matches approved mock) ✅ DONE (code)

Rebuilt `GardenView` to match the approved `garden_tiered_mock.html` (lifted its CSS/markup), with night driven by `useTimeOfDay()` (a `.night` class on `.stage`) instead of the mock's toggle button. No DB change.
- **Sky** (top 54%): day/night gradients per mock + sun/moon (existing arc logic) + ~70 stars that fade in at night.
- **Horizon** (top 50%, blurred haze band): warm by day, cool blue by night.
- **Forest Floor** (full-width mid band, top 46% / height 30%, overflow visible): ground strip + trees ~1 per 150px width, randomized scale 0.7–1.6 with x-jitter and z-by-scale so big trees read as nearer; tall canopies cross up over the horizon. ~26 fireflies, night only.
- **Foreground** (bottom 28%, flex): Herb Garden (left, sprouts only) + Wild Meadow (right, sprouts + small colored flowers), Cormorant Garamond labels, divider between.
- Z-order sky(1) < horizon(2) < forest(3) < foreground(4) < creatures(6). Day = 2 butterflies + 2 ladybugs; night = fireflies (butterflies/ladybugs hidden). Placeholder greenery generated client-side in `useMemo` so counts adapt to width.
- **Verified** in browser (temp preview route, removed before commit): measured sky=54%, full-width forest, horizon at 50%, tallest trees cross above it, beds 50/50, night active at local 21:00, meadow has flowers / herb doesn't; **beds stay side by side on mobile (375px)**. Reduced-motion preserved. Build clean.

## 2026-06-08 — CHUNK 3.5: Animated Garden Landing ($8/mo) ✅ DONE

- Replaced `LandingPage.tsx` with the provided animated-garden component (your file, verbatim): hero, 8 feature cards, how-it-grows steps, ethos, final CTA; butterflies/ladybugs/sprout meadow; `.lp`-scoped styles; `prefers-reduced-motion` respected.
- `index.html` already had the Cormorant Garamond + Inter font links (added earlier) — they ship with this commit.
- **Verified in browser:** `/` renders the garden landing, **$8 everywhere (zero $15)**, CTAs route to `/subscribe` + `/auth`, fonts loaded, responsive (4→2→1 col grid). Build clean.
- Minor behavior note: the new landing is purely presentational — it no longer auto-redirects an already-logged-in active member to `/garden` (the old placeholder did). Logged-in members just click "I'm a member" → `/auth`, which gate-routes them in. Say the word if you want the auto-redirect added back.

---

## 2026-06-08 — CHUNK 5: Garden Canvas + Schema (Migration 003) ✅ DONE (code)

**What shipped** (living garden canvas — no seeds/edit-mode/spirit yet)
- `stores/gardenStore.ts` — `loadGarden(userId)`: fetches beds, provisions the 3 (`herb_garden`/`wild_meadow`/`forest_floor`) on first load if none, refetches, loads elements.
- `hooks/useTimeOfDay.ts` — `'day'|'night'` from local time, recomputed every 60s (day = 06:00–18:00).
- `components/garden/`: `GardenView`, `SkyBackground` (day blue / night indigo + fading stars), `SunMoon` (sun arcs by day, moon by night, creeps each minute), `GardenBed` (×3 labeled plots + greenery), `Creatures` (day: 5 butterflies + 2 ladybugs; night: 26 fireflies).
- `styles/garden.css` — all keyframes; **`prefers-reduced-motion` disables all motion**.
- `pages/GardenPage.tsx` → renders `<GardenView/>` (still behind `AuthGuard`).
- Build clean. **Verified in browser** (via a temporary unguarded preview route, since the garden is gated behind auth I can't satisfy locally — route was removed before commit): at 20:00 local it correctly showed night sky, moon arcing, 3 labeled beds, 26 fireflies, 60 stars; responsive on mobile (375px). Day branch is the symmetric arm of the same time check.

**Migration 003:** you said you already ran it — so nothing to run. ⚠️ The `003_green_garden.sql` I committed is a **reconstruction from the bible's schema** (I never received the "above" SQL). The store only depends on the table/column names the chunk itself specified (`green_garden_beds`: user_id/bed_type/name; `green_garden_elements`: bed_id/position/etc.), so it works regardless — **but if the migration you actually ran differs from my file, replace my `003_green_garden.sql` with your real one** so the repo stays the source of truth.

**Verify (you):** log in as a real subscriber → `/garden` should show the living garden for your local time, and `green_garden_beds` should have 3 rows for your user.

---

## 2026-06-08 — CHUNK 4: Stripe Checkout → Account Creation ($8/mo) ✅ DONE (code)

**Price is now $8/mo** (was $15/mo in the bible — bible + any other $15 references still need updating later).

**What shipped**
- `supabase/functions/green-stripe-checkout/index.ts` — creates a Stripe Checkout Session (no account yet). *(your provided file, verbatim)*
- `supabase/functions/green-stripe-webhook/index.ts` — on `checkout.session.completed`, resolves-or-creates the auth user, ensures `green_profiles`, upserts `green_subscriptions`; keeps status in sync on update/delete/payment_failed. *(your provided file, verbatim)*
- `supabase/config.toml` — `verify_jwt = false` for both functions *(I created this file — it didn't exist; see note below)*.
- `supabase/migrations/002_green_user_resolver.sql` — `green_get_user_id_by_email(p_email)` *(I wrote this — its name/param are dictated by the webhook's `rpc(...)` call on line 21; `SECURITY DEFINER`, execute granted to `service_role` only)*.
- `pages/SubscribePage.tsx` — wired to call `green-stripe-checkout` (logged-out visitor types email; lapsed member's email is known) and redirect to Stripe. Copy + CTA now $8/mo.
- Build clean. Verified locally: Subscribe page renders, $8/mo CTA, email input, and the button calls the edge function (errors gracefully when the function isn't reachable).

**⚠️ DEPLOY STEPS — Bianca (functions are NOT deployed from CI):**
1. **Run migration 002** in the CymaTones SQL editor (`002_green_user_resolver.sql`).
2. **Stripe:** create the **$8/mo recurring Price**; copy its **price ID**.
3. **Set Supabase function secrets** (CymaTones project) for the green functions:
   - `STRIPE_SECRET_KEY`
   - `GREEN_STRIPE_PRICE_ID` = the $8/mo price ID from step 2
   - `GREEN_STRIPE_WEBHOOK_SECRET` = from step 5
   - `APP_URL` = `https://green.cymatones.com`
   - (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are auto-provided to deployed functions — don't set by hand.)
4. **Deploy both functions** to the CymaTones project: `supabase functions deploy green-stripe-checkout` and `green-stripe-webhook` (both must be `--no-verify-jwt`, which the `config.toml` entries also declare). **Note:** if your CymaTones `config.toml` already exists with a `project_id`, merge the two `[functions.*]` blocks from this repo's `config.toml` into it rather than overwriting.
5. **Stripe webhook:** add an endpoint → the deployed `green-stripe-webhook` URL; subscribe to `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`; copy the **signing secret** into `GREEN_STRIPE_WEBHOOK_SECRET` (step 3).

**End-to-end test once deployed:** Subscribe page → enter email → Stripe Checkout (test card `4242 4242 4242 4242`) → webhook creates the account + `green_subscriptions` row → you're redirected to `/auth?welcome=1` → log in with the 8-digit code → land in `/garden`. That's also the first time the Chunk 3 happy path becomes fully testable.

**Note on chunk order:** this (Chunk 4) is committed before Chunk 3.5 (animated landing), which is still waiting on the `LandingPage.tsx` component. They're independent, so order doesn't matter.

---

## 2026-06-08 — CHUNK 3: 8-Digit Code Login + Subscribe-First Gate ✅ DONE (code)

**What shipped** (login-only passwordless OTP; no free tier; account = subscription)
- `stores/userStore.ts`, `providers/AuthProvider.tsx`, `hooks/useAuth.ts`
- `lib/greenSubscription.ts` (`fetchGreenSubscription`, `hasActiveGreen` = active|trialing)
- `lib/greenProfile.ts` (`ensureGreenProfile` — called ONLY when sub is active)
- `components/auth/`: `EmailEntryForm` (step 1, `shouldCreateUser:false`), `CodeEntryForm` (step 2, 8-digit), `AuthGuard`
- `pages/`: `AuthPage` (email→code→gate-route), `SubscribePage`, `GardenPage`; updated `LandingPage` (CTAs) + `App.tsx` (routes + `<AuthProvider>`)
- Build clean. Verified locally: routes render, AuthGuard bounces no-session→/auth, unknown email→"No Green account"→/subscribe, no account created.

**⚠️ ACTION REQUIRED — Supabase Auth setting (you):**
The whole flow depends on the email OTP being **8 digits**. In the **CymaTones** Supabase dashboard → **Authentication → Providers → Email** (or **Auth → Settings → Email**):
- Set **OTP length = 8** (project-wide).
- Make sure the email **OTP / magic-link template** sends the code token (`{{ .Token }}`), not just a magic link.
- Email signups can stay on; login here is locked to existing users via `shouldCreateUser:false`, so no accounts get created from the login screen.

**Local dev note:** the app now requires real env vars to boot (`createClient` throws on empty URL). Copy `.env.example` → `.env` and fill the green Supabase URL + anon key before running `npm run dev` locally. Vercel already has these in its env.

**Full end-to-end test (needs a real subscriber):** can't be done until Chunk 4 creates accounts at Stripe checkout. Once you have a subscriber row in `green_subscriptions`, the happy path (email → 8-digit code → /garden) becomes testable.

---

## 2026-06-08 — CHUNK 2: Identity Schema (Migration 001)

**Tenancy note:** green runs on the **SHARED CymaTones Supabase** project (NOT its own). All green tables use the `green_` prefix. No `auth.users` trigger — shared auth pool.

**STEP B (repo) ✅ DONE**
- Saved `supabase/migrations/001_green_identity.sql` (green_profiles + green_subscriptions, RLS + policies).
- Committed + pushed to main.

**STEP A (Bianca runs in Supabase) — PENDING**
- Paste `001_green_identity.sql` into the **CymaTones** Supabase SQL editor and run it.
- Then grant admin (uncomment last line) once Bianca + Lakisha have `green_profiles` rows:
  `UPDATE green_profiles SET is_admin = TRUE WHERE email IN ('bruehlig@gmail.com','<lakisha-email>');`
- ✅ when both tables exist with RLS enabled, no policy errors.

---

## 2026-06-08 — CHUNK 1: Scaffold & Deploy Skeleton ✅ DONE

**What shipped**
- React 19 + Vite + TypeScript + Tailwind v4 (CSS-first `@theme` tokens) scaffold.
- Deps installed: @supabase/supabase-js, zustand, react-router-dom, framer-motion, lucide-react, howler, recharts, @tailwindcss/vite.
- Supabase client wired (not used yet) — `src/lib/supabaseClient.ts`.
- Env scaffold — `.env.example` (5 empty keys); `.env` is gitignored. Env vars typed in `src/vite-env.d.ts`.
- SPA router shell — `/` → `LandingPage` (night-sky bg, green-300 wordmark, moon tagline).
- `vercel.json` with SPA rewrites.
- **Build is clean** (`npm run build` → tsc + vite, 0 errors).
- Repo created + pushed: https://github.com/BiancaJill369/green-cymatones (main).

**Verified in browser** (dev server on port 5180): landing page renders the green/moon theme, no console errors.

**Bianca's to-do (your side)**
1. Connect the repo to Vercel.
2. Set the green Supabase + Stripe env vars in Vercel (the 5 `VITE_` keys from `.env.example`).
3. Create a `.env` locally (copy `.env.example`) with the green Supabase/Stripe keys before running features that hit the DB.

**Local dev**
- `npm run dev` (this project runs on port 5180; 5173 is used by cymatica-proto).
- `npm run build` to check a clean production build.

**Next:** CHUNK 2 (paste when ready).
