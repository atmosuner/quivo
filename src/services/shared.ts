import type { Approval, Child, Family } from '../types/domain.ts'
import type { AppSnapshot, AppSnapshotMeta } from '../types/storage.ts'
import type { GrantEffect } from '../types/gamification.ts'
import { CURRENT_SCHEMA_VERSION } from '../types/storage.ts'
import { MAX_RESOLVED_APPROVALS } from '../types/gamification.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { applyGrant } from '../engines/gamification.ts'
import { evaluateAchievementEvent } from '../engines/achievements.ts'
import { updateHabitStreak } from '../engines/streak.ts'
import type { ServiceResult } from './types.ts'

export function createServiceId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function buildSnapshot(
  family: Family,
  meta: AppSnapshotMeta,
): AppSnapshot {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    family,
    meta: {
      ...meta,
      lastModified: new Date().toISOString(),
    },
  }
}

/** Keep all pending approvals; cap resolved history. */
export function pruneResolvedApprovals(family: Family): Family {
  const pending = family.approvals.filter((entry) => entry.status === 'pending')
  const resolved = family.approvals.filter((entry) => entry.status !== 'pending')

  const sortedResolved = [...resolved].sort((left, right) => {
    const leftTime = left.resolvedAt ?? left.createdAt
    const rightTime = right.resolvedAt ?? right.createdAt
    return rightTime.localeCompare(leftTime)
  })

  const keptResolved = sortedResolved.slice(0, MAX_RESOLVED_APPROVALS)
  return { ...family, approvals: [...pending, ...keptResolved] }
}

function replaceChild(family: Family, child: Child): Family {
  return {
    ...family,
    children: family.children.map((entry) =>
      entry.id === child.id ? child : entry,
    ),
  }
}

function getChild(family: Family, childId: string): Child {
  const child = family.children.find((entry) => entry.id === childId)
  if (!child) {
    throw new Error(`child not found: ${childId}`)
  }
  return child
}

/** Grant XP/coins, update streak, and evaluate related achievements. */
export function applyChildGrant(
  family: Family,
  childId: string,
  xp: number,
  coins: number,
  activityDate: string,
): { family: Family; effects: GrantEffect[] } {
  let nextFamily = family
  let effects: GrantEffect[] = []

  const child = getChild(nextFamily, childId)
  const grant = applyGrant(child, { xp, coins })
  let updatedChild = grant.child
  effects = [...grant.effects]

  const streak = updateHabitStreak(updatedChild, activityDate)
  updatedChild = streak.child
  effects = [...effects, ...streak.effects]

  const levelEffect = grant.effects.find((effect) => effect.type === 'LEVEL_UP')
  if (levelEffect && levelEffect.type === 'LEVEL_UP') {
    const levelResult = evaluateAchievementEvent(nextFamily, {
      type: 'level_reached',
      childId,
      level: levelEffect.newLevel,
    })
    nextFamily = levelResult.family
    effects = [...effects, ...levelResult.effects]
  }

  if (streak.changed) {
    const streakResult = evaluateAchievementEvent(nextFamily, {
      type: 'streak_updated',
      childId,
      streak: updatedChild.habitStreak,
    })
    nextFamily = streakResult.family
    effects = [...effects, ...streakResult.effects]
  }

  nextFamily = replaceChild(nextFamily, updatedChild)
  return { family: nextFamily, effects }
}

export async function persistFamily(
  repo: DataRepository,
  meta: AppSnapshotMeta,
  family: Family,
  effects: GrantEffect[] = [],
  prune = false,
): Promise<ServiceResult> {
  const nextFamily = prune ? pruneResolvedApprovals(family) : family
  const snapshot = buildSnapshot(nextFamily, meta)
  await repo.save(snapshot)
  return { snapshot, effects }
}

export function requiresReadingApproval(family: Family): boolean {
  return family.settings.requireApprovalDefault
}

export function sortApprovalsForPrune(approvals: Approval[]): Approval[] {
  const pending = approvals.filter((entry) => entry.status === 'pending')
  const resolved = approvals.filter((entry) => entry.status !== 'pending')
  const sortedResolved = [...resolved].sort((left, right) => {
    const leftTime = left.resolvedAt ?? left.createdAt
    const rightTime = right.resolvedAt ?? right.createdAt
    return rightTime.localeCompare(leftTime)
  })
  return [...pending, ...sortedResolved.slice(0, MAX_RESOLVED_APPROVALS)]
}
