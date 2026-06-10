import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { FirestoreRepository } from '../lib/storage/firestoreRepository.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { DEVICE_FAMILY_ID_KEY, DEVICE_ROLE_KEY } from '../lib/storage/keys.ts'
import { auth } from '../lib/firebase/app.ts'
import { getUserProfile } from '../lib/firebase/userProfile.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useSessionStore } from './sessionStore.ts'

export async function bootstrapQuivoApp(repo?: DataRepository): Promise<void> {
  if (repo) {
    useFamilyStore.getState().setRepository(repo)
    useSessionStore.getState().clearEffects()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
    return
  }

  // Child path: role stored in localStorage after QR scan
  const role = localStorage.getItem(DEVICE_ROLE_KEY)
  const familyId = localStorage.getItem(DEVICE_FAMILY_ID_KEY)

  if (role === 'child' && familyId) {
    try {
      useAppStore.getState().setDeviceRole('child')
      useFamilyStore.getState().setRepository(new FirestoreRepository(familyId))
      useSessionStore.getState().clearEffects()
      useAppStore.getState().resetNavigation()
      await useFamilyStore.getState().bootstrap()
    } catch {
      useFamilyStore.getState().markReady()
      useAppStore.getState().setOnboardingScreen('landing')
      useAppStore.getState().setMode('onboarding')
    }
    return
  }

  // Parent path: check Firebase Auth (waits for auth state to be restored)
  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      unsubscribe()
      resolve(u)
    })
  })

  if (user) {
    try {
      const profile = await getUserProfile(user.uid)
      if (!profile) {
        // Signed in but no family yet — send to setup
        useAppStore.getState().setDeviceRole('parent')
        useFamilyStore.getState().markReady()
        useAppStore.getState().setOnboardingScreen('parentSetup')
        useAppStore.getState().setMode('onboarding')
        return
      }
      useAppStore.getState().setDeviceRole('parent')
      useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
      useSessionStore.getState().clearEffects()
      useAppStore.getState().setMode('parent')
      await useFamilyStore.getState().bootstrap()
    } catch {
      useFamilyStore.getState().markReady()
      useAppStore.getState().setOnboardingScreen('landing')
      useAppStore.getState().setMode('onboarding')
    }
    return
  }

  // Not a child device, not a logged-in parent → onboarding
  useFamilyStore.getState().markReady()
  useAppStore.getState().setOnboardingScreen('landing')
  useAppStore.getState().setMode('onboarding')
}
