import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

function requireFirebaseEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing Firebase config (${name}). For local dev, copy .env.example to .env. For GitHub Pages, add repository secrets and redeploy.`,
    )
  }
  return value.trim()
}

const firebaseConfig = {
  apiKey: requireFirebaseEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requireFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requireFirebaseEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requireFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireFirebaseEnv('VITE_FIREBASE_APP_ID'),
}

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseProjectId = firebaseConfig.projectId
export const db = getFirestore(firebaseApp)
