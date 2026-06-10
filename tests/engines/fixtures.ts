import type {
  AchievementProgress,
  Book,
  Child,
  Family,
  FamilySettings,
  Reward,
  Task,
} from '../../src/types/domain.ts'

export const CHILD_ID = 'child-test'
export const TASK_ID = 'task-test'
export const BOOK_ID = 'book-test'
export const REWARD_ID = 'reward-test'

export function makeChild(overrides: Partial<Child> = {}): Child {
  return {
    id: CHILD_ID,
    name: 'Test Child',
    initial: 'T',
    avatar: { hue1: 280, hue2: 250 },
    totalXp: 0,
    level: 1,
    xpInLevel: 0,
    coins: 100,
    coinsPending: 0,
    habitStreak: 0,
    lastStreakDate: null,
    tasksCompletedLifetime: 0,
    booksReadLifetime: 0,
    weeklyXp: [0, 0, 0, 0, 0, 0, 0],
    weeklyXpStartDate: '2026-06-02',
    ...overrides,
  }
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: TASK_ID,
    childId: CHILD_ID,
    title: 'Test task',
    category: 'health',
    icon: 'check',
    xp: 10,
    coins: 5,
    difficulty: 1,
    estimatedMinutes: 5,
    repeat: 'daily',
    requiresApproval: false,
    activeToday: true,
    status: 'open',
    completedAt: null,
    ...overrides,
  }
}

export function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: BOOK_ID,
    childId: CHILD_ID,
    title: 'Test Book',
    author: 'Author',
    totalPages: 100,
    pagesRead: 0,
    status: 'reading',
    coverTone: 250,
    startedAt: '2026-06-01T10:00:00.000Z',
    finishedAt: null,
    ...overrides,
  }
}

export function makeReward(overrides: Partial<Reward> = {}): Reward {
  return {
    id: REWARD_ID,
    title: 'Test reward',
    description: 'A test reward',
    cost: 40,
    coverTone: 78,
    active: true,
    ...overrides,
  }
}

export function makeAchievementProgress(
  achievementId: string,
  overrides: Partial<AchievementProgress> = {},
): AchievementProgress {
  return {
    achievementId,
    childId: CHILD_ID,
    current: 0,
    unlockedAt: null,
    ...overrides,
  }
}

export function makeFamily(overrides: Partial<Family> = {}): Family {
  const settings: FamilySettings = {
    requireApprovalDefault: true,
    activeChildId: CHILD_ID,
    ...overrides.settings,
  }

  return {
    id: 'family-test',
    name: 'Test Family',
    settings,
    children: [makeChild()],
    tasks: [makeTask()],
    books: [makeBook()],
    readingLogs: [],
    rewards: [makeReward()],
    approvals: [],
    achievementProgress: [
      makeAchievementProgress('a5'),
      makeAchievementProgress('a4'),
      makeAchievementProgress('a1'),
      makeAchievementProgress('a3'),
    ],
    ...overrides,
  }
}
