"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  EmailAuthProvider,
  linkWithCredential,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  increment,
  collection,
  orderBy,
  query,
  limit,
  serverTimestamp,
  type Firestore,
  type Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db, isConfigured };

export interface SessionRecord {
  id: string;
  promptId: string;
  promptTopic: string;
  type: "speaking" | "writing";
  delivery: number;
  language_use: number;
  topic_development: number;
  total: number;
  feedback: string;
  transcription: string;
  createdAt: Timestamp | null;
}

// Sign in anonymously on first visit — silent, no UI
export async function ensureAnonymousAuth(): Promise<User | null> {
  if (!auth) return null;
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth!, (user) => {
      unsub();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth!).then((cred) => resolve(cred.user)).catch(() => resolve(null));
      }
    });
  });
}

const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

export async function saveSession(
  uid: string,
  data: Omit<SessionRecord, "id" | "createdAt">
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, "users", uid, "sessions"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function upgradeWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; alreadyExists?: boolean; error?: string }> {
  if (!auth?.currentUser) return { success: false, error: "Tidak ada sesi aktif" };
  try {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(auth.currentUser, credential);
    return { success: true };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/email-already-in-use") return { success: false, alreadyExists: true };
    return { success: false, error: (err as Error).message };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!auth) return { success: false, error: "Firebase tidak aktif" };
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getRecentSessions(
  uid: string,
  count = 20
): Promise<SessionRecord[]> {
  if (!db) return [];
  const q = query(
    collection(db, "users", uid, "sessions"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SessionRecord));
}

export async function getSessionCount(
  uid: string,
  type: "speaking" | "writing"
): Promise<{ used: number; limit: number }> {
  if (!db) return { used: 0, limit: 99 };
  const LIMITS = { speaking: 3, writing: 2 };
  const ref = doc(db, "users", uid, "daily_counts", today());
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const used = (data[type] as number) ?? 0;
  return { used, limit: LIMITS[type] };
}

// Returns true if the user is under the daily limit and increments the counter atomically.
export async function checkAndIncrementSession(
  uid: string,
  type: "speaking" | "writing"
): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (!db) {
    // Firebase not configured — allow all (dev mode)
    return { allowed: true, used: 0, limit: 99 };
  }

  const LIMITS = { speaking: 3, writing: 2 };
  const limit = LIMITS[type];
  const ref = doc(db, "users", uid, "daily_counts", today());

  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  const used = (data[type] as number) ?? 0;

  if (used >= limit) {
    return { allowed: false, used, limit };
  }

  // Atomic increment
  if (snap.exists()) {
    await updateDoc(ref, { [type]: increment(1) });
  } else {
    await setDoc(ref, { speaking: 0, writing: 0, [type]: 1, date: serverTimestamp() });
  }

  return { allowed: true, used: used + 1, limit };
}
