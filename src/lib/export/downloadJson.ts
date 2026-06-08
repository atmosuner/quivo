import type { AppSnapshot } from '../../types/storage.ts'

/** Trigger a browser download of the current family snapshot as JSON. */
export function downloadSnapshotJson(snapshot: AppSnapshot, filename?: string): void {
  const stamp = snapshot.meta.lastModified.slice(0, 10)
  const name = filename ?? `quivo-export-${stamp}.json`
  const payload = JSON.stringify(snapshot, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
