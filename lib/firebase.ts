import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase wiring for PlantDoctor — web.
 *
 * TODO (publish step): create the "PlantDoctor" Firebase project under
 * aryanch99999@gmail.com, enable Email/Password + Google sign-in
 * (email-link OFF), add the app's Vercel domain to authorized domains,
 * then paste the real web config below and flip `firebaseConfigured`
 * to true in lib/config.ts. Until then the app runs in local/guest mode.
 *
 * The config values below are placeholders — they are NOT a real
 * project, so Firebase calls fail gracefully and the store falls back
 * to on-device data. The values themselves are Firebase's public app
 * identifiers by design (never admin keys or secrets); access is
 * controlled by Firebase Authentication plus the Firestore security
 * rules (each user can only read and write their own /users/<uid> tree).
 * No admin keys or secrets live here; the Gemini key stays server-side
 * in the Spring Boot backend.
 *
 * Platform note: this file serves web (and tooling). Native builds use
 * firebase.native.ts instead, which imports the scoped @firebase/*
 * packages — the umbrella 'firebase/auth' entry has no React Native
 * build, so on Android/iOS it silently resolves to the browser build
 * whose sessions live in memory only and are lost when the app closes.
 * Every module imports its Auth/Firestore helpers from './firebase' so
 * each platform always gets one consistent set of Firebase modules.
 */
const firebaseConfig = {
  apiKey: 'TODO_PLANTDOCTOR_FIREBASE_API_KEY',
  authDomain: 'TODO_PLANTDOCTOR_FIREBASE_PROJECT.firebaseapp.com',
  projectId: 'TODO_PLANTDOCTOR_FIREBASE_PROJECT',
  storageBucket: 'TODO_PLANTDOCTOR_FIREBASE_PROJECT.firebasestorage.app',
  messagingSenderId: 'TODO_PLANTDOCTOR_MESSAGING_SENDER_ID',
  appId: 'TODO_PLANTDOCTOR_FIREBASE_APP_ID',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). TODO: real value at publish time. */
export const GOOGLE_WEB_CLIENT_ID = 'TODO_PLANTDOCTOR_GOOGLE_WEB_CLIENT_ID';

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = firebaseAuth.getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  type User,
} from 'firebase/auth';

export {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
