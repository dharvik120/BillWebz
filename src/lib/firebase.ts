import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if variables are configured
export const isFirebaseEnabled = 
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'undefined';

let app;
let firestoreDb: any = null;
let firebaseAuth: any = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(app);
    firebaseAuth = getAuth(app);
    console.log("Firebase initialized successfully in Cloud Mode.");
  } catch (error) {
    console.error("Failed to initialize Firebase app:", error);
  }
} else {
  console.warn("Firebase environment variables are missing. Operating in offline LocalStorage/IndexedDB mode.");
}

export const db = firestoreDb;
export const auth = firebaseAuth;
