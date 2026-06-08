import { ACHIEVEMENT_DEFINITIONS } from '../data/achievements.ts'
import type { AchievementProgress, Family, TaskCategory } from '../types/domain.ts'
import type { GrantEffect } from '../types/gamification.ts'

export type AchievementEvent =
  | { type: 'task_completed'; childId: string; category: TaskCategory }
  | { type: 'pages_logged'; childId: string; pages: number }
  | { type: 'book_completed'; childId: string }
  | { type: 'level_reached'; childId: string; level: number }
  | { type: 'streak_updated'; childId: string; streak: number }

export interface AchievementUpdateResult {
  family: Family
  effects: GrantEffect[]
}

function findDefinition(achievementId: string) {
  return ACHIEVEMENT_DEFINITIONS.find((def) => def.id === achievementId)
}

function findProgress(
  family: Family,
  childId: string,
  achievementId: string,
): AchievementProgress | undefined {
  return family.achievementProgress.find(
    (entry) => entry.childId === childId && entry.achievementId === achievementId,
  )
}

function canIncrement(
  lockedByDefault: boolean | undefined,
  progress: AchievementProgress,
): boolean {
  if (progress.unlockedAt) {
    return false
  }
  if (lockedByDefault && progress.current === 0) {
    return false
  }
  return true
}

function updateProgressEntry(
  family: Family,
  childId: string,
  achievementId: string,
  nextCurrent: number,
  unlockedAt: string,
): { family: Family; unlocked: boolean; title: string } {
  const definition = findDefinition(achievementId)
  if (!definition) {
    return { family, unlocked: false, title: '' }
  }

  const existing = findProgress(family, childId, achievementId)
  const current = existing?.current ?? 0
  const capped = Math.min(Math.max(nextCurrent, current), definition.target)
  const wasUnlocked = Boolean(existing?.unlockedAt)
  const shouldUnlock = capped >= definition.target
  const resolvedUnlockedAt =
    existing?.unlockedAt ?? (shouldUnlock ? unlockedAt : null)

  const updatedEntry: AchievementProgress = {
    achievementId,
    childId,
    current: capped,
    unlockedAt: resolvedUnlockedAt,
  }

  const progress = family.achievementProgress.some(
    (entry) => entry.childId === childId && entry.achievementId === achievementId,
  )
    ? family.achievementProgress.map((entry) =>
        entry.childId === childId && entry.achievementId === achievementId
          ? updatedEntry
          : entry,
      )
    : [...family.achievementProgress, updatedEntry]

  return {
    family: { ...family, achievementProgress: progress },
    unlocked: !wasUnlocked && shouldUnlock,
    title: definition.title,
  }
}

/** Increment progress toward a specific achievement. */
export function incrementAchievementProgress(
  family: Family,
  childId: string,
  achievementId: string,
  delta: number,
  unlockedAt: string = new Date().toISOString(),
): AchievementUpdateResult {
  const definition = findDefinition(achievementId)
  const progress = findProgress(family, childId, achievementId)

  if (!definition || !progress || !canIncrement(definition.lockedByDefault, progress)) {
    return { family, effects: [] }
  }

  const result = updateProgressEntry(
    family,
    childId,
    achievementId,
    progress.current + delta,
    unlockedAt,
  )

  const effects: GrantEffect[] = result.unlocked
    ? [{ type: 'ACHIEVEMENT_UNLOCKED', achievementId, title: result.title }]
    : []

  return { family: result.family, effects }
}

/** Evaluate bundled achievement rules from a domain event. */
export function evaluateAchievementEvent(
  family: Family,
  event: AchievementEvent,
  unlockedAt: string = new Date().toISOString(),
): AchievementUpdateResult {
  let nextFamily = family
  const effects: GrantEffect[] = []

  const applyIncrement = (
    achievementId: string,
    delta: number,
    predicate: boolean,
  ) => {
    if (!predicate) return
    const result = incrementAchievementProgress(
      nextFamily,
      event.childId,
      achievementId,
      delta,
      unlockedAt,
    )
    nextFamily = result.family
    effects.push(...result.effects)
  }

  const applySet = (achievementId: string, value: number, predicate: boolean) => {
    if (!predicate) return
    const progress = findProgress(nextFamily, event.childId, achievementId)
    const definition = findDefinition(achievementId)
    if (!definition || !progress || !canIncrement(definition.lockedByDefault, progress)) {
      return
    }

    const result = updateProgressEntry(
      nextFamily,
      event.childId,
      achievementId,
      Math.max(progress.current, value),
      unlockedAt,
    )
    nextFamily = result.family
    if (result.unlocked) {
      effects.push({
        type: 'ACHIEVEMENT_UNLOCKED',
        achievementId,
        title: result.title,
      })
    }
  }

  switch (event.type) {
    case 'task_completed':
      applyIncrement('a5', 1, true)
      applyIncrement('a2', 1, event.category === 'responsibility')
      applyIncrement('a8', 1, event.category === 'family')
      applyIncrement('a9', 1, event.category === 'learning')
      break
    case 'pages_logged':
      applyIncrement('a4', event.pages, true)
      break
    case 'book_completed':
      applyIncrement('a1', 1, true)
      applyIncrement('a6', 1, true)
      break
    case 'level_reached':
      applySet('a5', event.level, false)
      break
    case 'streak_updated':
      applySet('a3', event.streak, true)
      applySet('a7', event.streak, true)
      break
    default:
      break
  }

  return { family: nextFamily, effects }
}
