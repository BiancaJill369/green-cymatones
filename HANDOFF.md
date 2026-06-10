# green.cymatones.com — Handoff

## 2026-06-09 — CHUNK 13a: Art Easel (shell + gallery + 2 games) ✅ DONE (code)

- **DB (already live):** `green_art_creations` with RLS. Code only.
- `stores/artStore.ts` — `loadCreations`, `saveCreation({userId,gameType,title,thumbnail,state})` (insert + prepend), `deleteCreation`.
- `pages/EaselPage.tsx` + `styles/easel.css` — hub with **6 game tiles (2 live, 4 "Coming soon")** + a **Games / My Gallery** tab toggle.
- Games (forwardRef + `GameHandle` = `renderToCanvas` + `getState`):
  - `GardenColoring` — SVG line-art garden (sky/sun/ground/pot/3 flowers/leaves), 16-color palette, **tap a region to fill**.
  - `PixelMosaic` — 16×16 grid, palette + eraser, **tap/drag to paint** (`touch-action:none`, pointer capture).
- `SaveBar` — calls the game's `renderToCanvas`, scales to 320px wide, `toDataURL('image/jpeg',0.6)` for the thumbnail, grabs `getState`, then `saveCreation` + toast.
- `Gallery` — thumbnail grid (label + date), tap → large view, **Delete**.
- `App.tsx`: `/easel` behind `AuthGuard`. HUD: "🎨 Art Easel" link.
- **Verified in browser** (temp route + seeded creations, removed before commit): hub shows 2 playable + 4 coming-soon; coloring fills regions (sky/sun/ground/flowers); mosaic paints a grid by drag; gallery lists pieces, opens the large view, has Delete. Build clean; touch painting uses pointer events + `touch-action:none`; reduced-motion preserved.
- **Live confirm (you):** "Save to gallery" writes a `green_art_creations` row with a thumbnail; the gallery lists it; delete removes it. (Supabase writes hang locally; the thumbnail/canvas + store logic are spec-exact.)
- The other 4 games (Mandala Bloom, Zen Garden, Petal Drop, Watercolor Meadow) are the "Coming soon" tiles → 13b/13c.

---

## 2026-06-09 — CHUNK 14: Character Creator ("the Mirror") ✅ DONE (code)

- **DB (already live):** `green_profiles.character_type` + `character_name` (migration 001). Code only.
- `components/character/CharacterCreator.tsx` + `styles/character.css` — "Who tends this garden?" with the 6 characters (moss_sprite/fern_walker/vine_weaver/pond_guardian/bark_sage/dew_drop), each a tile with emoji + name (in its character color) + blurb + accent border on select; a name field prefilled with `display_name`; "Enter the garden" disabled until a type is chosen + name non-empty.
- `userStore.updateCharacter(userId, type, name)` (+ exposed via `useAuth`) — updates `green_profiles` and refreshes `greenProfile` locally.
- `GardenView` — renders the creator **forced** (no Cancel) when `greenProfile.character_type` is null, or **dismissable** when reopened. HUD identity chip now shows **"{emoji} {character_name} the {Label}"** and is clickable → **Change character** reopens the creator (prefilled + preselected).
- **Verified in browser** (temp route + seeded profile, removed before commit): no-character → forced creator (6 tiles, prefilled name "Bianca", submit gated on type, select → accent glow); character set → HUD shows "🌿 Willow the Moss Sprite", clicking it reopens the creator with Cancel + "Willow" + Moss Sprite preselected. Build clean; reduced-motion preserved.
- **Live confirm (you):** a member with no character sees the creator on entry; picking + naming saves `character_type` + `character_name` to `green_profiles`; HUD reflects it; "Change character" reopens. (Supabase write hangs locally; logic is spec-exact.)

---

## 2026-06-09 — CHUNK 12: Shadowmoss + I AM Statements ✅ DONE (code)

