import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from '@firebase/app';
import * as firebaseAuth from '@firebase/auth';
import { getFirestore } from '@firebase/firestore';

/**
 * Firebase wiring for PlantDoctor — native (Android/iOS). Metro picks this
 * file over firebase.ts on native.
 *
 * Native imports the scoped @firebase/* packages on purpose: they ship
 * a real React Native build (the umbrella 'firebase/auth' entry does
 * not — it resolves to the browser build, whose sessions are kept in
 * memory only, so users were signed out every time the app closed).
 *
 * TODO (publish step): create the "PlantDoctor" Firebase project under
 * aryanch99999@gmail.com, enable Email/Password + Google sign-in
 * (email-link OFF), add the app's Vercel domain to authorized domains,
 * then paste the real web config below and flip `firebaseConfigured`
 * to true in lib/config.ts. Until then the app runs in local/guest mode.
 * The config values below are placeholders, not a real project.
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

function createAuth(): firebaseAuth.Auth {
  // Persist the session in AsyncStorage so the user stays signed in
  // between app launches, like every other app.
  const getPersistence = (
    firebaseAuth as unknown as {
      getReactNativePersistence?: (storage: unknown) => firebaseAuth.Persistence;
    }
  ).getReactNativePersistence;
  if (getPersistence) {
    try {
      return firebaseAuth.initializeAuth(firebaseApp, {
        persistence: getPersistence(AsyncStorage),
      });
    } catch {
      // Already initialized (fast refresh) — fall through to getAuth.
    }
  }
  return firebaseAuth.getAuth(firebaseApp);
}

export const auth = createAuth();
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
} from '@firebase/auth';

export {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from '@firebase/firestore';
