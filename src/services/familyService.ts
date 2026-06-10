import type { Child } from '../types/domain.ts'
import type { AppSnapshot } from '../types/storage.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { buildSnapshot } from './shared.ts'
import type { ServiceResult } from './types.ts'

export async function loadFamily(
  repo: DataRepository = localStorageRepository,
): Promise<AppSnapshot> {
  return repo.load()
}

export async function resetFamily(
  repo: DataRepository = localStorageRepository,
): Promise<AppSnapshot> {
  return repo.reset()
}

export async function switchActiveChild(
  childId: string,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const exists = snapshot.family.children.some((child) => child.id === childId)
  if (!exists) {
    throw new Error(`child not found: ${childId}`)
  }

  const family = {
    ...snapshot.family,
    settings: {
      ...snapshot.family.settings,
      activeChildId: childId,
    },
  }

  const updated = buildSnapshot(family, snapshot.meta)
  await repo.save(updated)
  return { snapshot: updated, effects: [] }
}

export function getActiveChild(snapshot: AppSnapshot): Child {
  const child = snapshot.family.children.find(
    (entry) => entry.id === snapshot.family.settings.activeChildId,
  )
  if (!child) {
    throw new Error('active child not found')
  }
  return child
}

export function getChildById(snapshot: AppSnapshot, childId: string): Child {
  const child = snapshot.family.children.find((entry) => entry.id === childId)
  if (!child) {
    throw new Error(`child not found: ${childId}`)
  }
  return child
}