- **DB (already live, Bianca):** `green_iam_statements` (56) + `green_shadowmoss_encounters` with RLS (migration 010).
- `stores/shadowmossStore.ts` — `loadStatements`, `pickStatement` (avoids the last 3), `recordEncounter` (inserts `green_shadowmoss_encounters`, keeps `currentEncounterId`), `toggleFavorite` (updates `is_favorite`; favorite → `skyStore.saveStar({sourceType:'iam_statement', sourceRef:statement_number, label:first 3 words, detail:text, color:'#cfe87a'})`; unfavorite → `removeBySource`).
- `stores/skyStore.ts` — added `removeBySource(userId, sourceType, sourceRef)`. **This completes the I-AM path of Sky of Stars (Ch.9).**
- `components/garden/Shadowmoss.tsx` (wired into `GardenView`) — a black cat that **wanders** the garden (CSS `left` transition + bob, flips facing by direction), **pauses to speak** an I AM in a bubble with a heart, and tapping the heart favorites it (💛 + "✨ saved to your sky"). Tapping the cat also makes him speak. `prefers-reduced-motion` → no wandering. Gentle/occasional cadence.
- **Verified in browser** (temp route + seeded statements + user, removed before commit): cat renders with tail-sway/blink, tap → bubble with the I AM text + 🤍 heart; heart click → 💛 + "saved to your sky" + store `isFavorite:true` (fires `saveStar` with `source_type:'iam_statement'`). Build clean.
- **Live confirm (you):** the cat speaks → a `green_shadowmoss_encounters` row is logged; heart → a `green_sky_stars` row (`source_type 'iam_statement'`) appears in the sky; unfavorite removes it. (Supabase writes hang locally; store logic is spec-exact.)

**Cat art (FINAL):** swapped the placeholder for the **approved `shadowmoss_cat_mock.html` sprite** — fat fluffy black cat, gold-green eyes, ears/whiskers/curled tail, with bob/breathe + tail-sway + blink animations. One fix vs. the mock: facing-flip lives on `.sm-flip` and bob/breathe on `.sm-cat` (the mock had both on one element, so the flip got clobbered). Verified in browser. All wander/speak/heart behavior unchanged.

---

## 2026-06-09 — CHUNK 11: Frequency Mushroom (tones player) ✅ DONE (code)

