import type { Family, Task } from '../types/domain.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { formatIsoDate, toIsoDate } from '../lib/utils/dates.ts'
import { resetMissedStreaks } from '../engines/streak.ts'
import { buildSnapshot } from './shared.ts'
import type { ServiceResult } from './types.ts'

/**
 * MVP daily reset rules:
 * - `repeat: 'daily'` tasks with `completed_today` from a prior local date → `open`
 * - `repeat: 'weekly'` and `repeat: 'once'` tasks are unchanged
 * - habit streaks reset via streak engine when days were missed
 */
function resetDailyTasks(family: Family, today: string): { family: Family; changed: boolean } {
  let changed = false

  const tasks: Task[] = family.tasks.map((task) => {
    if (task.repeat !== 'daily' || task.status !== 'completed_today') {
      return task
    }
    if (!task.completedAt || toIsoDate(task.completedAt) >= today) {
      return task
    }

    changed = true
    return {
      ...task,
      status: 'open',
      completedAt: null,
    }
  })

  return {
    family: { ...family, tasks },
    changed,
  }
}

function resetChildrenStreaks(family: Family, today: string): { family: Family; changed: boolean } {
  let changed = false

  const children = family.children.map((child) => {
    const updated = resetMissedStreaks(child, today)
    if (updated.habitStreak !== child.habitStreak) {
      changed = true
    }
    return updated
  })

  return {
    family: { ...family, children },
    changed,
  }
}

export async function runDailyResetIfNeeded(
  repo: DataRepository = localStorageRepository,
  today: string = formatIsoDate(new Date()),
): Promise<ServiceResult> {
  const snapshot = await repo.load()

  const taskReset = resetDailyTasks(snapshot.family, today)
  const streakReset = resetChildrenStreaks(taskReset.family, today)

  if (!taskReset.changed && !streakReset.changed) {
    return { snapshot, effects: [] }
  }

  const updated = buildSnapshot(streakReset.family, snapshot.meta)
  await repo.save(updated)
  return { snapshot: updated, effects: [] }
}
