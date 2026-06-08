import type {
  Approval,
  Book,
  Child,
  Family,
  Reward,
  Task,
} from '../../types/domain.ts'
import { daysBetween } from '../../lib/utils/dates.ts'
import type { WeekDayData } from '../../components/molecules/WeekChart.tsx'

export function getPendingApprovals(family: Family): Approval[] {
  return family.approvals
    .filter((approval) => approval.status === 'pending')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function countPendingApprovals(family: Family): number {
  return getPendingApprovals(family).length
}

export function countPendingApprovalsForChild(
  family: Family,
  childId: string,
): number {
  return getPendingApprovals(family).filter(
    (approval) => approval.childId === childId,
  ).length
}

export function countTasksDoneToday(tasks: Task[], childId: string): number {
  return tasks.filter(
    (task) =>
      task.childId === childId &&
      task.activeToday &&
      task.status === 'completed_today',
  ).length
}

export function countTasksTodayTotal(tasks: Task[], childId: string): number {
  return tasks.filter(
    (task) => task.childId === childId && task.activeToday,
  ).length
}

export function getChildById(family: Family, childId: string): Child | undefined {
  return family.children.find((child) => child.id === childId)
}

export function getTaskById(family: Family, taskId: string): Task | undefined {
  return family.tasks.find((task) => task.id === taskId)
}

export function getBookById(family: Family, bookId: string): Book | undefined {
  return family.books.find((book) => book.id === bookId)
}

export function getRewardById(
  family: Family,
  rewardId: string,
): Reward | undefined {
  return family.rewards.find((reward) => reward.id === rewardId)
}

export function formatApprovalWhen(createdAt: string): string {
  const date = new Date(createdAt)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getFamilyWeekChartDays(
  children: Child[],
  referenceIso: string,
): WeekDayData[] {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const startDate = children[0]?.weeklyXpStartDate ?? referenceIso
  const todayIndex = Math.min(
    6,
    Math.max(0, daysBetween(startDate, referenceIso)),
  )

  const totals = [0, 0, 0, 0, 0, 0, 0]
  for (const child of children) {
    child.weeklyXp.forEach((xp, index) => {
      totals[index] = (totals[index] ?? 0) + xp
    })
  }

  return totals.map((xp, index) => ({
    label: labels[index] ?? '?',
    xp,
    today: index === todayIndex,
    done: xp > 0,
  }))
}

export interface ApprovalCardView {
  approval: Approval
  childName: string
  childInitial: string
  childAvatar: Child['avatar']
  title: string
  subtitle: string
  note: string | null
  xp: number
  coins: number
  rewardCost: number | null
  categoryKey: string | null
}

export function buildApprovalCardView(
  family: Family,
  approval: Approval,
): ApprovalCardView {
  const child = getChildById(family, approval.childId)
  const childName = child?.name ?? 'Child'
  const childInitial = child?.initial ?? '?'
  const childAvatar = child?.avatar ?? { hue1: 282, hue2: 250 }

  if (approval.type === 'task_completion' && approval.taskId) {
    const task = getTaskById(family, approval.taskId)
    return {
      approval,
      childName,
      childInitial,
      childAvatar,
      title: task?.title ?? 'Task completion',
      subtitle: `${childName} · ${formatApprovalWhen(approval.createdAt)}`,
      note: approval.note,
      xp: approval.xp,
      coins: approval.coins,
      rewardCost: null,
      categoryKey: task?.category ?? null,
    }
  }

  if (approval.type === 'reading_log') {
    const book = approval.bookId
      ? getBookById(family, approval.bookId)
      : undefined
    return {
      approval,
      childName,
      childInitial,
      childAvatar,
      title: book ? `Read ${approval.pages ?? 0} pages` : 'Reading log',
      subtitle: `${childName} · ${book?.title ?? 'Book'} · ${formatApprovalWhen(approval.createdAt)}`,
      note: approval.note,
      xp: approval.xp,
      coins: approval.coins,
      rewardCost: null,
      categoryKey: 'reading',
    }
  }

  const reward = approval.rewardId
    ? getRewardById(family, approval.rewardId)
    : undefined

  return {
    approval,
    childName,
    childInitial,
    childAvatar,
    title: reward?.title ?? approval.note ?? 'Reward redemption',
    subtitle: `${childName} · wants to redeem · ${formatApprovalWhen(approval.createdAt)}`,
    note: approval.note,
    xp: 0,
    coins: 0,
    rewardCost: reward?.cost ?? null,
    categoryKey: null,
  }
}
