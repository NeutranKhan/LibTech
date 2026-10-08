import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
export function browserAuth() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
    throw new Error('Account registration is not connected yet. Please try again later.');
  return getAuth(
    getApps()[0] ??
      initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      }),
  );
}
