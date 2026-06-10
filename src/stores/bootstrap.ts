import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../lib/firebase/app.ts'
import { detectEmailLinkSignIn } from '../lib/firebase/emailInvite.ts'
import { getUserProfile } from '../lib/firebase/userProfile.ts'
import type { UserProfile } from '../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../lib/storage/firestoreRepository.ts'
import { LocalStorageRepository } from '../lib/storage/localStorage.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useParentGateStore } from './parentGateStore.ts'
import { useSessionStore } from './sessionStore.ts'
import type { OnboardingScreen } from '../types/navigation.ts'

export const DEMO_STORAGE_KEY = 'quivo.demoMode'
export const PENDING_SETUP_ROLE_KEY = 'quivo.pendingSetupRole'

async function getAuthUser(): Promise<User | null> {
  try {
    const redirectResult = await getRedirectResult(auth)
    if (redirectResult?.user) return redirectResult.user
  } catch {
    // ignore redirect errors
  }
  return new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub()
      resolve(user)
    })
  })
}

function goToOnboarding(screen: OnboardingScreen): void {
  useFamilyStore.getState().markReady()
  useAppStore.getState().setOnboardingScreen(screen)
  useAppStore.getState().setMode('onboarding')
}

async function loadUserFamily(profile: UserProfile): Promise<void> {
  useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
  useSessionStore.getState().clearEffects()
  useParentGateStore.getState().clearSession()
  useAppStore.getState().resetNavigation()
  await useFamilyStore.getState().bootstrap()

  if (profile.role === 'child' && profile.childId) {
    const snapshot = useFamilyStore.getState().snapshot
    if (snapshot && snapshot.family.settings.activeChildId !== profile.childId) {
      const exists = snapshot.family.children.some((c) => c.id === profile.childId)
      if (exists) await useFamilyStore.getState().switchActiveChild(profile.childId)
    }
  }
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

  if (localStorage.getItem(DEMO_STORAGE_KEY) === 'true') {
    useFamilyStore.getState().setRepository(new LocalStorageRepository())
    useSessionStore.getState().clearEffects()
    useParentGateStore.getState().clearSession()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
    return
  }

  const linkData = detectEmailLinkSignIn()
  if (linkData) {
    goToOnboarding('childJoin')
    return
  }

  const user = await getAuthUser()

  if (!user || user.isAnonymous) {
    goToOnboarding('landing')
    return
  }

  try {
    const profile = await getUserProfile(user.uid)

    if (!profile) {
      const pendingRole = localStorage.getItem(PENDING_SETUP_ROLE_KEY)
      localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
      if (pendingRole === 'parent') {
        goToOnboarding('parentSetup')
      } else if (pendingRole === 'child') {
        goToOnboarding('childWaiting')
      } else {
        goToOnboarding('landing')
      }
      return
    }

    await loadUserFamily(profile)
  } catch {
    goToOnboarding('landing')
  }
}
