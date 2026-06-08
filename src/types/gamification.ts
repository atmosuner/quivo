import type { TaskCategory } from './domain.ts'

/** Flat XP required per level in MVP (matches design prototype). */
export const XP_PER_LEVEL = 500

/** Maximum resolved approvals kept before pruning oldest entries. */
export const MAX_RESOLVED_APPROVALS = 100

export type AchievementTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

/**
 * Bundled achievement definition — not stored in AppSnapshot.
 * Progress is tracked per child in AchievementProgress.
 */
export interface AchievementDefinition {
  id: string
  title: string
  description: string
  icon: string
  tier: AchievementTier
  tone: number
  target: number
  /** Optional category filter for task-count style achievements. */
  category?: TaskCategory
  /** Starts locked until prerequisites are met (e.g. Scholar). */
  lockedByDefault?: boolean
}

/** XP/coin grant emitted by engines — never persisted as an event log in MVP. */
export interface GrantAmounts {
  xp: number
  coins: number
}

/** Derived level state from total XP. */
export interface LevelState {
  level: number
  xpInLevel: number
  xpToLevel: number
}

/** Level-up detected during a grant operation. */
export interface LevelUpResult {
  leveledUp: boolean
  previousLevel: number
  newLevel: number
}

/**
 * Effects returned by gamification engines for UI (e.g. celebration overlay).
 * Ephemeral — not written to storage.
 */
export type GrantEffect =
  | { type: 'XP_GRANTED'; amount: number }
  | { type: 'COINS_GRANTED'; amount: number }
  | { type: 'LEVEL_UP'; newLevel: number }
  | { type: 'STREAK_UPDATED'; streak: number }
  | { type: 'ACHIEVEMENT_UNLOCKED'; achievementId: string; title: string }

export interface EngineResult<T> {
  state: T
  effects: GrantEffect[]
}
