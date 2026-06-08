/** Primary persisted snapshot key. */
export const STORAGE_KEY = 'quivo.app.snapshot.v1'

/** Prefix for corrupted or unsupported snapshot backups. */
export const BACKUP_KEY_PREFIX = 'quivo.app.snapshot.backup.'

export function backupStorageKey(timestamp: string): string {
  return `${BACKUP_KEY_PREFIX}${timestamp}`
}
