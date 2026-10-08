import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
export function firebaseAdmin() {
  if (!process.env.FIREBASE_PROJECT_ID) throw new Error('Firebase is not configured');
  return (
    getApps()[0] ??
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      credential: process.env.FIREBASE_PRIVATE_KEY
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          })
        : applicationDefault(),
    })
  );
}
