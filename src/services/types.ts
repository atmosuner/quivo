import type { AppSnapshot } from '../types/storage.ts'
import type { GrantEffect } from '../types/gamification.ts'

/** Standard service return shape for future UI celebration wiring. */
export interface ServiceResult {
  snapshot: AppSnapshot
  effects: GrantEffect[]
}
