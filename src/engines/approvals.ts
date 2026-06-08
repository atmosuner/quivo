import type {
  Approval,
  Child,
  Family,
  ReadingLog,
  Task,
} from '../types/domain.ts'
import type { GrantEffect } from '../types/gamification.ts'
import { evaluateAchievementEvent } from './achievements.ts'
import {
  applyGrant,
  escrowCoins,
  finalizeCoinEscrow,
  restoreCoinEscrow,
} from './gamification.ts'
import {
  applyPagesToBook,
  createReadingLog,
  readingRewardsForPages,
  validatePageLog,
} from './reading.ts'
import { updateHabitStreak } from './streak.ts'

export interface FamilyMutationResult {
  family: Family
  effects: GrantEffect[]
}

function replaceChild(family: Family, child: Child): Family {
  return {
    ...family,
    children: family.children.map((entry) =>
      entry.id === child.id ? child : entry,
    ),
  }
}

function replaceTask(family: Family, task: Task): Family {
  return {
    ...family,
    tasks: family.tasks.map((entry) => (entry.id === task.id ? task : entry)),
  }
}

function replaceApproval(family: Family, approval: Approval): Family {
  return {
    ...family,
    approvals: family.approvals.map((entry) =>
      entry.id === approval.id ? approval : entry,
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

function getTask(family: Family, taskId: string): Task {
  const task = family.tasks.find((entry) => entry.id === taskId)
  if (!task) {
    throw new Error(`task not found: ${taskId}`)
  }
  return task
}

function getApproval(family: Family, approvalId: string): Approval {
  const approval = family.approvals.find((entry) => entry.id === approvalId)
  if (!approval) {
    throw new Error(`approval not found: ${approvalId}`)
  }
  if (approval.status !== 'pending') {
    throw new Error(`approval is not pending: ${approvalId}`)
  }
  return approval
}

function resolveApproval(
  approval: Approval,
  status: 'approved' | 'declined',
  resolvedAt: string,
): Approval {
  return {
    ...approval,
    status,
    resolvedAt,
  }
}

function grantToChild(
  family: Family,
  childId: string,
  xp: number,
  coins: number,
  activityDate: string,
): FamilyMutationResult {
  let nextFamily = family
  let effects: GrantEffect[] = []

  const child = getChild(nextFamily, childId)
  const grant = applyGrant(child, { xp, coins })
  let updatedChild = grant.child
  effects = [...grant.effects]

  const streak = updateHabitStreak(updatedChild, activityDate)
  updatedChild = streak.child
  effects = [...effects, ...streak.effects]

  if (grant.effects.some((effect) => effect.type === 'LEVEL_UP')) {
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

/**
 * Child submits a task — approval-required tasks enter pending without grants.
 * Non-approval tasks complete immediately.
 */
export function submitTaskCompletion(
  family: Family,
  taskId: string,
  options: {
    approvalId: string
    completedAt: string
    note?: string | null
  },
): FamilyMutationResult {
  const task = getTask(family, taskId)
  const activityDate = options.completedAt.slice(0, 10)

  if (task.status !== 'open') {
    throw new Error(`task is not open: ${taskId}`)
  }

  if (task.requiresApproval) {
    const approval: Approval = {
      id: options.approvalId,
      type: 'task_completion',
      childId: task.childId,
      status: 'pending',
      createdAt: options.completedAt,
      resolvedAt: null,
      xp: task.xp,
      coins: task.coins,
      taskId: task.id,
      bookId: null,
      rewardId: null,
      pages: null,
      note: options.note ?? null,
    }

    const pendingTask: Task = {
      ...task,
      status: 'pending_approval',
      completedAt: options.completedAt,
    }

    return {
      family: {
        ...replaceTask(family, pendingTask),
        approvals: [...family.approvals, approval],
      },
      effects: [],
    }
  }

  let nextFamily = replaceTask(family, {
    ...task,
    status: 'completed_today',
    completedAt: options.completedAt,
  })

  const grant = grantToChild(nextFamily, task.childId, task.xp, task.coins, activityDate)
  nextFamily = grant.family

  const child = getChild(nextFamily, task.childId)
  nextFamily = replaceChild(nextFamily, {
    ...child,
    tasksCompletedLifetime: child.tasksCompletedLifetime + 1,
  })

  const achievement = evaluateAchievementEvent(nextFamily, {
    type: 'task_completed',
    childId: task.childId,
    category: task.category,
  })

  return {
    family: achievement.family,
    effects: [...grant.effects, ...achievement.effects],
  }
}

export function approveTaskCompletion(
  family: Family,
  approvalId: string,
  resolvedAt: string = new Date().toISOString(),
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'task_completion' || !approval.taskId) {
    throw new Error('approval is not a task completion')
  }

  const task = getTask(family, approval.taskId)
  const activityDate = resolvedAt.slice(0, 10)

  let nextFamily = replaceApproval(
    family,
    resolveApproval(approval, 'approved', resolvedAt),
  )

  nextFamily = replaceTask(nextFamily, {
    ...task,
    status: 'completed_today',
    completedAt: resolvedAt,
  })

  const grant = grantToChild(
    nextFamily,
    approval.childId,
    approval.xp,
    approval.coins,
    activityDate,
  )
  nextFamily = grant.family

  const child = getChild(nextFamily, approval.childId)
  nextFamily = replaceChild(nextFamily, {
    ...child,
    tasksCompletedLifetime: child.tasksCompletedLifetime + 1,
  })

  const achievement = evaluateAchievementEvent(nextFamily, {
    type: 'task_completed',
    childId: approval.childId,
    category: task.category,
  })

  return {
    family: achievement.family,
    effects: [...grant.effects, ...achievement.effects],
  }
}

export function declineTaskCompletion(
  family: Family,
  approvalId: string,
  resolvedAt: string = new Date().toISOString(),
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'task_completion' || !approval.taskId) {
    throw new Error('approval is not a task completion')
  }

  const task = getTask(family, approval.taskId)

  return {
    family: replaceTask(
      replaceApproval(family, resolveApproval(approval, 'declined', resolvedAt)),
      {
        ...task,
        status: 'open',
        completedAt: null,
      },
    ),
    effects: [],
  }
}

/** Request reading log approval — no committed log until approved. */
export function submitReadingLog(
  family: Family,
  bookId: string,
  pages: number,
  options: {
    approvalId: string
    createdAt: string
    note?: string | null
  },
): FamilyMutationResult {
  const book = family.books.find((entry) => entry.id === bookId)
  if (!book) {
    throw new Error(`book not found: ${bookId}`)
  }

  const validation = validatePageLog(book, pages)
  if (!validation.valid) {
    throw new Error(validation.error ?? 'invalid page log')
  }

  const rewards = readingRewardsForPages(validation.cappedPages)

  const approval: Approval = {
    id: options.approvalId,
    type: 'reading_log',
    childId: book.childId,
    status: 'pending',
    createdAt: options.createdAt,
    resolvedAt: null,
    xp: rewards.xp,
    coins: rewards.coins,
    taskId: null,
    bookId: book.id,
    rewardId: null,
    pages: validation.cappedPages,
    note: options.note ?? null,
  }

  return {
    family: {
      ...family,
      approvals: [...family.approvals, approval],
    },
    effects: [],
  }
}

export function approveReadingLog(
  family: Family,
  approvalId: string,
  options: {
    resolvedAt?: string
    logId: string
  },
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'reading_log' || !approval.bookId || !approval.pages) {
    throw new Error('approval is not a reading log')
  }

  const resolvedAt = options.resolvedAt ?? new Date().toISOString()
  const book = family.books.find((entry) => entry.id === approval.bookId)
  if (!book) {
    throw new Error(`book not found: ${approval.bookId}`)
  }

  const updatedBook = applyPagesToBook(book, approval.pages)
  const wasComplete = book.status !== 'done' && updatedBook.status === 'done'

  const log: ReadingLog = createReadingLog({
    id: options.logId,
    childId: approval.childId,
    bookId: approval.bookId,
    pages: approval.pages,
    loggedAt: resolvedAt,
    xpGranted: approval.xp,
    coinsGranted: approval.coins,
  })

  let nextFamily: Family = {
    ...replaceApproval(family, resolveApproval(approval, 'approved', resolvedAt)),
    books: family.books.map((entry) =>
      entry.id === updatedBook.id ? updatedBook : entry,
    ),
    readingLogs: [...family.readingLogs, log],
  }

  const grant = grantToChild(
    nextFamily,
    approval.childId,
    approval.xp,
    approval.coins,
    resolvedAt.slice(0, 10),
  )
  nextFamily = grant.family

  let effects = [...grant.effects]

  const pagesResult = evaluateAchievementEvent(nextFamily, {
    type: 'pages_logged',
    childId: approval.childId,
    pages: approval.pages,
  })
  nextFamily = pagesResult.family
  effects = [...effects, ...pagesResult.effects]

  if (wasComplete) {
    const child = getChild(nextFamily, approval.childId)
    nextFamily = replaceChild(nextFamily, {
      ...child,
      booksReadLifetime: child.booksReadLifetime + 1,
    })

    const bookResult = evaluateAchievementEvent(nextFamily, {
      type: 'book_completed',
      childId: approval.childId,
    })
    nextFamily = bookResult.family
    effects = [...effects, ...bookResult.effects]
  }

  return { family: nextFamily, effects }
}

export function declineReadingLog(
  family: Family,
  approvalId: string,
  resolvedAt: string = new Date().toISOString(),
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'reading_log') {
    throw new Error('approval is not a reading log')
  }

  return {
    family: replaceApproval(
      family,
      resolveApproval(approval, 'declined', resolvedAt),
    ),
    effects: [],
  }
}

export function requestRewardRedemption(
  family: Family,
  childId: string,
  rewardId: string,
  options: {
    approvalId: string
    createdAt: string
    note?: string | null
  },
): FamilyMutationResult {
  const child = getChild(family, childId)
  const reward = family.rewards.find((entry) => entry.id === rewardId)
  if (!reward || !reward.active) {
    throw new Error(`reward not available: ${rewardId}`)
  }
  if (child.coins < reward.cost) {
    throw new Error('insufficient coins for redemption')
  }

  const escrowed = escrowCoins(child, reward.cost)

  const approval: Approval = {
    id: options.approvalId,
    type: 'reward_redemption',
    childId,
    status: 'pending',
    createdAt: options.createdAt,
    resolvedAt: null,
    xp: 0,
    coins: 0,
    taskId: null,
    bookId: null,
    rewardId: reward.id,
    pages: null,
    note: options.note ?? reward.title,
  }

  return {
    family: {
      ...replaceChild(family, escrowed),
      approvals: [...family.approvals, approval],
    },
    effects: [],
  }
}

export function approveRewardRedemption(
  family: Family,
  approvalId: string,
  resolvedAt: string = new Date().toISOString(),
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'reward_redemption' || !approval.rewardId) {
    throw new Error('approval is not a reward redemption')
  }

  const reward = family.rewards.find((entry) => entry.id === approval.rewardId)
  if (!reward) {
    throw new Error(`reward not found: ${approval.rewardId}`)
  }

  const child = getChild(family, approval.childId)
  const finalized = finalizeCoinEscrow(child, reward.cost)

  return {
    family: replaceApproval(
      replaceChild(family, finalized),
      resolveApproval(approval, 'approved', resolvedAt),
    ),
    effects: [],
  }
}

export function declineRewardRedemption(
  family: Family,
  approvalId: string,
  resolvedAt: string = new Date().toISOString(),
): FamilyMutationResult {
  const approval = getApproval(family, approvalId)
  if (approval.type !== 'reward_redemption' || !approval.rewardId) {
    throw new Error('approval is not a reward redemption')
  }

  const reward = family.rewards.find((entry) => entry.id === approval.rewardId)
  if (!reward) {
    throw new Error(`reward not found: ${approval.rewardId}`)
  }

  const child = getChild(family, approval.childId)
  const restored = restoreCoinEscrow(child, reward.cost)

  return {
    family: replaceApproval(
      replaceChild(family, restored),
      resolveApproval(approval, 'declined', resolvedAt),
    ),
    effects: [],
  }
}
