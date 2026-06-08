import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { requestRewardRedemption as requestRewardRedemptionEngine } from '../engines/approvals.ts'
import { createServiceId, persistFamily } from './shared.ts'
import type { ServiceResult } from './types.ts'

export async function requestRewardRedemption(
  childId: string,
  rewardId: string,
  repo: DataRepository = localStorageRepository,
  options?: { note?: string | null; createdAt?: string },
): Promise<ServiceResult> {
  const snapshot = await repo.load()

  const result = requestRewardRedemptionEngine(snapshot.family, childId, rewardId, {
    approvalId: createServiceId('approval-reward'),
    createdAt: options?.createdAt ?? new Date().toISOString(),
    note: options?.note ?? null,
  })

  return persistFamily(repo, snapshot.meta, result.family, result.effects)
}
