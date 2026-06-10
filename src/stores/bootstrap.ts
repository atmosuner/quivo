import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase/app.ts'
import { FirestoreRepository } from '../lib/storage/firestoreRepository.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useParentGateStore } from './parentGateStore.ts'
import { useSessionStore } from './sessionStore.ts'

/** Resolves existing Firebase Auth session or creates a new anonymous one. */
async function resolveUser(): Promise<User> {
  const existing = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      resolve(user)
    })
  })
  if (existing) return existing
  const { user } = await signInAnonymously(auth)
  return user
}

/**
 * App entry bootstrap:
 * 1. Optional repository override (tests / future DI)
 * 2. Anonymous Firebase Auth + FirestoreRepository by default
 * 3. Daily reset + family snapshot load
 * 4. Default navigation state
 */
export async function bootstrapQuivoApp(repo?: DataRepository): Promise<void> {
  if (repo) {
    useFamilyStore.getState().setRepository(repo)
  } else {
    const user = await resolveUser()
    useFamilyStore.getState().setRepository(new FirestoreRepository(user.uid))
  }

  useSessionStore.getState().clearEffects()
  useParentGateStore.getState().clearSession()
  useAppStore.getState().resetNavigation()

  await useFamilyStore.getState().bootstrap()
}
