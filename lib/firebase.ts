import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase wiring for PlantDoctor — web.
 *
 * Firebase project "PlantDoctor" (plantdoctor-f4f18) under
 * aryanch99999@gmail.com, with Email/Password + Google sign-in
 * (email-link OFF). The app's Vercel domain is added to authorized
 * domains, and `firebaseConfigured` is true in lib/config.ts.
 *
 * The config values below are Firebase's public app identifiers by
 * design (never admin keys or secrets); access is controlled by
 * Firebase Authentication plus the Firestore security rules (each user
 * can only read and write their own /users/<uid> tree). No admin keys
 * or secrets live here; the Gemini key stays server-side in the Spring
 * Boot backend.
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
  apiKey: 'AIzaSyBOwdG4v-3Q5IdIVjrz4XNSuqEume3Lw6U',
  authDomain: 'plantdoctor-f4f18.firebaseapp.com',
  projectId: 'plantdoctor-f4f18',
  storageBucket: 'plantdoctor-f4f18.firebasestorage.app',
  messagingSenderId: '1032819667904',
  appId: '1:1032819667904:web:851d1d86cc3b127e94ce25',
};

/** OAuth web client ID for the native Google Sign-In flow (not a secret). */
export const GOOGLE_WEB_CLIENT_ID = '1032819667904-3dc9ednaohf2bqtnlb8i2pfqd7fbhu51.apps.googleusercontent.com';

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
