"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  type Firestore,
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
