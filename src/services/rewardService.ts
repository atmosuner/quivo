import type { Reward } from '../types/domain.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { requestRewardRedemption as requestRewardRedemptionEngine } from '../engines/approvals.ts'
import { createServiceId, persistFamily } from './shared.ts'
import type { ServiceResult } from './types.ts'

export interface CreateRewardInput {
  title: string
  description: string
  cost: number
  coverTone: number
}

export async function createReward(
  input: CreateRewardInput,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()

  const reward: Reward = {
    id: createServiceId('reward'),
    title: input.title.trim(),
    description: input.description.trim(),
    cost: input.cost,
    coverTone: input.coverTone,
    active: true,
  }

  return persistFamily(repo, snapshot.meta, {
    ...snapshot.family,
    rewards: [...snapshot.family.rewards, reward],
  })
}

export async function toggleReward(
  rewardId: string,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()

  return persistFamily(repo, snapshot.meta, {
    ...snapshot.family,
    rewards: snapshot.family.rewards.map((r) =>
      r.id === rewardId ? { ...r, active: !r.active } : r,
    ),
  })
}

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
