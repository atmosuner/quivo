import { describe, expect, it } from 'vitest'
import { resetMissedStreaks, updateHabitStreak } from '../../src/engines/streak.ts'
import { makeChild } from './fixtures.ts'

describe('streak engine', () => {
  it('does not double-increment on same-day activity', () => {
    const child = makeChild({
      habitStreak: 4,
      lastStreakDate: '2026-06-08',
    })

    const result = updateHabitStreak(child, '2026-06-08')
    expect(result.changed).toBe(false)
    expect(result.child.habitStreak).toBe(4)
    expect(result.child.lastStreakDate).toBe('2026-06-08')
  })

  it('increments streak on consecutive-day activity', () => {
    const child = makeChild({
      habitStreak: 4,
      lastStreakDate: '2026-06-07',
    })

    const result = updateHabitStreak(child, '2026-06-08')
    expect(result.changed).toBe(true)
    expect(result.child.habitStreak).toBe(5)
    expect(result.child.lastStreakDate).toBe('2026-06-08')
  })

  it('starts a new streak after a gap', () => {
    const child = makeChild({
      habitStreak: 9,
      lastStreakDate: '2026-06-01',
    })

    const result = updateHabitStreak(child, '2026-06-08')
    expect(result.child.habitStreak).toBe(1)
    expect(result.child.lastStreakDate).toBe('2026-06-08')
  })

  it('resets missed streaks after inactive days', () => {
    const child = makeChild({
      habitStreak: 6,
      lastStreakDate: '2026-06-05',
    })

    const reset = resetMissedStreaks(child, '2026-06-08')
    expect(reset.habitStreak).toBe(0)
    expect(reset.lastStreakDate).toBe('2026-06-05')
  })

  it('keeps streak when last activity was yesterday', () => {
    const child = makeChild({
      habitStreak: 3,
      lastStreakDate: '2026-06-07',
    })

    const reset = resetMissedStreaks(child, '2026-06-08')
    expect(reset.habitStreak).toBe(3)
  })
})
