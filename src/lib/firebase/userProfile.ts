import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './app.ts'

export interface UserProfile {
  familyId: string
  createdAt: string
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid), profile)
}
