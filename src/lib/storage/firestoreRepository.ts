import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/app.ts'
import { createSeedSnapshot } from '../../data/seed.ts'
import { migrateSnapshot } from './migrations.ts'
import { STORAGE_KEY } from './keys.ts'
import type { AppSnapshot } from '../../types/storage.ts'
import { CURRENT_SCHEMA_VERSION } from '../../types/storage.ts'
import type { DataRepository } from './repository.ts'

function nowIso(): string {
  return new Date().toISOString()
}

export class FirestoreRepository implements DataRepository {
  private uid: string

  constructor(uid: string) {
    this.uid = uid
  }

  private docRef() {
    return doc(db, 'users', this.uid, 'data', 'snapshot')
  }

  async load(): Promise<AppSnapshot> {
    const snap = await getDoc(this.docRef())

    if (!snap.exists()) {
      // One-time migration: carry over any existing localStorage data.
      const localRaw = localStorage.getItem(STORAGE_KEY)
      if (localRaw) {
        try {
          const migrated = migrateSnapshot(JSON.parse(localRaw))
          await this.save(migrated)
          return structuredClone(migrated)
        } catch {
          // Fall through to seed.
        }
      }

      const seeded = createSeedSnapshot()
      await this.save(seeded)
      return structuredClone(seeded)
    }

    try {
      return structuredClone(migrateSnapshot(snap.data()))
    } catch {
      return this.reset()
    }
  }

  async save(snapshot: AppSnapshot): Promise<void> {
    await setDoc(this.docRef(), {
      ...snapshot,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      meta: {
        ...snapshot.meta,
        lastModified: nowIso(),
      },
    })
  }

  async reset(): Promise<AppSnapshot> {
    const seeded = createSeedSnapshot()
    await this.save(seeded)
    return structuredClone(seeded)
  }
}
