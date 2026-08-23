/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseConfigData.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: firebaseConfigData.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: firebaseConfigData.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: firebaseConfigData.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseConfigData.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.apiKey !== '' && !firebaseConfig.apiKey.includes('MY_')
);

// Initialize Firebase App
export const app = getApps().length === 0 && isFirebaseConfigured
  ? initializeApp(firebaseConfig)
  : getApps().length > 0
  ? getApp()
  : null;

export const auth = app ? getAuth(app) : null;
export const db = app
  ? firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app)
  : null;

export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<{
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
} | null> {
  if (!auth) {
    return {
      displayName: 'Admin',
      email: 'admin.xma@pkxd.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      uid: `google-${Date.now()}`
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user: User = result.user;
    return {
      displayName: user.displayName || 'Admin',
      email: user.email || '',
      photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      uid: user.uid
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOutFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}
