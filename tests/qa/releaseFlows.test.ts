import { describe, expect, it } from 'vitest'
import { createSeedSnapshot } from '../../src/data/seed.ts'
import { approveApproval } from '../../src/services/approvalService.ts'
import { submitPageLog } from '../../src/services/readingService.ts'
import { requestRewardRedemption } from '../../src/services/rewardService.ts'
import { submitTaskCompletion } from '../../src/services/taskService.ts'
import { MemoryRepository } from '../services/memoryRepository.ts'

/** Automated smoke coverage for MVP demo-critical flows (Step 14 QA). */
describe('release candidate flows', () => {
  it('approval-required task → parent approve → completed', async () => {
    const repo = new MemoryRepository()
    const seed = createSeedSnapshot()
    const taskId = 'task-qa-approval'

    repo.seed({
      ...seed,
      family: {
        ...seed.family,
        settings: { ...seed.family.settings, requireApprovalDefault: true },
        tasks: [
          {
            id: taskId,
            childId: 'child-mia',
            title: 'QA task',
            category: 'health',
            icon: 'check',
            xp: 15,
            coins: 5,
            difficulty: 1,
            estimatedMinutes: 5,
            repeat: 'daily',
            requiresApproval: true,
            activeToday: true,
            status: 'open',
            completedAt: null,
          },
        ],
        approvals: [],
      },
    })

    const submitted = await submitTaskCompletion(taskId, repo)
    expect(submitted.snapshot.family.tasks[0].status).toBe('pending_approval')
    expect(submitted.effects).toHaveLength(0)

    const approved = await approveApproval(
      submitted.snapshot.family.approvals[0].id,
      repo,
    )
    expect(approved.snapshot.family.tasks[0].status).toBe('completed_today')
    expect(approved.effects.length).toBeGreaterThan(0)
  })

  it('reading log pending → approve → pages update', async () => {
    const repo = new MemoryRepository()
    const seed = createSeedSnapshot()

    repo.seed({
      ...seed,
      family: {
        ...seed.family,
        settings: { ...seed.family.settings, requireApprovalDefault: true },
        books: [
          {
            id: 'book-qa',
            childId: 'child-mia',
            title: 'QA Book',
            author: 'Tester',
            totalPages: 50,
            pagesRead: 0,
            status: 'reading',
            coverTone: 250,
            startedAt: '2026-06-01T10:00:00.000Z',
            finishedAt: null,
          },
        ],
        approvals: [],
        readingLogs: [],
      },
    })

    const logged = await submitPageLog('book-qa', 10, repo)
    expect(logged.snapshot.family.books[0].pagesRead).toBe(0)
    expect(logged.snapshot.family.approvals).toHaveLength(1)

    const approved = await approveApproval(
      logged.snapshot.family.approvals[0].id,
      repo,
    )
    expect(approved.snapshot.family.books[0].pagesRead).toBe(10)
    expect(approved.snapshot.family.readingLogs).toHaveLength(1)
  })

  it('reward redemption moves coins to escrow', async () => {
    const repo = new MemoryRepository()
    const seed = createSeedSnapshot()
    const child = seed.family.children.find((entry) => entry.id === 'child-mia')!

    repo.seed({
      ...seed,
      family: {
        ...seed.family,
        children: [{ ...child, coins: 100, coinsPending: 0 }],
      },
    })

    const result = await requestRewardRedemption('child-mia', 'reward-r1', repo)
    const updated = result.snapshot.family.children.find(
      (entry) => entry.id === 'child-mia',
    )!

    expect(updated.coins).toBe(40)
    expect(updated.coinsPending).toBe(60)
  })
})
