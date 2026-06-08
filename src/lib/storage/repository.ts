import type { AppSnapshot } from '../../types/storage.ts'

export interface DataRepository {
  /** Load persisted snapshot or seed + persist on first launch. */
  load(): Promise<AppSnapshot>
  /** Persist the full snapshot envelope. */
  save(snapshot: AppSnapshot): Promise<void>
  /** Replace storage with a fresh seed snapshot and return it. */
  reset(): Promise<AppSnapshot>
}
