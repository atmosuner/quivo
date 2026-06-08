import type { DataRepository } from '../lib/storage/repository.ts'
import { useAppStore } from './appStore.ts'
import { useFamilyStore } from './familyStore.ts'
import { useParentGateStore } from './parentGateStore.ts'
import { useSessionStore } from './sessionStore.ts'

/**
 * App entry bootstrap:
 * 1. Optional repository override (tests / future DI)
 * 2. Daily reset + family snapshot load
 * 3. Default navigation state
 */
export async function bootstrapQuivoApp(
  repo?: DataRepository,
): Promise<void> {
  if (repo) {
    useFamilyStore.getState().setRepository(repo)
  }

  useSessionStore.getState().clearEffects()
  useParentGateStore.getState().clearSession()
  useAppStore.getState().resetNavigation()

  await useFamilyStore.getState().bootstrap()
}
