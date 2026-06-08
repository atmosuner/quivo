import { ACHIEVEMENT_DEFINITION_IDS } from './achievements.ts'
import type { AppSnapshot } from '../types/storage.ts'
import type {
  ApprovalStatus,
  BookStatus,
  TaskStatus,
} from '../types/domain.ts'

const TASK_STATUSES: TaskStatus[] = [
  'open',
  'pending_approval',
  'completed_today',
]

const BOOK_STATUSES: BookStatus[] = ['reading', 'done']

const APPROVAL_STATUSES: ApprovalStatus[] = [
  'pending',
  'approved',
  'declined',
]

export interface SnapshotValidationResult {
  valid: boolean
  errors: string[]
}

/** Lightweight structural validation for AppSnapshot (no engines). */
export function validateSnapshot(snapshot: AppSnapshot): SnapshotValidationResult {
  const errors: string[] = []

  if (snapshot.schemaVersion !== 1) {
    errors.push(`schemaVersion must be 1, got ${snapshot.schemaVersion}`)
  }

  if (!snapshot.meta?.createdAt || !snapshot.meta?.lastModified) {
    errors.push('meta.createdAt and meta.lastModified are required')
  }

  const { family } = snapshot
  if (!family?.id || !family.name) {
    errors.push('family.id and family.name are required')
  }

  if (!Array.isArray(family.children) || family.children.length === 0) {
    errors.push('family.children must be a non-empty array')
  }

  if (!family.settings?.activeChildId) {
    errors.push('family.settings.activeChildId is required')
  }

  const childIds = new Set(family.children?.map((c) => c.id) ?? [])

  if (!childIds.has(family.settings.activeChildId)) {
    errors.push('activeChildId must reference an existing child')
  }

  for (const child of family.children ?? []) {
    if (child.coins < 0) errors.push(`child ${child.id}: coins cannot be negative`)
    if (child.coinsPending < 0) {
      errors.push(`child ${child.id}: coinsPending cannot be negative`)
    }
    if (child.weeklyXp.length !== 7) {
      errors.push(`child ${child.id}: weeklyXp must have 7 entries`)
    }
  }

  for (const task of family.tasks ?? []) {
    if (!childIds.has(task.childId)) {
      errors.push(`task ${task.id}: unknown childId ${task.childId}`)
    }
    if (!TASK_STATUSES.includes(task.status)) {
      errors.push(`task ${task.id}: invalid status ${task.status}`)
    }
  }

  for (const book of family.books ?? []) {
    if (!childIds.has(book.childId)) {
      errors.push(`book ${book.id}: unknown childId ${book.childId}`)
    }
    if (!BOOK_STATUSES.includes(book.status)) {
      errors.push(`book ${book.id}: invalid status ${book.status}`)
    }
    if (book.pagesRead > book.totalPages) {
      errors.push(`book ${book.id}: pagesRead exceeds totalPages`)
    }
  }

  for (const log of family.readingLogs ?? []) {
    if (!childIds.has(log.childId)) {
      errors.push(`readingLog ${log.id}: unknown childId ${log.childId}`)
    }
  }

  for (const approval of family.approvals ?? []) {
    if (!childIds.has(approval.childId)) {
      errors.push(`approval ${approval.id}: unknown childId ${approval.childId}`)
    }
    if (!APPROVAL_STATUSES.includes(approval.status)) {
      errors.push(`approval ${approval.id}: invalid status ${approval.status}`)
    }
  }

  for (const progress of family.achievementProgress ?? []) {
    if (!ACHIEVEMENT_DEFINITION_IDS.includes(progress.achievementId)) {
      errors.push(
        `achievementProgress: unknown achievementId ${progress.achievementId}`,
      )
    }
    if (!childIds.has(progress.childId)) {
      errors.push(
        `achievementProgress: unknown childId ${progress.childId}`,
      )
    }
  }

  return { valid: errors.length === 0, errors }
}

/** Throws if invalid — for dev/build-time seed checks. */
export function assertValidSnapshot(snapshot: AppSnapshot): void {
  const result = validateSnapshot(snapshot)
  if (!result.valid) {
    throw new Error(`Invalid AppSnapshot:\n${result.errors.join('\n')}`)
  }
}