- **DB (already live, Bianca):** `green_listening_daily` (migration 009). `frequency_tracks` read directly (public SELECT). **Green is READ-ONLY on `frequency_tracks`** — does not write `play_count`.
- `stores/frequencyStore.ts` — Howler-based single-instance player; `loadTracks` (grouped by `category`), `loadListening`, `playTrack`/`togglePlay`/`stopPlayback`. **Accrues only real playing seconds**, flushes to `green_listening_daily` every ~10s + on pause/track-change/route-leave; crossing **180s/day** upserts `tuning_seed_earned` and plants a `mushroom` in the **Forest Floor** (once/day) + toast "🍄 A tuning mushroom sprouted in your Forest Floor".
- `pages/TonesPage.tsx` + `TrackList` + `TonePlayer` + `styles/tones.css` — category sections; rows show name + `metadata.tagline` + duration (mm:ss) + "{hz} Hz" chip **only when hz is set** + optional chakra chip; mini-player with play/pause, progress, tagline, notes; reward line "Listen 3 minutes today…" with `todaySeconds/180`, hidden once earned.
- `GardenElement` renders `mushroom`: stage 0 tiny nub → full glowing 🍄 (scales with stage), on the Forest Floor. `App.tsx`: `/tones` behind `AuthGuard`. HUD: "🍄 Frequency Tones" link. Added `@types/howler` (dev).
- **Verified in browser** (temp routes + seeded tracks, removed before commit): categories + rows (Hz chip only when present, chakra chips, durations), reward progress (95/180 → 52.8% bar), tapping a track opens the mini-player (name/tagline/progress/notes, "0:00 / 7:00") and highlights the row; mushrooms render in the Forest Floor growing 10→22→48px across stages. Build clean (one benign Vite "chunk >500 kB" warning from Howler's weight).

**Audio source (FINAL):** audio is NOT Supabase Storage — it streams from a Shopify/Cloudflare-Workers base. The resolver now reads **`VITE_TRACKS_AUDIO_BASE`** (`audio_url` is a relative path like `ct_originals/sympathetic.mp3` off that base; absolute URLs pass through). Howl uses `html5: true` for streaming mp3.

**⚠️ ACTION REQUIRED — set one env var (you):** add **`VITE_TRACKS_AUDIO_BASE`** to your local `.env` and to Vercel, set to the **same base the CymaTones app uses to serve audio** (e.g. `https://xxxx.workers.dev/`). It's in `.env.example` (empty). Until it's set, playback won't resolve a real URL; everything else works. No code change needed.

---

## 2026-06-09 — CHUNK 10: Greenhouse Journal ✅ DONE (code)

- **DB (already live, Bianca):** `green_daily_prompts` (seeded) + `green_journal_entries` with RLS. No migrations.
- `stores/journalStore.ts` — `loadPrompts` (active prompts by `sort_order`; `todaysPrompt = prompts[dayOfYear() % len]`, stable all day), `loadEntries`, `saveEntry({userId, promptId, mood, content})` → inserts the entry and, if it's the **first entry of the day**, plants a `journal_book` seed in the **Wild Meadow**; returns `{ isFirst }`.
- `pages/JournalPage.tsx` + `styles/journal.css` — gold-serif prompt, `MoodPicker` (calm·joyful·grateful·tender·restless·heavy·hopeful·inspired, single-select), autosizing textarea, Save (toast "🌱📖 A journal seed was planted in your Wild Meadow" on first-of-day), and a recent-entries list (date + mood chip + first ~120 chars, newest first).
- `GardenElement` renders `journal_book`: stage 0 seed → a 📖 book on a stem growing in scale with stage. `App.tsx`: `/journal` behind `AuthGuard`. `GardenView` HUD: "📖 Journal" link.
- **Verified in browser** (temp routes + seeded data, removed before commit): prompt + 8 mood chips (select toggles) + textarea + Save (disabled until text); past entries list with mood chips + truncation; the journal book renders in the Wild Meadow growing 21px→44px across stages. Build clean; reduced-motion preserved.
- **Live confirm (you):** writing + Save inserts a `green_journal_entries` row; the day's first entry drops a `journal_book` seed in the Wild Meadow (visible in the garden); history lists past entries. (Supabase writes hang in the local sandbox; store logic is spec-exact.)

---

## 2026-06-08 — CHUNK 9: Sky of Stars ✅ DONE (code)

- **DB (already live, Bianca):** `green_sky_stars` with RLS. No migrations this chunk.
- `stores/skyStore.ts` — `loadStars(userId)`, `saveStar({...})` (deterministic upper-sky placement via a hash of `source_ref`; **upsert on `user_id,source_type,source_ref` → no duplicates**; marks the matching `green_angel_draws.saved_to_sky=true`), `removeStar(id)`. Only the `angel_number` path is wired (I AM source comes with Shadowmoss in Ch.12).
- `components/garden/SkyStars.tsx` — tappable stars in the garden's sky band at `position_x/y`, colored by `color`, opacity = `brightness`, gentle twinkle; **faint by day, luminous at night** (`.stage.night`). `StarDetailSheet.tsx` — label + detail (affirmation) + "Remove from sky".
- `AngelReading.tsx` — "✦ Save to Sky" button under the affirmation; shows "Saved to your sky ✓" if a star already exists for that number.
- Wired `SkyStars` + `StarDetailSheet` into `GardenView` (loads stars alongside the garden).
- **Verified in browser** (temp routes + seeded stars, removed before commit): two saved stars render in the night sky (gold + green) at their positions and glow at night; tapping a star opens the sheet (777 + affirmation + Remove/Close); the reading shows "✦ Save to Sky" for an unsaved number and "Saved to your sky ✓" for one already saved (dedup). Build clean; reduced-motion preserved.
- **Live confirm (you):** reveal an angel number → "Save to Sky" creates a `green_sky_stars` row; the star shows in the garden sky (brighter at night); tap → Remove works; re-saving the same number doesn't duplicate. (Supabase writes hang in the local sandbox; store logic is spec-exact.)

---

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
