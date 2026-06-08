import { describe, expect, it } from 'vitest'
import {
  approveReadingLog,
  approveRewardRedemption,
  approveTaskCompletion,
  declineReadingLog,
  declineRewardRedemption,
  declineTaskCompletion,
  requestRewardRedemption,
  submitReadingLog,
  submitTaskCompletion,
} from '../../src/engines/approvals.ts'
import { CHILD_ID, makeFamily, makeTask, REWARD_ID, TASK_ID } from './fixtures.ts'

describe('approval engine', () => {
  it('does not grant XP/coins for approval-required tasks until approved', () => {
    const family = makeFamily({
      children: [
        {
          ...makeFamily().children[0],
          totalXp: 100,
          coins: 50,
        },
      ],
      tasks: [
        makeTask({
          id: TASK_ID,
          requiresApproval: true,
          xp: 20,
          coins: 10,
        }),
      ],
    })

    const submitted = submitTaskCompletion(family, TASK_ID, {
      approvalId: 'approval-task-1',
      completedAt: '2026-06-08T10:00:00.000Z',
    })

    const child = submitted.family.children[0]
    expect(child.totalXp).toBe(100)
    expect(child.coins).toBe(50)
    expect(submitted.effects).toHaveLength(0)

    const task = submitted.family.tasks[0]
    expect(task.status).toBe('pending_approval')
  })

  it('approves task completion and grants XP/coins', () => {
    const base = makeFamily({
      tasks: [
        makeTask({
          id: TASK_ID,
          requiresApproval: true,
          xp: 20,
          coins: 10,
        }),
      ],
    })

    const submitted = submitTaskCompletion(base, TASK_ID, {
      approvalId: 'approval-task-1',
      completedAt: '2026-06-08T10:00:00.000Z',
    })

    const approved = approveTaskCompletion(
      submitted.family,
      'approval-task-1',
      '2026-06-08T11:00:00.000Z',
    )

    const child = approved.family.children[0]
    expect(child.totalXp).toBe(20)
    expect(child.coins).toBe(110)
    expect(approved.family.tasks[0].status).toBe('completed_today')
    expect(approved.family.approvals[0].status).toBe('approved')
  })

  it('declines task completion and reopens task without grants', () => {
    const base = makeFamily({
      tasks: [makeTask({ id: TASK_ID, requiresApproval: true })],
    })

    const submitted = submitTaskCompletion(base, TASK_ID, {
      approvalId: 'approval-task-2',
      completedAt: '2026-06-08T10:00:00.000Z',
    })

    const declined = declineTaskCompletion(
      submitted.family,
      'approval-task-2',
      '2026-06-08T12:00:00.000Z',
    )

    const child = declined.family.children[0]
    expect(child.totalXp).toBe(0)
    expect(child.coins).toBe(100)
    expect(declined.family.tasks[0].status).toBe('open')
    expect(declined.family.tasks[0].completedAt).toBeNull()
    expect(declined.family.approvals[0].status).toBe('declined')
  })

  it('moves coins to escrow on reward request', () => {
    const family = makeFamily()
    const requested = requestRewardRedemption(family, CHILD_ID, REWARD_ID, {
      approvalId: 'approval-reward-1',
      createdAt: '2026-06-08T10:00:00.000Z',
    })

    const child = requested.family.children[0]
    expect(child.coins).toBe(60)
    expect(child.coinsPending).toBe(40)
    expect(child.totalXp).toBe(0)
  })

  it('finalizes escrow on reward approval without changing XP', () => {
    const family = makeFamily({
      children: [
        {
          ...makeFamily().children[0],
          totalXp: 300,
          level: 1,
          xpInLevel: 300,
          coins: 60,
          coinsPending: 40,
        },
      ],
      approvals: [
        {
          id: 'approval-reward-2',
          type: 'reward_redemption',
          childId: CHILD_ID,
          status: 'pending',
          createdAt: '2026-06-08T10:00:00.000Z',
          resolvedAt: null,
          xp: 0,
          coins: 0,
          taskId: null,
          bookId: null,
          rewardId: REWARD_ID,
          pages: null,
          note: 'Test reward',
        },
      ],
    })

    const approved = approveRewardRedemption(
      family,
      'approval-reward-2',
      '2026-06-08T11:00:00.000Z',
    )

    const child = approved.family.children[0]
    expect(child.coins).toBe(60)
    expect(child.coinsPending).toBe(0)
    expect(child.totalXp).toBe(300)
    expect(child.level).toBe(1)
  })

  it('restores coins on reward decline', () => {
    const family = makeFamily({
      children: [
        {
          ...makeFamily().children[0],
          coins: 60,
          coinsPending: 40,
        },
      ],
      approvals: [
        {
          id: 'approval-reward-3',
          type: 'reward_redemption',
          childId: CHILD_ID,
          status: 'pending',
          createdAt: '2026-06-08T10:00:00.000Z',
          resolvedAt: null,
          xp: 0,
          coins: 0,
          taskId: null,
          bookId: null,
          rewardId: REWARD_ID,
          pages: null,
          note: null,
        },
      ],
    })

    const declined = declineRewardRedemption(
      family,
      'approval-reward-3',
      '2026-06-08T12:00:00.000Z',
    )

    const child = declined.family.children[0]
    expect(child.coins).toBe(100)
    expect(child.coinsPending).toBe(0)
  })

  it('creates reading log only on approve', () => {
    const family = makeFamily({
      books: [
        {
          ...makeFamily().books[0],
          pagesRead: 10,
          totalPages: 100,
        },
      ],
    })

    const submitted = submitReadingLog(family, 'book-test', 25, {
      approvalId: 'approval-reading-1',
      createdAt: '2026-06-08T09:00:00.000Z',
    })

    expect(submitted.family.readingLogs).toHaveLength(0)

    const declined = declineReadingLog(
      submitted.family,
      'approval-reading-1',
      '2026-06-08T10:00:00.000Z',
    )
    expect(declined.family.readingLogs).toHaveLength(0)

    const approved = approveReadingLog(submitted.family, 'approval-reading-1', {
      logId: 'log-1',
      resolvedAt: '2026-06-08T11:00:00.000Z',
    })

    expect(approved.family.readingLogs).toHaveLength(1)
    expect(approved.family.readingLogs[0].pages).toBe(25)
    expect(approved.family.books[0].pagesRead).toBe(35)
  })
})
