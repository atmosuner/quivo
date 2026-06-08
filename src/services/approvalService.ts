import type { Family } from '../types/domain.ts'
import type { GrantEffect } from '../types/gamification.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import {
  approveReadingLog,
  approveRewardRedemption,
  approveTaskCompletion,
  declineReadingLog,
  declineRewardRedemption,
  declineTaskCompletion,
} from '../engines/approvals.ts'
import { createServiceId, persistFamily } from './shared.ts'
import type { ServiceResult } from './types.ts'

function resolveApprovalMutation(
  family: Family,
  approvalId: string,
  action: 'approve' | 'decline',
  resolvedAt: string,
): { family: Family; effects: GrantEffect[] } {
  const approval = family.approvals.find((entry) => entry.id === approvalId)
  if (!approval) {
    throw new Error(`approval not found: ${approvalId}`)
  }
  if (approval.status !== 'pending') {
    throw new Error(`approval is not pending: ${approvalId}`)
  }

  switch (approval.type) {
    case 'task_completion':
      return action === 'approve'
        ? approveTaskCompletion(family, approvalId, resolvedAt)
        : declineTaskCompletion(family, approvalId, resolvedAt)
    case 'reading_log':
      return action === 'approve'
        ? approveReadingLog(family, approvalId, {
            logId: createServiceId('log'),
            resolvedAt,
          })
        : declineReadingLog(family, approvalId, resolvedAt)
    case 'reward_redemption':
      return action === 'approve'
        ? approveRewardRedemption(family, approvalId, resolvedAt)
        : declineRewardRedemption(family, approvalId, resolvedAt)
    default:
      throw new Error(`unsupported approval type`)
  }
}

export async function approveApproval(
  approvalId: string,
  repo: DataRepository = localStorageRepository,
  resolvedAt?: string,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const when = resolvedAt ?? new Date().toISOString()

  const result = resolveApprovalMutation(
    snapshot.family,
    approvalId,
    'approve',
    when,
  )

  return persistFamily(repo, snapshot.meta, result.family, result.effects, true)
}

export async function declineApproval(
  approvalId: string,
  repo: DataRepository = localStorageRepository,
  resolvedAt?: string,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const when = resolvedAt ?? new Date().toISOString()

  const result = resolveApprovalMutation(
    snapshot.family,
    approvalId,
    'decline',
    when,
  )

  return persistFamily(repo, snapshot.meta, result.family, result.effects, true)
}
