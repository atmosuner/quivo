import type { TaskCategory } from '../types/domain.ts'

export interface TaskCategoryMeta {
  key: TaskCategory
  label: string
  toneVar: string
  tintVar: string
}

export const TASK_CATEGORIES: Record<TaskCategory, TaskCategoryMeta> = {
  reading: {
    key: 'reading',
    label: 'Reading',
    toneVar: '--cat-reading',
    tintVar: '--cat-reading-tint',
  },
  responsibility: {
    key: 'responsibility',
    label: 'Responsibility',
    toneVar: '--cat-responsibility',
    tintVar: '--cat-responsibility-tint',
  },
  learning: {
    key: 'learning',
    label: 'Learning',
    toneVar: '--cat-learning',
    tintVar: '--cat-learning-tint',
  },
  health: {
    key: 'health',
    label: 'Health',
    toneVar: '--cat-health',
    tintVar: '--cat-health-tint',
  },
  family: {
    key: 'family',
    label: 'Family',
    toneVar: '--cat-family',
    tintVar: '--cat-family-tint',
  },
}
