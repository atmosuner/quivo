import type { Child } from '../types/domain.ts'
import type { GrantEffect } from '../types/gamification.ts'
import { daysBetween, isYesterday } from '../lib/utils/dates.ts'

export interface StreakUpdateResult {
  child: Child
  effects: GrantEffect[]
  changed: boolean
}

/**
 * Record habit activity on a local calendar day (YYYY-MM-DD).
 * Multiple activities on the same day do not double-increment.
 */
export function updateHabitStreak(child: Child, activityDate: string): StreakUpdateResult {
  if (child.lastStreakDate === activityDate) {
    return { child, effects: [], changed: false }
  }

  let habitStreak = 1

  if (child.lastStreakDate && isYesterday(child.lastStreakDate, activityDate)) {
    habitStreak = child.habitStreak + 1
  }

  const updated: Child = {
    ...child,
    habitStreak,
    lastStreakDate: activityDate,
  }

  return {
    child: updated,
    effects: [{ type: 'STREAK_UPDATED', streak: habitStreak }],
    changed: true,
  }
}

/**
 * Reset habit streak when one or more local days were missed.
 * Call on app boot / daily reset with today's date (YYYY-MM-DD).
 */
export function resetMissedStreaks(child: Child, today: string): Child {
  if (!child.lastStreakDate || child.habitStreak === 0) {
    return child
  }

  const gap = daysBetween(child.lastStreakDate, today)
  if (gap <= 1) {
    return child
  }

  return {
    ...child,
    habitStreak: 0,
  }
}
