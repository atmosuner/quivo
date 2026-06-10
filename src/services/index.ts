export type { ServiceResult } from './types.ts'
export type { AddBookInput } from './readingService.ts'

export { addTask, submitTaskCompletion } from './taskService.ts'
export type { CreateTaskInput } from './taskService.ts'
export { addBook, submitPageLog } from './readingService.ts'
export { requestRewardRedemption } from './rewardService.ts'
export { approveApproval, declineApproval } from './approvalService.ts'
export {
  getActiveChild,
  getChildById,
  loadFamily,
  resetFamily,
  switchActiveChild,
} from './familyService.ts'
export { runDailyResetIfNeeded } from './dailyResetService.ts'
