import { FirestoreRepository } from '../lib/storage/firestoreRepository.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { DEVICE_FAMILY_ID_KEY, DEVICE_ROLE_KEY } from '../lib/storage/keys.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useParentGateStore } from './parentGateStore.ts'
import { useSessionStore } from './sessionStore.ts'

export async function bootstrapQuivoApp(repo?: DataRepository): Promise<void> {
  if (repo) {
    useFamilyStore.getState().setRepository(repo)
    useSessionStore.getState().clearEffects()
    useParentGateStore.getState().clearSession()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
    return
  }

  const role = localStorage.getItem(DEVICE_ROLE_KEY) as 'parent' | 'child' | null
  const familyId = localStorage.getItem(DEVICE_FAMILY_ID_KEY)

  if (!role || !familyId) {
    useFamilyStore.getState().markReady()
    useAppStore.getState().setOnboardingScreen('landing')
    useAppStore.getState().setMode('onboarding')
    return
  }

  try {
    useAppStore.getState().setDeviceRole(role)
    useFamilyStore.getState().setRepository(new FirestoreRepository(familyId))
    useSessionStore.getState().clearEffects()
    useParentGateStore.getState().clearSession()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
  } catch {
    useFamilyStore.getState().markReady()
    useAppStore.getState().setOnboardingScreen('landing')
    useAppStore.getState().setMode('onboarding')
  }
}
