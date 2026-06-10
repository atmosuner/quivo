import type { Book, Family } from '../types/domain.ts'
import type { GrantEffect } from '../types/gamification.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import { proposeBook as proposeBookEngine, submitReadingLog } from '../engines/approvals.ts'
import { evaluateAchievementEvent } from '../engines/achievements.ts'
import {
  applyPagesToBook,
  createReadingLog,
  readingRewardsForPages,
  validatePageLog,
} from '../engines/reading.ts'
import {
  applyChildGrant,
  createServiceId,
  persistFamily,
  requiresReadingApproval,
} from './shared.ts'
import type { ServiceResult } from './types.ts'

export interface AddBookInput {
  title: string
  author: string
  totalPages: number
  coverTone: number
}

function replaceChild(
  family: Family,
  childId: string,
  patch: { booksReadLifetime: number },
): Family {
  return {
    ...family,
    children: family.children.map((child) =>
      child.id === childId ? { ...child, ...patch } : child,
    ),
  }
}

function commitInstantReadingLog(
  family: Family,
  bookId: string,
  pages: number,
  loggedAt: string,
): { family: Family; effects: GrantEffect[] } {
  const book = family.books.find((entry) => entry.id === bookId)
  if (!book) {
    throw new Error(`book not found: ${bookId}`)
  }

  const validation = validatePageLog(book, pages)
  if (!validation.valid) {
    throw new Error(validation.error ?? 'invalid page log')
  }

  const rewards = readingRewardsForPages(validation.cappedPages)
  const updatedBook = applyPagesToBook(book, validation.cappedPages)
  const wasComplete = book.status !== 'done' && updatedBook.status === 'done'

  const log = createReadingLog({
    id: createServiceId('log'),
    childId: book.childId,
    bookId: book.id,
    pages: validation.cappedPages,
    loggedAt,
    xpGranted: rewards.xp,
    coinsGranted: rewards.coins,
  })

  let nextFamily: Family = {
    ...family,
    books: family.books.map((entry) =>
      entry.id === updatedBook.id ? updatedBook : entry,
    ),
    readingLogs: [...family.readingLogs, log],
  }

  const grant = applyChildGrant(
    nextFamily,
    book.childId,
    rewards.xp,
    rewards.coins,
    loggedAt.slice(0, 10),
  )
  nextFamily = grant.family
  let effects = [...grant.effects]

  const pagesResult = evaluateAchievementEvent(nextFamily, {
    type: 'pages_logged',
    childId: book.childId,
    pages: validation.cappedPages,
  })
  nextFamily = pagesResult.family
  effects = [...effects, ...pagesResult.effects]

  if (wasComplete) {
    const child = nextFamily.children.find((entry) => entry.id === book.childId)
    if (child) {
      nextFamily = replaceChild(nextFamily, child.id, {
        booksReadLifetime: child.booksReadLifetime + 1,
      })
    }

    const bookResult = evaluateAchievementEvent(nextFamily, {
      type: 'book_completed',
      childId: book.childId,
    })
    nextFamily = bookResult.family
    effects = [...effects, ...bookResult.effects]
  }

  return { family: nextFamily, effects }
}

export async function addBook(
  childId: string,
  input: AddBookInput,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const child = snapshot.family.children.find((entry) => entry.id === childId)
  if (!child) {
    throw new Error(`child not found: ${childId}`)
  }

  if (input.totalPages <= 0) {
    throw new Error('totalPages must be positive')
  }

  const book: Book = {
    id: createServiceId('book'),
    childId,
    title: input.title,
    author: input.author,
    totalPages: input.totalPages,
    pagesRead: 0,
    status: 'reading',
    coverTone: input.coverTone,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  }

  const family = {
    ...snapshot.family,
    books: [...snapshot.family.books, book],
  }

  return persistFamily(repo, snapshot.meta, family)
}

export async function proposeBook(
  childId: string,
  input: AddBookInput,
  repo: DataRepository = localStorageRepository,
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const child = snapshot.family.children.find((c) => c.id === childId)
  if (!child) throw new Error(`child not found: ${childId}`)
  if (input.totalPages <= 0) throw new Error('totalPages must be positive')

  const now = new Date().toISOString()
  const book: Book = {
    id: createServiceId('book'),
    childId,
    title: input.title.trim(),
    author: input.author.trim(),
    totalPages: input.totalPages,
    pagesRead: 0,
    status: 'pending',
    coverTone: input.coverTone,
    startedAt: now,
    finishedAt: null,
  }

  const result = proposeBookEngine(snapshot.family, childId, book, {
    approvalId: createServiceId('approval-book'),
    createdAt: now,
  })

  return persistFamily(repo, snapshot.meta, result.family, result.effects)
}

export async function submitPageLog(
  bookId: string,
  pages: number,
  repo: DataRepository = localStorageRepository,
  options?: { note?: string | null; createdAt?: string },
): Promise<ServiceResult> {
  const snapshot = await repo.load()
  const createdAt = options?.createdAt ?? new Date().toISOString()

  if (requiresReadingApproval(snapshot.family)) {
    const result = submitReadingLog(snapshot.family, bookId, pages, {
      approvalId: createServiceId('approval-reading'),
      createdAt,
      note: options?.note ?? null,
    })
    return persistFamily(repo, snapshot.meta, result.family, result.effects)
  }

  const result = commitInstantReadingLog(snapshot.family, bookId, pages, createdAt)
  return persistFamily(repo, snapshot.meta, result.family, result.effects)
}
