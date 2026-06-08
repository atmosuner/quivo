import { ACHIEVEMENT_DEFINITIONS } from '../../data/achievements.ts'
import type {
  AchievementProgress,
  Book,
  Child,
  Family,
  ReadingLog,
  Reward,
  Task,
} from '../../types/domain.ts'
import type { AchievementDefinition } from '../../types/gamification.ts'
import { computeReadingStreak } from '../../engines/reading.ts'
import { daysBetween, toIsoDate } from '../../lib/utils/dates.ts'

export function getActiveChild(family: Family): Child | undefined {
  return family.children.find(
    (child) => child.id === family.settings.activeChildId,
  )
}

export function getChildTasks(family: Family, childId: string): Task[] {
  return family.tasks.filter((task) => task.childId === childId)
}

export function getTodayTasks(family: Family, childId: string): Task[] {
  return getChildTasks(family, childId).filter((task) => task.activeToday)
}

export function isTaskComplete(task: Task): boolean {
  return task.status === 'completed_today'
}

export function isTaskPending(task: Task): boolean {
  return task.status === 'pending_approval'
}

export function isTaskActionable(task: Task): boolean {
  return task.status === 'open'
}

export function getLevelTitle(level: number): string {
  if (level >= 12) return 'Habit Master'
  if (level >= 10) return 'Quest Champion'
  if (level >= 7) return 'Habit Builder'
  if (level >= 5) return 'Rising Star'
  if (level >= 3) return 'Goal Getter'
  return 'New Explorer'
}

export function formatGreetingDate(isoDateTime: string): string {
  const date = new Date(isoDateTime)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  return `${weekday} · ${monthDay}`
}

export function getPagesReadThisMonth(
  logs: ReadingLog[],
  childId: string,
  referenceIso: string,
): number {
  const month = referenceIso.slice(0, 7)
  return logs
    .filter(
      (log) =>
        log.childId === childId && log.loggedAt.slice(0, 7) === month,
    )
    .reduce((sum, log) => sum + log.pages, 0)
}

export function getActiveRewards(rewards: Reward[]): Reward[] {
  return rewards.filter((reward) => reward.active)
}

export interface AchievementView {
  definition: AchievementDefinition
  progress: AchievementProgress | undefined
  current: number
  target: number
  unlocked: boolean
  locked: boolean
}

export function getAchievementViews(
  family: Family,
  childId: string,
): AchievementView[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = family.achievementProgress.find(
      (entry) =>
        entry.achievementId === definition.id && entry.childId === childId,
    )
    const current = progress?.current ?? 0
    const unlocked = progress?.unlockedAt != null
    const locked =
      Boolean(definition.lockedByDefault) && !unlocked && current === 0

    return {
      definition,
      progress,
      current,
      target: definition.target,
      unlocked,
      locked,
    }
  })
}

export function getWeekChartDays(
  child: Child,
  referenceIso: string,
): { label: string; xp: number; today: boolean; done: boolean }[] {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const todayIndex = Math.min(
    6,
    Math.max(0, daysBetween(child.weeklyXpStartDate, referenceIso)),
  )

  return child.weeklyXp.map((xp, index) => ({
    label: labels[index] ?? '?',
    xp,
    today: index === todayIndex,
    done: xp > 0,
  }))
}

export function getReadingBooks(family: Family, childId: string): Book[] {
  return family.books.filter((book) => book.childId === childId)
}

export function getBooksReadThisYear(
  books: Book[],
  childId: string,
  referenceIso: string,
): number {
  const year = referenceIso.slice(0, 4)
  return books.filter(
    (book) =>
      book.childId === childId &&
      book.status === 'done' &&
      book.finishedAt?.slice(0, 4) === year,
  ).length
}

export function getReadingStreak(
  logs: ReadingLog[],
  childId: string,
  referenceIso: string,
): number {
  return computeReadingStreak(logs, referenceIso, childId)
}

export function getTaskById(family: Family, taskId: string): Task | undefined {
  return family.tasks.find((task) => task.id === taskId)
}

export function getRewardById(
  family: Family,
  rewardId: string,
): Reward | undefined {
  return family.rewards.find((reward) => reward.id === rewardId)
}

export function getBookById(family: Family, bookId: string): Book | undefined {
  return family.books.find((book) => book.id === bookId)
}

export function getAchievementView(
  family: Family,
  childId: string,
  achievementId: string,
): AchievementView | undefined {
  return getAchievementViews(family, childId).find(
    (view) => view.definition.id === achievementId,
  )
}

export function formatRepeat(repeat: Task['repeat']): string {
  if (repeat === 'once') return 'Once'
  if (repeat === 'weekly') return 'Every week'
  return 'Every day'
}

export function formatDifficulty(difficulty: Task['difficulty']): string {
  if (difficulty === 1) return 'Easy'
  if (difficulty === 3) return 'Hard'
  return 'Medium'
}

export function getReferenceDate(snapshot: { meta: { lastModified: string } }): string {
  return toIsoDate(snapshot.meta.lastModified)
}
