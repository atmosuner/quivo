/** Primary persisted snapshot key. */
export const STORAGE_KEY = 'quivo.app.snapshot.v1'

/** Prefix for corrupted or unsupported snapshot backups. */
export const BACKUP_KEY_PREFIX = 'quivo.app.snapshot.backup.'

export function backupStorageKey(timestamp: string): string {
  return `${BACKUP_KEY_PREFIX}${timestamp}`
}

/** Device role — 'parent' or 'child'. Set once during onboarding, persists forever. */
export const DEVICE_ROLE_KEY = 'quivo.device.role'

/** Family ID (UUID) — the Firestore document key for this family. */
export const DEVICE_FAMILY_ID_KEY = 'quivo.device.familyId'
