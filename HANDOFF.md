# green.cymatones.com — Handoff

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
