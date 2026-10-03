import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyABQZ_4SCB1Jb-dvXlol_8jBtkQu1J9V04",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "billwebzz.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "billwebzz",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "billwebzz.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "386704420304",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:386704420304:web:d453b7ae10a3923385ddd5",
};

// Always enabled with valid project credentials
export const isFirebaseEnabled = 
  !!firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'undefined';

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
  console.warn("Firebase configuration is missing.");
}

export const db = firestoreDb;
export const auth = firebaseAuth;
