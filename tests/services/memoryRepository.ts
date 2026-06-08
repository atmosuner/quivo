import { createSeedSnapshot } from '../../src/data/seed.ts'
import type { AppSnapshot } from '../../src/types/storage.ts'
import type { DataRepository } from '../../src/lib/storage/repository.ts'

export class MemoryRepository implements DataRepository {
  private snapshot: AppSnapshot | null = null

  seed(snapshot: AppSnapshot): void {
    this.snapshot = structuredClone(snapshot)
  }

  async load(): Promise<AppSnapshot> {
    if (!this.snapshot) {
      this.snapshot = createSeedSnapshot()
    }
    return structuredClone(this.snapshot)
  }

  async save(snapshot: AppSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot)
  }

  async reset(): Promise<AppSnapshot> {
    this.snapshot = createSeedSnapshot()
    return structuredClone(this.snapshot)
  }
}
