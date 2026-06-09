# green.cymatones.com — Handoff

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
