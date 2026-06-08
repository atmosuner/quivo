import { describe, expect, it } from 'vitest'
import { createSeedSnapshot } from '../../src/data/seed.ts'
import { approveApproval, declineApproval } from '../../src/services/approvalService.ts'
import { runDailyResetIfNeeded } from '../../src/services/dailyResetService.ts'
import { submitPageLog } from '../../src/services/readingService.ts'
import { requestRewardRedemption } from '../../src/services/rewardService.ts'
import { setParentPin } from '../../src/services/familyService.ts'
import { addTask, submitTaskCompletion } from '../../src/services/taskService.ts'
import { MemoryRepository } from './memoryRepository.ts'

function makeRepo(): MemoryRepository {
  const repo = new MemoryRepository()
  const snapshot = createSeedSnapshot()

  repo.seed({
    ...snapshot,
    family: {
      ...snapshot.family,
      settings: {
        ...snapshot.family.settings,
        requireApprovalDefault: true,
      },
      children: snapshot.family.children.map((child) =>
        child.id === 'child-mia'
          ? { ...child, totalXp: 100, coins: 100, coinsPending: 0, level: 1, xpInLevel: 100 }
          : child,
      ),
      tasks: [
        {
          id: 'task-approval',
          childId: 'child-mia',
          title: 'Approval task',
          category: 'learning',
          icon: 'star',
          xp: 20,
          coins: 10,
          difficulty: 2,
          estimatedMinutes: 20,
          repeat: 'daily',
          requiresApproval: true,
          activeToday: true,
          status: 'open',
          completedAt: null,
        },
        {
          id: 'task-daily-done',
          childId: 'child-mia',
          title: 'Daily done yesterday',
          category: 'health',
          icon: 'sparkle',
          xp: 5,
          coins: 2,
          difficulty: 1,
          estimatedMinutes: 3,
          repeat: 'daily',
          requiresApproval: false,
          activeToday: true,
          status: 'completed_today',
          completedAt: '2026-06-07T08:00:00.000Z',
        },
      ],
      books: [
        {
          id: 'book-reading',
          childId: 'child-mia',
          title: 'Test Book',
          author: 'Author',
          totalPages: 100,
          pagesRead: 10,
          status: 'reading',
          coverTone: 250,
          startedAt: '2026-06-01T10:00:00.000Z',
          finishedAt: null,
        },
      ],
      approvals: [],
      readingLogs: [],
      rewards: snapshot.family.rewards,
      achievementProgress: snapshot.family.achievementProgress,
    },
  })

  return repo
}

describe('application services', () => {
  it('persists pending approval-required task without XP grant', async () => {
    const repo = makeRepo()

    const result = await submitTaskCompletion('task-approval', repo, {
      completedAt: '2026-06-08T10:00:00.000Z',
    })

    const child = result.snapshot.family.children.find((entry) => entry.id === 'child-mia')!
    expect(child.totalXp).toBe(100)
    expect(child.coins).toBe(100)
    expect(result.effects).toHaveLength(0)
    expect(result.snapshot.family.tasks[0].status).toBe('pending_approval')
    expect(result.snapshot.family.approvals).toHaveLength(1)

    const reloaded = await repo.load()
    expect(reloaded.family.approvals[0].status).toBe('pending')
  })

  it('approves task, grants XP/coins, and saves snapshot', async () => {
    const repo = makeRepo()

    const submitted = await submitTaskCompletion('task-approval', repo, {
      completedAt: '2026-06-08T10:00:00.000Z',
    })
    const approvalId = submitted.snapshot.family.approvals[0].id

    const approved = await approveApproval(approvalId, repo, '2026-06-08T11:00:00.000Z')
    const child = approved.snapshot.family.children.find((entry) => entry.id === 'child-mia')!

    expect(child.totalXp).toBe(120)
    expect(child.coins).toBe(110)
    expect(approved.effects.some((effect) => effect.type === 'XP_GRANTED')).toBe(true)
    expect(approved.snapshot.family.tasks[0].status).toBe('completed_today')

    const reloaded = await repo.load()
    expect(reloaded.family.approvals[0].status).toBe('approved')
  })

  it('moves coins to coinsPending on reward request', async () => {
    const repo = makeRepo()

    const result = await requestRewardRedemption('child-mia', 'reward-r1', repo, {
      createdAt: '2026-06-08T10:00:00.000Z',
    })

    const child = result.snapshot.family.children.find((entry) => entry.id === 'child-mia')!
    expect(child.coins).toBe(40)
    expect(child.coinsPending).toBe(60)
    expect(child.totalXp).toBe(100)
  })

  it('restores coins when reward redemption is declined', async () => {
    const repo = makeRepo()

    const requested = await requestRewardRedemption('child-mia', 'reward-r1', repo, {
      createdAt: '2026-06-08T10:00:00.000Z',
    })
    const approvalId = requested.snapshot.family.approvals[0].id

    const declined = await declineApproval(approvalId, repo, '2026-06-08T12:00:00.000Z')
    const child = declined.snapshot.family.children.find((entry) => entry.id === 'child-mia')!

    expect(child.coins).toBe(100)
    expect(child.coinsPending).toBe(0)
  })

  it('approves reading log, updates book, and creates ReadingLog', async () => {
    const repo = makeRepo()

    const submitted = await submitPageLog('book-reading', 25, repo, {
      createdAt: '2026-06-08T09:00:00.000Z',
    })

    expect(submitted.snapshot.family.readingLogs).toHaveLength(0)
    expect(submitted.snapshot.family.books[0].pagesRead).toBe(10)

    const approvalId = submitted.snapshot.family.approvals[0].id
    const approved = await approveApproval(approvalId, repo, '2026-06-08T11:00:00.000Z')

    expect(approved.snapshot.family.readingLogs).toHaveLength(1)
    expect(approved.snapshot.family.books[0].pagesRead).toBe(35)
  })

  it('stores a hashed parent PIN in family settings', async () => {
    const repo = makeRepo()
    const result = await setParentPin('2468', repo)

    expect(result.snapshot.family.settings.parentPinHash).toHaveLength(64)
    expect(result.snapshot.family.settings.parentPinSalt).toBeTruthy()
  })

  it('creates and persists a new open task', async () => {
    const repo = makeRepo()
    const before = (await repo.load()).family.tasks.length

    const result = await addTask(
      {
        childIds: ['child-mia'],
        title: 'Practice piano',
        category: 'learning',
        xp: 20,
        coins: 10,
        difficulty: 2,
        estimatedMinutes: 20,
        repeat: 'daily',
        requiresApproval: true,
      },
      repo,
    )

    expect(result.snapshot.family.tasks).toHaveLength(before + 1)
    const created = result.snapshot.family.tasks.at(-1)
    expect(created?.title).toBe('Practice piano')
    expect(created?.status).toBe('open')
    expect(created?.activeToday).toBe(true)

    const reloaded = await repo.load()
    expect(reloaded.family.tasks.at(-1)?.id).toBe(created?.id)
  })

  it('reopens completed daily tasks on daily reset', async () => {
    const repo = makeRepo()

    const result = await runDailyResetIfNeeded(repo, '2026-06-08')
    const dailyTask = result.snapshot.family.tasks.find(
      (task) => task.id === 'task-daily-done',
    )!

    expect(dailyTask.status).toBe('open')
    expect(dailyTask.completedAt).toBeNull()

    const reloaded = await repo.load()
    expect(
      reloaded.family.tasks.find((task) => task.id === 'task-daily-done')!.status,
    ).toBe('open')
  })
})
