import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { submitTaskCompletion as submitTaskCompletionEngine } from '../engines/approvals.ts'
import { createTasks, type CreateTaskInput } from '../engines/tasks.ts'
import { createServiceId, persistFamily } from './shared.ts'
import type { ServiceResult } from './types.ts'

export type { CreateTaskInput } from '../engines/tasks.ts'

export async function submitTaskCompletion(
  taskId: string,
  repo: DataRepository = localStorageRepository,
  options?: { note?: string | null; completedAt?: string },
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const completedAt = options?.completedAt ?? new Date().toISOString()

  const result = submitTaskCompletionEngine(snapshot.family, taskId, {
    approvalId: createServiceId('approval-task'),
    completedAt,
    note: options?.note ?? null,
  })

  return persistFamily(repo, snapshot.meta, result.family, result.effects)
}

export async function addTask(
  input: CreateTaskInput,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const family = createTasks(snapshot.family, input, () =>
    createServiceId('task'),
  )

  return persistFamily(repo, snapshot.meta, family, [])
}
