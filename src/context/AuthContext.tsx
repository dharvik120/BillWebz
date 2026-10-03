'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirebaseEnabled } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  role?: 'user' | 'admin';
  emailVerified: boolean;
  photoURL?: string;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string, fullName?: string) => Promise<{ needVerification: boolean }>;
  signInWithEmailOrUsername: (identifier: string, password: string) => Promise<void>;
  sendResetPasswordEmail: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => ({ needVerification: true }),
  signInWithEmailOrUsername: async () => {},
  sendResetPasswordEmail: async () => {},
  resendVerificationEmail: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to fetch/create Firestore user profile
  const syncUserProfile = async (firebaseUser: User, customUsername?: string) => {
    if (!db) {
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        username: customUsername || firebaseUser.email?.split('@')[0] || 'user',
        displayName: firebaseUser.displayName || customUsername || 'User',
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL || undefined,
        role: firebaseUser.email === 'support@billwebz.com' ? 'admin' : 'user'
      };
      setUserProfile(fallbackProfile);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as UserProfile;
        await setDoc(userDocRef, {
          emailVerified: firebaseUser.emailVerified,
          lastLoginAt: serverTimestamp()
        }, { merge: true });

        setUserProfile({
          ...data,
          emailVerified: firebaseUser.emailVerified
        });
      } else {
        const username = (
          customUsername || 
          firebaseUser.displayName?.toLowerCase().replace(/[^a-z0-9_]/g, '') || 
          firebaseUser.email?.split('@')[0] || 
          `user_${Math.random().toString(36).substring(2, 7)}`
        ).toLowerCase();

        const newProfile: any = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username,
          displayName: firebaseUser.displayName || customUsername || username,
          role: firebaseUser.email === 'support@billwebz.com' ? 'admin' : 'user',
          emailVerified: firebaseUser.emailVerified,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };

        await setDoc(userDocRef, newProfile, { merge: true });
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Error syncing user profile with Firestore:', err);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Google Sign In
  const signInWithGoogle = async () => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      await syncUserProfile(result.user);
    }
  };

  // 2. Email & Password Sign Up with verification link sent
  const signUpWithEmail = async (email: string, password: string, username: string, fullName?: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long.');
    }

    // Check if username is already taken in Firestore
    if (db) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', cleanUsername));
        const snap = await getDocs(q);
        if (!snap.empty) {
          throw new Error('This username is already taken. Please choose another one.');
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already taken')) throw err;
      }
    }

    // Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const createdUser = cred.user;

    // Update display name
    await updateProfile(createdUser, {
      displayName: fullName?.trim() || cleanUsername
    });

    // Send direct email verification link
    try {
      await sendEmailVerification(createdUser);
    } catch (verificationErr) {
      console.warn('Could not send email verification link:', verificationErr);
    }

    // Save profile to Firestore
    await syncUserProfile(createdUser, cleanUsername);

    return { needVerification: true };
  };

  // 3. Email OR Username Sign In
  const signInWithEmailOrUsername = async (identifier: string, password: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');

    const trimmed = identifier.trim();
    let loginEmail = trimmed;

    // If identifier doesn't contain '@', treat it as username and find matching email
    if (!trimmed.includes('@')) {
      if (!db) {
        throw new Error('Cannot lookup username without database connection. Please enter your email address.');
      }
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', trimmed.toLowerCase()));
      const snap = await getDocs(q);

      if (snap.empty) {
        throw new Error('No account found with this username. Please check your username or use email.');
      }

      const foundUser = snap.docs[0].data() as UserProfile;
      loginEmail = foundUser.email;
    }

    const cred = await signInWithEmailAndPassword(auth, loginEmail, password);
    if (cred.user) {
      await syncUserProfile(cred.user);
    }
  };

  // 4. Send direct reset password link to user's email
  const sendResetPasswordEmail = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await sendPasswordResetEmail(auth, email.trim());
  };

  // 5. Resend verification email
  const resendVerificationEmail = async () => {
    if (!auth?.currentUser) throw new Error('No user is currently signed in');
    await sendEmailVerification(auth.currentUser);
  };

  // 6. Sign Out
  const logout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setUserProfile(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('billwebz_admin_logged_in');
    }
  };

  const isAdmin = userProfile?.role === 'admin' || user?.email === 'support@billwebz.com';

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmailOrUsername,
        sendResetPasswordEmail,
        resendVerificationEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
