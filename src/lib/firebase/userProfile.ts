import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './app.ts'

export type UserRole = 'parent' | 'child'

export interface UserProfile {
  role: UserRole
  familyId: string
  childId?: string
  createdAt: string
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (!snap.exists()) return null
    return snap.data() as UserProfile
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code
    // permission-denied means rules aren't set up yet — treat as no profile
    if (code === 'permission-denied') return null
    throw err
  }
}

export async function saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid), profile)
}
