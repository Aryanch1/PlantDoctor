# PlantDoctor — Design Spec

**App:** PlantDoctor — describe or photograph a plant problem, get a diagnosis
(likely cause, severity) plus numbered care steps, for home gardeners and
small farmers.
**Theme:** terracotta clay `#B4552D` (deep `#8A3E1F`, light `#D97B4F`, soft
`#F6E3D3`, pale `#FBF1E6`) + sage `#6F8F5E` accent on warm cream `#FAF5EC`
with deep soil ink `#2E2118`. NOT deep green, NOT teal, NOT navy/gold.
**Display font:** Bricolage Grotesque 700/800 (bundled via
`@expo-google-fonts/bricolage-grotesque`) for headlines, screen titles and big
numbers; system font for body. (FridgeToMeal used Sora, MediGuide used Sora —
PlantDoctor deliberately uses a different family.)
**Figma:** https://www.figma.com/design/0gj8Wh4nrBiPxIzA3Mr8h8 — "PlantDoctor —
Daily App" (Tokens & Components page + screen frames; populated separately).

## Visual identity (distinct from FridgeToMeal, MediGuide, SplitEase)

- **Home structure:** dashboard grid, not a hero-led feed. Typographic hero —
  huge Bricolage headline "What's wrong with your plant?" — NO full-bleed photo
  hero, NO frosted panel over a photo.
- **Navigation:** flat labeled bottom tab bar — solid cream bar with a top
  hairline border and a terracotta pill indicator on the active tab. NO floating
  glass pill tab bar. Tabs: Garden, Diagnose, Care, Settings.
- **Cards:** arch-top plant tiles (border-top-radius 999px, photo on top);
  diagnosis results as "prescription" cards with numbered care steps.
- **Glass:** frosted glass only where it fits this identity (small overlay
  chips on photos, e.g. the severity chip) — always the two-layer structure
  (outer view background + shadow, inner overflow-hidden view clipping the
  BlurView) so Android never paints a white plate.
- **Refresh motif:** a growing sprout (Reanimated, scrubbed by pull distance;
  header refresh button on web).

## Design tokens (lib/theme.ts)

- Palette: terracotta primary + sage accent + warm-cream neutrals; warning
  amber for the plant-health disclaimer; error red.
- Radii: cards 30px, sheets 38px top, arch tiles 999px top, pills fully round,
  inputs 24px.
- Spacing: 8-point grid (4/8/16/24/32/48).
- Shadows: soft card shadow (soil-tinted), terracotta glow on primary CTA.
- Type scale: Display 42 (56 wide) / Title 24 / Subtitle 17 / Body 15 /
  Caption 12 / Label 11.
- Breakpoints: `<600` phones (single column) · `600–840` large phone /
  foldable folded · `840–1280` tablet / foldable unfolded (two-pane) ·
  `≥1280` desktop centred shell (max 1120).

## Imagery layer (required, from day one)

Bundled photos in `assets/plants/` (generated, warm-cream styled, no text):
`monstera.jpg`, `fiddle-leaf.jpg`, `tomato.jpg`, `basil.jpg`, `rose.jpg`,
`snake-plant.jpg` (healthy plants) and `ailing-leaf.jpg` (yellowing leaf with
brown spots, used on the Diagnose screen and as the fallback diagnosis photo).
`lib/photos.ts` matches a photo to a plant by keyword over the plant name +
symptom text, with `ailing-leaf.jpg` as fallback for diagnoses. No text-only
card lists anywhere: every plant tile and diagnosis card carries a photo.

## Screen inventory & flow

1. **Splash** — warm cream, sprout glyph, "PlantDoctor".
2. **Welcome** (gate on every open for signed-out non-guests) — arch plant
   photo, headline "What's wrong with your plant?", exactly four options:
   Continue with Google · Create account (name + email + password + confirm,
   match check) · Log in (email/password + Forgot password) · Continue
   without an account.
3. **Garden (Home)** — typographic hero (huge Bricolage headline + greeting);
   big "Diagnose a plant" arch card; My Plants as arch-top photo tiles
   (2-column grid on wide); Care-tasks strip (today's watering/feeding, due
   soonest first); Recent diagnoses (one-tap re-open); care-library preview.
   Two-pane on ≥840: plant list left, selected plant detail right.
4. **Diagnose** — describe symptoms in words (multiline input) + optional
   plant type + photo attach (camera / library via expo-image-picker);
   sample-symptom chips; "Diagnose my plant" CTA (animated loading dots);
   error state with retry wording.
5. **Diagnosis result** (`/diagnosis/[id]`) — "prescription" card: likely
   cause, severity pill (Mild / Moderate / Serious), numbered care steps,
   watering + light guidance, photo, source badge (Live AI / Demo), the
   disclaimer banner, Save to garden CTA (figure inside the pill:
   "Save to garden · 5 steps").
6. **Plant detail** (`/plant/[id]`) — arch photo header, care guide (light /
   water / feeding / notes), its diagnoses, its care tasks, remove plant.
