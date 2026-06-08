import { describe, expect, it } from 'vitest'
import {
  applyPagesToBook,
  computeReadingStreak,
  createReadingLog,
  isBookComplete,
  validatePageLog,
} from '../../src/engines/reading.ts'
import { makeBook } from './fixtures.ts'
import type { ReadingLog } from '../../src/types/domain.ts'

describe('reading engine', () => {
  it('caps pages so pagesRead never exceeds totalPages', () => {
    const book = makeBook({ pagesRead: 90, totalPages: 100 })
    const validation = validatePageLog(book, 25)

    expect(validation.valid).toBe(true)
    expect(validation.cappedPages).toBe(10)

    const updated = applyPagesToBook(book, 25)
    expect(updated.pagesRead).toBe(100)
    expect(isBookComplete(updated)).toBe(true)
  })

  it('marks book done when pages reach totalPages', () => {
    const book = makeBook({ pagesRead: 95, totalPages: 100 })
    const updated = applyPagesToBook(book, 10)

    expect(updated.status).toBe('done')
    expect(updated.finishedAt).not.toBeNull()
  })

  it('computes reading streak from committed log dates', () => {
    const logs: ReadingLog[] = [
      createReadingLog({
        id: 'log-1',
        childId: 'child-test',
        bookId: 'book-1',
        pages: 10,
        loggedAt: '2026-06-08T18:00:00.000Z',
        xpGranted: 10,
        coinsGranted: 5,
      }),
      createReadingLog({
        id: 'log-2',
        childId: 'child-test',
        bookId: 'book-1',
        pages: 8,
        loggedAt: '2026-06-07T18:00:00.000Z',
        xpGranted: 8,
        coinsGranted: 4,
      }),
      createReadingLog({
        id: 'log-3',
        childId: 'child-test',
        bookId: 'book-1',
        pages: 5,
        loggedAt: '2026-06-05T18:00:00.000Z',
        xpGranted: 5,
        coinsGranted: 2,
      }),
    ]

    expect(computeReadingStreak(logs, '2026-06-08', 'child-test')).toBe(2)
    expect(computeReadingStreak(logs, '2026-06-06', 'child-test')).toBe(0)
  })

  it('returns frozen immutable reading logs', () => {
    const log = createReadingLog({
      id: 'log-imm',
      childId: 'child-test',
      bookId: 'book-test',
      pages: 12,
      loggedAt: '2026-06-08T10:00:00.000Z',
      xpGranted: 12,
      coinsGranted: 6,
    })

    expect(Object.isFrozen(log)).toBe(true)
  })
})
