import { createSeedSnapshot } from '../../data/seed.ts'
import { validateSnapshot } from '../../data/validateSnapshot.ts'
import type { AppSnapshot } from '../../types/storage.ts'
import { CURRENT_SCHEMA_VERSION } from '../../types/storage.ts'

export class UnsupportedSchemaVersionError extends Error {
  readonly storedVersion: number

  constructor(storedVersion: number) {
    super(
      `Stored schema version ${storedVersion} is newer than supported version ${CURRENT_SCHEMA_VERSION}`,
    )
    this.name = 'UnsupportedSchemaVersionError'
    this.storedVersion = storedVersion
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readSchemaVersion(raw: unknown): number | null {
  if (!isRecord(raw)) return null
  const version = raw.schemaVersion
  return typeof version === 'number' ? version : null
}

function migrateToV1(raw: unknown): AppSnapshot {
  // Only v1 exists today. Unknown shapes fall back to a fresh seed.
  if (!isRecord(raw) || !isRecord(raw.family)) {
    return createSeedSnapshot()
  }

  const candidate = raw as unknown as AppSnapshot
  const validation = validateSnapshot(candidate)
  if (!validation.valid) {
    return createSeedSnapshot()
  }

  return {
    ...candidate,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: {
      createdAt:
        typeof candidate.meta?.createdAt === 'string'
          ? candidate.meta.createdAt
          : new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  }
}

/**
 * Migrate a parsed JSON value to the current AppSnapshot shape.
 * Throws UnsupportedSchemaVersionError when stored version is too new.
 */
export function migrateSnapshot(raw: unknown): AppSnapshot {
  const version = readSchemaVersion(raw)

  if (version === null) {
    return migrateToV1(raw)
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(version)
  }

  if (version === CURRENT_SCHEMA_VERSION) {
    const snapshot = raw as unknown as AppSnapshot
    const validation = validateSnapshot(snapshot)
    if (!validation.valid) {
      return createSeedSnapshot()
    }
    return snapshot
  }

  // Future chain: v0 -> v1, v1 -> v2, etc.
  if (version < CURRENT_SCHEMA_VERSION) {
    return migrateToV1(raw)
  }

  return createSeedSnapshot()
}