7. **Care** — today's watering/feeding tasks, soonest first; big day numerals,
   plant + task, done toggle per task; add-task form (plant + task + due date).
8. **Settings / Profile** — avatar (client-side resized, stored on the user
   doc), display name, email + sign-in method, password-reset email, sign out;
   guest account card routing to Welcome; service status; version read from
   `app.json`.
9. **Help** — how it works (4 steps), what PlantDoctor is not, disclaimer,
   privacy.
10. **Empty/error states** — garden empty, care empty, no diagnosis yet,
    plant not found, diagnosis error with retry wording.

## Transition & animation plan

- App open: splash holds on warm cream until Bricolage loads; Home headline
  rises in (spring).
- Welcome → Home: slide_from_right (expo-router stack default for the app).
- Home → Diagnose result: after a successful diagnosis, the result screen
  slides in; the Save button confirms in place ("Saved to your garden ✓"
  appears under the CTA where the user is looking).
- Cards/lists: staggered rise (`FadeInDown` + spring, 60–70ms stagger).
- Buttons: Reanimated spring press to ~0.95 with overshoot settle; glow
  tightens; light haptic on primary actions (mobile only).
- Chips: pop (scale bounce 1.18 → 1) when selected.
- Loading: bouncing dots inside the CTA; skeleton-free — the button itself
  animates, never freezes.
- Arch tiles: photos sit in arch-top frames; the tile image floats gently
  (slow drift behind the arch).
- Custom pull-to-refresh: a growing sprout, scrubbed by pull distance
  (threshold 90px); on release it loops (sprout sways + leaves unfurl) while
  data returns, then content settles with a spring. On web the same sprout
  animates on the header refresh button.
- History "Use": re-opens the diagnosis on the result screen (new screen =
  visible feedback), with "Opening…" shown on the tapped row while it loads.

## Visual self-check (quality + distinctness)

Scored against the 8 shared rules in `DESIGN_REFERENCE.md` plus
DISTINCTNESS — could this screen be mistaken for FridgeToMeal, MediGuide or
SplitEase? Honest estimates, 2026-11-17 (code review against the `expo
export` build; no live Vercel URL exists yet to screenshot at widths):

| Screen | Quality | Distinctness | Notes |
|---|---|---|---|
| Garden home | ~90% | ~95% | Typographic hero (no photo hero), arch tiles, dashboard grid, flat tab bar — reads as a garden tool, not a recipe/health/money app. Shortfall: hero is type-led, not photo-led, by design. |
| Welcome | ~88% | ~90% | Arch plant photo + headline; four options as pills. Shortfall: no frosted panel over the photo (by design — flat cream card). |
| Diagnose | ~90% | ~92% | Symptom input card + photo attach + ailing-leaf visual; prescription framing. Shortfall: utility screen, no hero. |
| Diagnosis result | ~90% | ~92% | Prescription card, numbered steps, severity pill, disclaimer banner, figure inside the Save pill. |
| Plant detail | ~90% | ~92% | Arch photo header + care guide grid. Shortfall: detail layout is a single column on narrow widths. |
| Care | ~85% | ~90% | Big day numerals with quiet labels; done toggles. Shortfall: no photo hero on this screen (by design — a utility list). |
| Settings | ~85% | ~88% | Terracotta/sage cards, circular avatar, pill buttons. Shortfall: no imagery layer on this screen. |
| Help | ~85% | ~88% | Same card system; shortfall: no hero image. |

Rules met everywhere: one theme color used with discipline; fully-round pills;
30px+ card radii; Bricolage display type; generous whitespace; big bold
numbers with quiet gray labels; spring motion throughout. Known gap vs the
references: the POC pictures are commerce/fashion photography-led;
PlantDoctor's imagery is plant still-life, which fits its topic.

## Responsive

- `<600`: single column, full-width cards, typographic hero, flat labeled tab
  bar.
- `600–840`: wider content cap (640), larger display type.
- `840–1280`: two-pane Garden (list 380px + detail); grids 2 columns; primary
  actions clear of the center crease.
- `≥1280`: centred shell (max 1120), hover states where natural, never a
  stretched phone UI.
- Every size: no horizontal scrolling, tap targets ≥44px, layouts reflow on
  resize/rotation without restart.

## FridgeToMeal lessons applied (never repeat)

1. Auth readiness: `auth.authStateReady()` awaited before marking auth-ready
   (lib/store.tsx).
2. Glass on Android: every frosted surface uses the two-layer structure
   (outer bg+shadow, inner overflow-hidden clips the blur) — see
   components/ui.tsx `GlassCard` and the severity chip in
   components/DiagnosisDetail.tsx.
3. Deep links: `vercel.json` ships `"cleanUrls": true` from day one.
4. One version source: version lives only in `app.json`/`package.json`;
   Settings reads it via `expo-constants`.
5. Visible feedback: every state-changing tap confirms where the user is
   looking (save feedback, "Opening…", scroll-to-input focus, history re-open
   navigates).
