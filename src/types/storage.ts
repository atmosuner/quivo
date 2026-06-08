import type { Family } from './domain.ts'

/** Current persisted schema version. Bump when AppSnapshot shape changes. */
export const CURRENT_SCHEMA_VERSION = 1 as const

export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION

export interface AppSnapshotMeta {
  /** ISO datetime of the last persistence write. */
  lastModified: string
  /** ISO datetime when the snapshot was first created / seeded. */
  createdAt: string
}

/**
 * Root envelope written to localStorage.
 * AchievementDefinition is intentionally excluded — bundled as app constants.
 */
export interface AppSnapshot {
  schemaVersion: SchemaVersion
  family: Family
  meta: AppSnapshotMeta
}
