import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from './firebase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from './firebase';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { firebaseConfigured } from './config';
import { diagnosePlant } from './diagnose';
import { signInWithGoogle } from './google';
import { seedPlants } from './plants';
import type { CareTask, Diagnosis, HistoryEntry, SavedPlant } from './types';

const PLANTS_KEY = 'plantdoctor:plants:v1';
const HISTORY_KEY = 'plantdoctor:history:v1';
const SEEDED_KEY = 'plantdoctor:seeded:v1';
const HISTORY_LIMIT = 20;

export interface AuthUser {
  uid: string;
  name: string | null;
  email: string | null;
  photo: string | null;
  /** 'google.com' or 'password' — how this account signs in. */
  provider: string | null;
}

export interface AppState {
  /** The symptom text being typed — never persisted; every visit starts fresh. */
  symptomText: string;
  plantType: string;
  current: Diagnosis | null;
  loading: boolean;
  error: string | null;
  /** True when the live backend was configured but did not answer. */
  liveFailed: boolean;
  plants: SavedPlant[];
  history: HistoryEntry[];
  user: AuthUser | null;
  authReady: boolean;
  guest: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  setAvatarData: (dataUrl: string) => Promise<void>;
  sendPasswordReset: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  setSymptomText: (text: string) => void;
  setPlantType: (text: string) => void;
  diagnose: (description?: string, type?: string, hasPhoto?: boolean) => Promise<void>;
  refreshCurrent: () => Promise<void>;
  clearCurrent: () => void;
  addPlant: (plant: Omit<SavedPlant, 'id' | 'addedAt' | 'diagnoses' | 'tasks'>) => void;
  removePlant: (plantId: string) => void;
  saveCurrentToPlant: (plantId: string) => void;
  toggleTask: (plantId: string, taskId: string) => void;
  addTask: (plantId: string, label: string, kind: string, due: string) => void;
  removeTask: (plantId: string, taskId: string) => void;
  applyHistory: (entry: HistoryEntry) => Promise<void>;
  clearHistory: () => void;
  clearPlants: () => void;
  plantById: (id: string) => SavedPlant | undefined;
  diagnosisById: (id: string) => Diagnosis | undefined;
  /** Today's care tasks across the garden, soonest first. */
  todaysTasks: { plant: SavedPlant; task: CareTask }[];
  /** All diagnoses across the garden, newest first. */
  allDiagnoses: Diagnosis[];
}

const AppContext = createContext<AppState | null>(null);

function loadJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function docIdFor(id: string): string {
  return id.replace(/\//g, '-');
}

async function upsertProfile(u: User): Promise<void> {
  if (!firebaseConfigured) return;
  try {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    const base = {
      displayName: u.displayName ?? '',
      email: u.email ?? '',
      photoURL: u.photoURL ?? '',
      lastLoginAt: serverTimestamp(),
    };
    if (!snap.exists()) {
      await setDoc(ref, { ...base, createdAt: serverTimestamp() });
    } else {
      await setDoc(ref, base, { merge: true });
    }
  } catch {
    // Sync is best-effort; the app keeps working offline.
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [symptomText, setSymptomText] = useState('');
  const [plantType, setPlantType] = useState('');
  const [current, setCurrent] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const [plants, setPlants] = useState<SavedPlant[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [guest, setGuest] = useState(false);
  const plantsRef = useRef<SavedPlant[]>([]);
  const historyRef = useRef<HistoryEntry[]>([]);
  const historyLoadedRef = useRef(false);
  const cloudUnsubRef = useRef<(() => void) | null>(null);
  const historyUnsubRef = useRef<(() => void) | null>(null);

  // Local (signed-out) data loads once at startup; first run seeds 3
  // sample plants + 2 past diagnoses so the garden looks alive. The
  // symptom input is NOT restored — every visit starts fresh; past
  // symptoms live in History.
  useEffect(() => {
    AsyncStorage.getItem(PLANTS_KEY).then(async (raw) => {
      const parsed = loadJson<SavedPlant[]>(raw);
      if (parsed && parsed.length > 0) {
        setPlants(parsed);
        return;
      }
      const seeded = await AsyncStorage.getItem(SEEDED_KEY);
      if (!seeded) {
        const seeds = seedPlants();
        setPlants(seeds);
        await AsyncStorage.setItem(SEEDED_KEY, '1').catch(() => undefined);
      }
    });
    AsyncStorage.getItem(HISTORY_KEY)
      .then((raw) => {
        const parsed = loadJson<HistoryEntry[]>(raw);
        if (parsed) setHistory(parsed);
      })
      .catch(() => undefined)
      .finally(() => {
        historyLoadedRef.current = true;
      });
  }, []);

  // Keep a local mirror of the garden and the history.
  useEffect(() => {
    plantsRef.current = plants;
    AsyncStorage.setItem(PLANTS_KEY, JSON.stringify(plants)).catch(() => undefined);
  }, [plants]);

  useEffect(() => {
    historyRef.current = history;
    if (!historyLoadedRef.current) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(() => undefined);
  }, [history]);

  // Auth state: profile write, cloud garden + history subscriptions.
  // Readiness waits for Firebase to finish restoring any persisted
  // session from storage — the gate must not decide "signed out" (and
  // show Welcome) before the saved session has had its chance to load.
  useEffect(() => {
    let alive = true;
    void auth.authStateReady().then(() => {
      if (alive) setAuthReady(true);
    });
    const unsub = onAuthStateChanged(auth, (u) => {
      if (cloudUnsubRef.current) {
        cloudUnsubRef.current();
        cloudUnsubRef.current = null;
      }
      if (historyUnsubRef.current) {
        historyUnsubRef.current();
        historyUnsubRef.current = null;
      }
      if (!u) {
        setUser(null);
        return;
      }
      setUser({
        uid: u.uid,
        name: u.displayName,
        email: u.email,
        photo: u.photoURL,
        provider: u.providerData[0]?.providerId ?? null,
      });
      void upsertProfile(u);
      if (!firebaseConfigured) return;

      const plantsCol = collection(db, 'users', u.uid, 'plants');
      cloudUnsubRef.current = onSnapshot(
        plantsCol,
        (snap) => {
          setPlants(snap.docs.map((d) => d.data() as SavedPlant));
        },
        () => undefined,
      );

      // One-time merge: anything saved locally before sign-in joins the account.
      void (async () => {
        try {
          const cloud = await getDocs(plantsCol);
          const cloudIds = new Set(cloud.docs.map((d) => d.id));
          for (const item of plantsRef.current) {
            const id = docIdFor(item.id);
            if (!cloudIds.has(id)) {
              await setDoc(doc(db, 'users', u.uid, 'plants', id), item);
            }
          }
        } catch {
          // Best-effort merge only.
        }
      })();

      const historyCol = collection(db, 'users', u.uid, 'history');
      historyUnsubRef.current = onSnapshot(
        historyCol,
        (snap) => {
          const cloud = snap.docs.map((d) => d.data() as HistoryEntry);
          setHistory((prev) => {
            const byId = new Map<string, HistoryEntry>();
            for (const e of [...cloud, ...prev]) byId.set(e.id, e);
            return [...byId.values()]
              .sort((a, b) => b.at - a.at)
              .slice(0, HISTORY_LIMIT);
          });
        },
        () => undefined,
      );

      void (async () => {
        try {
          const cloud = await getDocs(historyCol);
          const cloudIds = new Set(cloud.docs.map((d) => d.id));
          for (const entry of historyRef.current) {
            if (!cloudIds.has(entry.id)) {
              await setDoc(doc(db, 'users', u.uid, 'history', entry.id), entry);
            }
          }
        } catch {
          // Best-effort merge only.
        }
      })();

      // Profile doc: a custom avatar / edited name stored there overrides
      // the auth copy.
      void (async () => {
        try {
          const snap = await getDoc(doc(db, 'users', u.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUser((prev) =>
              prev && prev.uid === u.uid
                ? {
                    ...prev,
                    name: (data.displayName as string) || prev.name,
                    photo: (data.photoData as string) || prev.photo,
                  }
                : prev,
            );
          }
        } catch {
          // Keep the auth profile.
        }
      })();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUpWithEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const cleanName = name.trim();
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName });
        setUser({
          uid: cred.user.uid,
          name: cleanName,
          email: cred.user.email,
          photo: null,
          provider: 'password',
        });
        void upsertProfile({ ...cred.user, displayName: cleanName } as User);
      }
    },
    [],
  );

  const updateDisplayName = useCallback(async (name: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const clean = name.trim();
    await updateProfile(currentUser, { displayName: clean });
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { displayName: clean }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, name: clean } : prev));
  }, []);

  const setAvatarData = useCallback(async (dataUrl: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    if (firebaseConfigured) {
      await setDoc(doc(db, 'users', currentUser.uid), { photoData: dataUrl }, { merge: true });
    }
    setUser((prev) => (prev ? { ...prev, photo: dataUrl } : prev));
  }, []);

  const sendPasswordReset = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return;
    await sendPasswordResetEmail(auth, currentUser.email);
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    // Back to the welcome screen — the gate routes there as soon as the
    // user is signed out and not a guest.
    setGuest(false);
  }, []);

  const continueAsGuest = useCallback(() => {
    // Deliberately NOT persisted: guest lasts for this visit only, so the
    // next open asks for sign-in again. A signed-in user, by contrast,
    // stays signed in (Firebase Auth persistence).
    setGuest(true);
  }, []);

  const syncPlant = useCallback(
    (plant: SavedPlant) => {
      if (user && firebaseConfigured) {
        void setDoc(doc(db, 'users', user.uid, 'plants', docIdFor(plant.id)), plant).catch(
          () => undefined,
        );
      }
    },
    [user],
  );

  const runDiagnose = useCallback(
    async (text: string, type: string, hasPhoto: boolean) => {
      setLoading(true);
      setError(null);
      setLiveFailed(false);
      try {
        const { diagnosis, liveFailed: failed } = await diagnosePlant(text, type, hasPhoto);
        setCurrent(diagnosis);
        setLiveFailed(failed);
        const entry: HistoryEntry = {
          id: `${diagnosis.at}`,
          symptomText: text.trim(),
          plantType: diagnosis.plantType,
          likelyCause: diagnosis.likelyCause,
          severity: diagnosis.severity,
          at: diagnosis.at,
        };
        setHistory((prev) =>
          prev.some((e) => e.symptomText === entry.symptomText)
            ? prev
            : [entry, ...prev].slice(0, HISTORY_LIMIT),
        );
        if (user && firebaseConfigured) {
          void setDoc(doc(db, 'users', user.uid, 'history', entry.id), entry).catch(
            () => undefined,
          );
        }
      } catch (e) {
        setCurrent(null);
        setError(
          e instanceof Error && e.message
            ? e.message
            : 'Something went wrong while diagnosing that plant. Try again.',
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const diagnose = useCallback(
    async (description?: string, type?: string, hasPhoto?: boolean) => {
      const text = (description ?? symptomText).trim();
      if (!text) {
        setError('Describe what is wrong with the plant first.');
        return;
      }
      await runDiagnose(text, type ?? plantType, hasPhoto ?? false);
    },
    [symptomText, plantType, runDiagnose],
  );

  const refreshCurrent = useCallback(async () => {
    if (!current) return;
    await runDiagnose(current.symptomText, current.plantType, current.hasPhoto);
  }, [current, runDiagnose]);

  const clearCurrent = useCallback(() => {
    setCurrent(null);
    setError(null);
    setLiveFailed(false);
  }, []);

  const addPlant = useCallback(
    (plant: Omit<SavedPlant, 'id' | 'addedAt' | 'diagnoses' | 'tasks'>) => {
      const item: SavedPlant = {
        ...plant,
        id: `plant-${Date.now()}`,
        addedAt: Date.now(),
        diagnoses: [],
        tasks: [],
      };
      setPlants((prev) => [item, ...prev]);
      syncPlant(item);
    },
    [syncPlant],
  );

  const removePlant = useCallback(
    (plantId: string) => {
      setPlants((prev) => prev.filter((p) => p.id !== plantId));
      if (user && firebaseConfigured) {
        void deleteDoc(doc(db, 'users', user.uid, 'plants', docIdFor(plantId))).catch(
          () => undefined,
        );
      }
    },
    [user],
  );

  const saveCurrentToPlant = useCallback(
    (plantId: string) => {
      if (!current) return;
      const apply = (list: SavedPlant[]) =>
        list.map((p) =>
          p.id === plantId
            ? {
                ...p,
                diagnoses: p.diagnoses.some((d) => d.id === current.id)
                  ? p.diagnoses
                  : [current, ...p.diagnoses],
              }
            : p,
        );
      setPlants(apply);
      const item = apply(plantsRef.current).find((p) => p.id === plantId);
      if (item) syncPlant(item);
    },
    [current, syncPlant],
  );

  const toggleTask = useCallback(
    (plantId: string, taskId: string) => {
      const apply = (list: SavedPlant[]) =>
        list.map((p) =>
          p.id === plantId
            ? {
                ...p,
                tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
              }
            : p,
        );
      setPlants(apply);
      const item = apply(plantsRef.current).find((p) => p.id === plantId);
      if (item) syncPlant(item);
    },
    [syncPlant],
  );

  const addTask = useCallback(
    (plantId: string, label: string, kind: string, due: string) => {
      const newTask: CareTask = {
        id: `task-${Date.now()}`,
        kind,
        label,
        due,
        done: false,
        plantId,
      };
      const apply = (list: SavedPlant[]) =>
        list.map((p) => (p.id === plantId ? { ...p, tasks: [...p.tasks, newTask] } : p));
      setPlants(apply);
      const item = apply(plantsRef.current).find((p) => p.id === plantId);
      if (item) syncPlant(item);
    },
    [syncPlant],
  );

  const removeTask = useCallback(
    (plantId: string, taskId: string) => {
      const apply = (list: SavedPlant[]) =>
        list.map((p) =>
          p.id === plantId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p,
        );
      setPlants(apply);
      const item = apply(plantsRef.current).find((p) => p.id === plantId);
      if (item) syncPlant(item);
    },
    [syncPlant],
  );

  const applyHistory = useCallback(
    async (entry: HistoryEntry) => {
      setSymptomText(entry.symptomText);
      setPlantType(entry.plantType);
      await runDiagnose(entry.symptomText, entry.plantType, false);
    },
    [runDiagnose],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (user && firebaseConfigured) {
      void (async () => {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'history'));
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        } catch {
          // The subscription will reconcile the visible list.
        }
      })();
    }
  }, [user]);

  const clearPlants = useCallback(() => {
    if (user && firebaseConfigured) {
      void (async () => {
        try {
          const snap = await getDocs(collection(db, 'users', user.uid, 'plants'));
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
        } catch {
          // The subscription will reconcile the visible list.
        }
      })();
      return;
    }
    setPlants([]);
  }, [user]);

  const plantById = useCallback((id: string) => plants.find((p) => p.id === id), [plants]);

  const diagnosisById = useCallback(
    (id: string) =>
      (current?.id === id ? current : undefined) ??
      plants.flatMap((p) => p.diagnoses).find((d) => d.id === id),
    [current, plants],
  );

  const todaysTasks = useMemo(
    () =>
      plants
        .flatMap((plant) =>
          plant.tasks
            .filter((t) => !t.done)
            .map((task) => ({ plant, task })),
        )
        .sort((a, b) => a.task.due.localeCompare(b.task.due)),
    [plants],
  );

  const allDiagnoses = useMemo(
    () =>
      plants
        .flatMap((p) => p.diagnoses)
        .sort((a, b) => b.at - a.at),
    [plants],
  );

  const value = useMemo<AppState>(
    () => ({
      symptomText,
      plantType,
      current,
      loading,
      error,
      liveFailed,
      plants,
      history,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      setSymptomText,
      setPlantType,
      diagnose,
      refreshCurrent,
      clearCurrent,
      addPlant,
      removePlant,
      saveCurrentToPlant,
      toggleTask,
      addTask,
      removeTask,
      applyHistory,
      clearHistory,
      clearPlants,
      plantById,
      diagnosisById,
      todaysTasks,
      allDiagnoses,
    }),
    [
      symptomText,
      plantType,
      current,
      loading,
      error,
      liveFailed,
      plants,
      history,
      user,
      authReady,
      guest,
      signIn,
      signInWithEmail,
      signUpWithEmail,
      updateDisplayName,
      setAvatarData,
      sendPasswordReset,
      resetPasswordForEmail,
      signOut,
      continueAsGuest,
      diagnose,
      refreshCurrent,
      clearCurrent,
      addPlant,
      removePlant,
      saveCurrentToPlant,
      toggleTask,
      addTask,
      removeTask,
      applyHistory,
      clearHistory,
      clearPlants,
      plantById,
      diagnosisById,
      todaysTasks,
      allDiagnoses,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
