import { createSeedSnapshot } from '../../data/seed.ts'
import type { AppSnapshot } from '../../types/storage.ts'
import { CURRENT_SCHEMA_VERSION } from '../../types/storage.ts'
import { backupStorageKey, STORAGE_KEY } from './keys.ts'
import {
  migrateSnapshot,
  UnsupportedSchemaVersionError,
} from './migrations.ts'
import type { DataRepository } from './repository.ts'

function nowIso(): string {
  return new Date().toISOString()
}

function cloneSnapshot(snapshot: AppSnapshot): AppSnapshot {
  return structuredClone(snapshot)
}

function writeRaw(key: string, value: string): void {
  localStorage.setItem(key, value)
}

function backupRaw(raw: string, reason: string): void {
  const timestamp = nowIso().replace(/[:.]/g, '-')
  const backupKey = backupStorageKey(timestamp)
  try {
    writeRaw(backupKey, JSON.stringify({ reason, savedAt: nowIso(), raw }))
  } catch {
    // Best-effort backup — do not block recovery.
  }
}

function serialize(snapshot: AppSnapshot): string {
  return JSON.stringify({
    ...snapshot,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: {
      ...snapshot.meta,
      lastModified: nowIso(),
    },
  })
}

function parseStored(raw: string): AppSnapshot {
  const parsed: unknown = JSON.parse(raw)
  return migrateSnapshot(parsed)
}

/**
 * MVP persistence adapter.
 * This is the only module that may access localStorage directly.
 */
export class LocalStorageRepository implements DataRepository {
  async load(): Promise<AppSnapshot> {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (raw === null) {
      const seeded = createSeedSnapshot()
      await this.save(seeded)
      return cloneSnapshot(seeded)
    }

    try {
      const snapshot = parseStored(raw)
      return cloneSnapshot(snapshot)
    } catch (error) {
      if (error instanceof UnsupportedSchemaVersionError) {
        backupRaw(raw, `unsupported-schema-v${error.storedVersion}`)
        pendingRecoveryNotice =
          'Saved data used an older format. The demo family has been restored.'
      } else {
        backupRaw(raw, 'corrupt-or-invalid')
        pendingRecoveryNotice =
          'Saved data was damaged. The demo family has been restored.'
      }
      return this.reset()
    }
  }

  async save(snapshot: AppSnapshot): Promise<void> {
    const payload = serialize(cloneSnapshot(snapshot))
    writeRaw(STORAGE_KEY, payload)
  }

  async reset(): Promise<AppSnapshot> {
    const seeded = createSeedSnapshot()
    await this.save(seeded)
    return cloneSnapshot(seeded)
  }
}

let pendingRecoveryNotice: string | null = null

/** Consume a one-shot notice when load recovered from corrupt or unsupported data. */
export function consumeRecoveryNotice(): string | null {
  const notice = pendingRecoveryNotice
  pendingRecoveryNotice = null
  return notice
}

/** Shared singleton for app bootstrap (stores/services will use this later). */
export const localStorageRepository = new LocalStorageRepository()
