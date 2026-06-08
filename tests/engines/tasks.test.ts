import { describe, expect, it } from 'vitest'
import { createSeedSnapshot } from '../../src/data/seed.ts'
import { createTasks } from '../../src/engines/tasks.ts'

describe('createTasks', () => {
  it('creates open tasks for one or more children', () => {
    const family = createSeedSnapshot().family
    let id = 0

    const next = createTasks(
      family,
      {
        childIds: ['child-mia', 'child-leo'],
        title: 'Water plants',
        category: 'family',
        xp: 8,
        coins: 4,
        difficulty: 1,
        estimatedMinutes: 5,
        repeat: 'daily',
        requiresApproval: false,
      },
      () => `task-new-${++id}`,
    )

    expect(next.tasks).toHaveLength(family.tasks.length + 2)
    const created = next.tasks.slice(-2)
    expect(created.every((task) => task.status === 'open')).toBe(true)
    expect(created.every((task) => task.activeToday)).toBe(true)
    expect(created.map((task) => task.childId)).toEqual([
      'child-mia',
      'child-leo',
    ])
  })

  it('sets weekly tasks inactive today on create', () => {
    const family = createSeedSnapshot().family

    const next = createTasks(
      family,
      {
        childIds: ['child-mia'],
        title: 'Weekly chore',
        category: 'responsibility',
        xp: 10,
        coins: 5,
        difficulty: 2,
        estimatedMinutes: 15,
        repeat: 'weekly',
        requiresApproval: true,
      },
      () => 'task-weekly-1',
    )

    const created = next.tasks.at(-1)
    expect(created?.repeat).toBe('weekly')
    expect(created?.activeToday).toBe(false)
  })
})
