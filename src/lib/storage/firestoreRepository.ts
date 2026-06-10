import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/app.ts'
import { createSeedSnapshot } from '../../data/seed.ts'
import { migrateSnapshot } from './migrations.ts'
import type { AppSnapshot } from '../../types/storage.ts'
import { CURRENT_SCHEMA_VERSION } from '../../types/storage.ts'
import type { DataRepository } from './repository.ts'

function nowIso(): string {
  return new Date().toISOString()
}

export class FirestoreRepository implements DataRepository {
  private familyId: string

  constructor(familyId: string) {
    this.familyId = familyId
  }

  private docRef() {
    return doc(db, 'families', this.familyId, 'data', 'snapshot')
  }

  async load(): Promise<AppSnapshot> {
    const snap = await getDoc(this.docRef())

    if (!snap.exists()) {
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
