# PlantDoctor 🌱

Describe or photograph a plant problem and get a diagnosis — the likely cause,
how serious it is, and a numbered care plan — for home gardeners and small
farmers.

> General care guidance only — not a professional diagnosis. For valuable or
> severely ill plants, ask a local nursery or extension service.

## Live

- **Web app:** https://plantdoctor.vercel.app (coming online with the first deploy)
- **GitHub:** https://github.com/Aryanch1/PlantDoctor
- **Design (Figma):** https://www.figma.com/design/0gj8Wh4nrBiPxIzA3Mr8h8

## Features

- **Diagnose** — describe symptoms in words and/or attach a photo (camera or
  library); get a likely cause, a severity rating (Mild / Moderate / Serious)
  and numbered care steps, plus watering and light guidance.
- **My Plants** — saved plants as arch-top photo tiles with per-plant care
  guides (light, water, feeding) and their own diagnosis history.
- **Care schedule** — watering/feeding tasks with due dates and a done toggle,
  plus an add-task form.
- **Care library** — light, water and feeding needs for common plants
  (monstera, fiddle-leaf fig, tomato, basil, rose, snake plant).
- **History** — past diagnoses saved on-device (and in your account when
  signed in), one tap to re-open.
- **Accounts** — sign in with Google or email/password, or continue as a guest
  (guest lasts one visit only). Signed-in users stay signed in; profile
  picture, display name and password reset live in Settings.

## Tech stack

- **App:** React Native + Expo SDK 58 + TypeScript, expo-router, Reanimated
  (spring physics), expo-blur (frosted glass), expo-haptics, expo-image-picker
- **Design:** designed in Figma; Bricolage Grotesque display type; terracotta
  clay + sage on warm cream; arch plant tiles; flat labeled tab bar; a growing
  sprout as the custom pull-to-refresh motif; responsive from phones (5–7")
  through foldables and tablets to desktop
- **AI:** Google Gemini (`gemini-3.5-flash-lite`) via the Spring Boot backend
  — the key is held server-side only. Without a configured backend the app
  runs in an honest built-in demo mode (curated care library) and says so.
- **Backend:** Java 17 + Spring Boot 3.3.5 (`backend/`, Maven wrapper) —
  `POST /api/diagnose`, `GET /api/plants`, `GET /api/health`
- **Accounts & sync:** Firebase Authentication (Email/Password + Google) and
  Cloud Firestore, per-user data under `users/{uid}` with owner-only rules

## Run it

```sh
npm install
npm run web        # web
npm run android    # Android (Expo Go)
npm run ios        # iOS (Expo Go)
```

Backend (from `backend/`):

```sh
./mvnw spring-boot:run   # serves on http://localhost:8080
./mvnw test              # unit + controller + context tests
```

Set `GEMINI_API_KEY` in the environment for live diagnoses; without it the
backend answers with honest demo data (`source: "demo"`). Set
`EXPO_PUBLIC_BACKEND_URL` to point the app at a deployed backend; when empty
the app uses its built-in demo care library.

## License

MIT — Copyright (c) 2026 Aryanmouli Cherupalli. See [LICENSE](LICENSE).
