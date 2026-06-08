import type {
  Family,
  Task,
  TaskCategory,
  TaskDifficulty,
  TaskRepeat,
} from '../types/domain.ts'

export const CATEGORY_DEFAULT_ICONS: Record<TaskCategory, string> = {
  reading: 'book',
  responsibility: 'home',
  learning: 'pencilSquare',
  health: 'sparkle',
  family: 'heart',
}

export interface CreateTaskInput {
  childIds: string[]
  title: string
  category: TaskCategory
  xp: number
  coins: number
  difficulty: TaskDifficulty
  estimatedMinutes: number
  repeat: TaskRepeat
  requiresApproval: boolean
}

function defaultEstimatedMinutes(difficulty: TaskDifficulty): number {
  if (difficulty === 1) return 5
  if (difficulty === 2) return 15
  return 30
}

export function buildTaskFromInput(
  input: CreateTaskInput,
  childId: string,
  taskId: string,
): Task {
  const estimatedMinutes =
    input.estimatedMinutes > 0
      ? input.estimatedMinutes
      : defaultEstimatedMinutes(input.difficulty)

  return {
    id: taskId,
    childId,
    title: input.title.trim(),
    category: input.category,
    icon: CATEGORY_DEFAULT_ICONS[input.category],
    xp: Math.max(0, input.xp),
    coins: Math.max(0, input.coins),
    difficulty: input.difficulty,
    estimatedMinutes,
    repeat: input.repeat,
    requiresApproval: input.requiresApproval,
    activeToday: input.repeat === 'weekly' ? false : true,
    status: 'open',
    completedAt: null,
  }
}

export function createTasks(
  family: Family,
  input: CreateTaskInput,
  createId: () => string,
): Family {
  if (!input.title.trim()) {
    throw new Error('task title is required')
  }

  if (!input.childIds.length) {
    throw new Error('at least one child is required')
  }

  for (const childId of input.childIds) {
    if (!family.children.some((child) => child.id === childId)) {
      throw new Error(`child not found: ${childId}`)
    }
  }

  const newTasks = input.childIds.map((childId) =>
    buildTaskFromInput(input, childId, createId()),
  )

  return {
    ...family,
    tasks: [...family.tasks, ...newTasks],
  }
}
