/**
 * PlantDoctor runtime config.
 *
 * BACKEND_URL — the deployed Spring Boot backend (POST /api/diagnose).
 * Set EXPO_PUBLIC_BACKEND_URL at build/deploy time. When it is empty the
 * app runs in its built-in demo mode: a curated plant-care library and
 * honest demo diagnoses. No Gemini key ever lives here.
 */
export const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL ?? '').trim();

export const backendConfigured = BACKEND_URL.length > 0;

/**
 * Set to true once the Firebase project for PlantDoctor exists and the
 * values in lib/firebase.ts / lib/firebase.native.ts are the real web
 * config. TODO: the project is created at publish time; until then the
 * app runs in full local/guest mode with the accounts UI ready.
 */
export const firebaseConfigured = false;
