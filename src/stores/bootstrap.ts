import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase/app.ts'
import { getUserProfile } from '../lib/firebase/userProfile.ts'
import type { UserProfile } from '../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../lib/storage/firestoreRepository.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useParentGateStore } from './parentGateStore.ts'
import { useSessionStore } from './sessionStore.ts'

export const PENDING_SETUP_ROLE_KEY = 'quivo.pendingSetupRole'

async function getAuthUser(): Promise<User | null> {
  try {
    const redirectResult = await getRedirectResult(auth)
    if (redirectResult?.user) return redirectResult.user
  } catch {
    // ignore redirect errors
  }
  // auth.currentUser may already be set after getRedirectResult processed the redirect
  if (auth.currentUser) return auth.currentUser
  return new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      resolve(user)
    })
  })
}

function goToOnboarding(): void {
  useFamilyStore.getState().markReady()
  useAppStore.getState().setOnboardingScreen('landing')
  useAppStore.getState().setMode('onboarding')
}

async function loadParentFamily(profile: UserProfile): Promise<void> {
  useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
  useSessionStore.getState().clearEffects()
  useParentGateStore.getState().clearSession()
  useAppStore.getState().resetNavigation()
  // resetNavigation sets mode='child' and childUnlocked=false — child selector will show
  await useFamilyStore.getState().bootstrap()
}

export async function bootstrapQuivoApp(repo?: DataRepository): Promise<void> {
  if (repo) {
    useFamilyStore.getState().setRepository(repo)
    useSessionStore.getState().clearEffects()
    useParentGateStore.getState().clearSession()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
    return
  }

  const user = await getAuthUser()

  if (!user || user.isAnonymous) {
    goToOnboarding()
    return
  }

  try {
    const profile = await getUserProfile(user.uid)

    if (!profile) {
      const pendingRole = localStorage.getItem(PENDING_SETUP_ROLE_KEY)
      localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
      if (pendingRole === 'parent') {
        useFamilyStore.getState().markReady()
        useAppStore.getState().setOnboardingScreen('parentSetup')
        useAppStore.getState().setMode('onboarding')
      } else {
        goToOnboarding()
      }
      return
    }

    localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
    await loadParentFamily(profile)
  } catch {
    goToOnboarding()
  }
}
