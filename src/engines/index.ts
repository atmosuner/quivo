export {
  applyGrant,
  calculateLevel,
  escrowCoins,
  finalizeCoinEscrow,
  grantCoins,
  grantXp,
  restoreCoinEscrow,
} from './gamification.ts'
export type { ChildGrantResult } from './gamification.ts'

export {
  approveReadingLog,
  approveRewardRedemption,
  approveTaskCompletion,
  declineReadingLog,
  declineRewardRedemption,
  declineTaskCompletion,
  requestRewardRedemption,
  submitReadingLog,
  submitTaskCompletion,
} from './approvals.ts'
export type { FamilyMutationResult } from './approvals.ts'

export {
  applyPagesToBook,
  computeReadingStreak,
  createReadingLog,
  isBookComplete,
  markBookDoneIfComplete,
  readingRewardsForPages,
  validatePageLog,
} from './reading.ts'
export type { PageLogValidation } from './reading.ts'

export { resetMissedStreaks, updateHabitStreak } from './streak.ts'
export type { StreakUpdateResult } from './streak.ts'

export {
  evaluateAchievementEvent,
  incrementAchievementProgress,
} from './achievements.ts'
export type { AchievementEvent, AchievementUpdateResult } from './achievements.ts'
