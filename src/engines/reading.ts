import type { Book, ReadingLog } from '../types/domain.ts'
import { addDays, toIsoDate } from '../lib/utils/dates.ts'

export interface PageLogValidation {
  valid: boolean
  error?: string
  cappedPages: number
}

/** Validate and cap pages for a book log. */
export function validatePageLog(book: Book, pages: number): PageLogValidation {
  if (pages <= 0) {
    return { valid: false, error: 'pages must be positive', cappedPages: 0 }
  }

  const remaining = book.totalPages - book.pagesRead
  if (remaining <= 0) {
    return { valid: false, error: 'book already complete', cappedPages: 0 }
  }

  const cappedPages = Math.min(pages, remaining)
  return { valid: true, cappedPages }
}

/** Apply capped pages to a book copy. */
export function applyPagesToBook(book: Book, pages: number): Book {
  const { cappedPages } = validatePageLog(book, pages)
  const pagesRead = book.pagesRead + cappedPages
  return markBookDoneIfComplete({
    ...book,
    pagesRead,
  })
}

/** Mark book done when pagesRead reaches totalPages. */
export function markBookDoneIfComplete(book: Book, finishedAt?: string): Book {
  if (book.pagesRead < book.totalPages) {
    return book
  }

  return {
    ...book,
    pagesRead: book.totalPages,
    status: 'done',
    finishedAt: finishedAt ?? new Date().toISOString(),
  }
}

export function isBookComplete(book: Book): boolean {
  return book.pagesRead >= book.totalPages
}

/** XP/coins for pages logged (matches design prototype). */
export function readingRewardsForPages(pages: number): { xp: number; coins: number } {
  const safePages = Math.max(0, pages)
  return {
    xp: safePages,
    coins: Math.round(safePages / 2),
  }
}

/**
 * Create an immutable committed reading log entry.
 * Call only after instant grant or parent approval.
 */
export function createReadingLog(params: {
  id: string
  childId: string
  bookId: string
  pages: number
  loggedAt: string
  xpGranted: number
  coinsGranted: number
}): ReadingLog {
  return Object.freeze({
    id: params.id,
    childId: params.childId,
    bookId: params.bookId,
    pages: params.pages,
    loggedAt: params.loggedAt,
    xpGranted: params.xpGranted,
    coinsGranted: params.coinsGranted,
  })
}

/**
 * Consecutive-day reading streak ending at referenceDate (YYYY-MM-DD).
 * Derived from committed logs only.
 */
export function computeReadingStreak(
  logs: ReadingLog[],
  referenceDate: string,
  childId?: string,
): number {
  const filtered = childId
    ? logs.filter((log) => log.childId === childId)
    : logs

  const activeDays = new Set(
    filtered.map((log) => toIsoDate(log.loggedAt)),
  )

  if (!activeDays.has(referenceDate)) {
    return 0
  }

  let streak = 0
  let cursor = referenceDate

  while (activeDays.has(cursor)) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}
