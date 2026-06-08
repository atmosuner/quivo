import { describe, expect, it } from 'vitest'
import {
  evaluateAchievementEvent,
  incrementAchievementProgress,
} from '../../src/engines/achievements.ts'
import { makeAchievementProgress, makeFamily } from './fixtures.ts'

describe('achievement engine', () => {
  it('increments progress toward a target', () => {
    const family = makeFamily({
      achievementProgress: [makeAchievementProgress('a5', { current: 2 })],
    })

    const result = incrementAchievementProgress(family, 'child-test', 'a5', 3)
    const progress = result.family.achievementProgress.find(
      (entry) => entry.achievementId === 'a5',
    )

    expect(progress?.current).toBe(5)
    expect(progress?.unlockedAt).toBeNull()
    expect(result.effects).toHaveLength(0)
  })

  it('unlocks at target and emits an effect', () => {
    const family = makeFamily({
      achievementProgress: [makeAchievementProgress('a3', { current: 6 })],
    })

    const result = incrementAchievementProgress(
      family,
      'child-test',
      'a3',
      1,
      '2026-06-08T12:00:00.000Z',
    )

    const progress = result.family.achievementProgress.find(
      (entry) => entry.achievementId === 'a3',
    )

    expect(progress?.current).toBe(7)
    expect(progress?.unlockedAt).toBe('2026-06-08T12:00:00.000Z')
    expect(result.effects).toEqual([
      {
        type: 'ACHIEVEMENT_UNLOCKED',
        achievementId: 'a3',
        title: 'Week Warrior',
      },
    ])
  })

  it('keeps unlockedAt stable after already unlocked', () => {
    const family = makeFamily({
      achievementProgress: [
        makeAchievementProgress('a3', {
          current: 7,
          unlockedAt: '2026-06-01T08:00:00.000Z',
        }),
      ],
    })

    const result = incrementAchievementProgress(
      family,
      'child-test',
      'a3',
      5,
      '2026-06-08T12:00:00.000Z',
    )

    const progress = result.family.achievementProgress.find(
      (entry) => entry.achievementId === 'a3',
    )

    expect(progress?.current).toBe(7)
    expect(progress?.unlockedAt).toBe('2026-06-01T08:00:00.000Z')
    expect(result.effects).toHaveLength(0)
  })

  it('evaluates task completion events', () => {
    const family = makeFamily({
      achievementProgress: [makeAchievementProgress('a5', { current: 10 })],
    })

    const result = evaluateAchievementEvent(family, {
      type: 'task_completed',
      childId: 'child-test',
      category: 'health',
    })

    const progress = result.family.achievementProgress.find(
      (entry) => entry.achievementId === 'a5',
    )
    expect(progress?.current).toBe(11)
  })

  it('evaluates pages logged events', () => {
    const family = makeFamily({
      achievementProgress: [makeAchievementProgress('a4', { current: 90 })],
    })

    const result = evaluateAchievementEvent(family, {
      type: 'pages_logged',
      childId: 'child-test',
      pages: 15,
    })

    const progress = result.family.achievementProgress.find(
      (entry) => entry.achievementId === 'a4',
    )
    expect(progress?.current).toBe(100)
    expect(progress?.unlockedAt).not.toBeNull()
  })
})
