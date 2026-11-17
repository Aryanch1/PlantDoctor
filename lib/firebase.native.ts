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
 * Firebase project "PlantDoctor" (plantdoctor-f4f18) under
 * aryanch99999@gmail.com, with Email/Password + Google sign-in
 * (email-link OFF). The app's Vercel domain is added to authorized
 * domains, and `firebaseConfigured` is true in lib/config.ts.
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
