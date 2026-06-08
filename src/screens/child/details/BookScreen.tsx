import { useState } from 'react'
import {
  Bar,
  BookCover,
  Button,
  Coin,
  SubHead,
} from '../../../components/index.ts'
import { readingRewardsForPages, validatePageLog } from '../../../engines/reading.ts'
import { DetailNotFound } from '../../shared/DetailNotFound.tsx'
import { bolt, book, plus, shield } from '../../../components/icons/icons.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { getBookById } from '../../shared/selectors.ts'

const Bolt = bolt
const Book = book
const Plus = plus
const Shield = shield

export interface BookScreenProps {
  bookId: string
  onBack: () => void
}

export function BookScreen({ bookId, onBack }: BookScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const submitPageLog = useFamilyStore((state) => state.submitPageLog)

  const [pagesToLog, setPagesToLog] = useState(10)
  const [submitting, setSubmitting] = useState(false)

  if (!snapshot) return null

  const book = getBookById(snapshot.family, bookId)
  if (!book) {
    return <DetailNotFound title="Book" onBack={onBack} />
  }

  const requiresApproval = snapshot.family.settings.requireApprovalDefault
  const pendingLog = snapshot.family.approvals.some(
    (approval) =>
      approval.status === 'pending' &&
      approval.type === 'reading_log' &&
      approval.bookId === book.id,
  )
  const isComplete = book.status === 'done'
  const pct = Math.round((book.pagesRead / book.totalPages) * 100)
  const rewards = readingRewardsForPages(pagesToLog)
  const remaining = book.totalPages - book.pagesRead

  const pageValidation = validatePageLog(book, pagesToLog)
  const canLog = pageValidation.valid && !isComplete && !pendingLog && !submitting

  const handleLog = async () => {
    if (!canLog) return
    setSubmitting(true)
    await submitPageLog(book.id, pagesToLog)
    setSubmitting(false)
    if (!useFamilyStore.getState().error) {
      onBack()
    }
  }

  const bumpPages = (delta: number) => {
    setPagesToLog((current) => Math.max(1, current + delta))
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <BookCover tone={book.coverTone} title={book.title} w={118} h={170} />
          <h1 className="t-h1" style={{ marginTop: 18, fontSize: 21, lineHeight: 1.15 }}>
            {book.title}
          </h1>
          <div className="t-body" style={{ fontSize: 14, marginTop: 6 }}>
            {book.author}
          </div>
          <div className="t-cap" style={{ marginTop: 8 }}>
            {isComplete ? 'Finished' : 'Reading'}
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-2)',
            padding: 18,
            marginTop: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 10,
            }}
          >
            <span className="t-h3">Progress</span>
            <span
              className="t-num"
              style={{ fontWeight: 700, color: 'var(--cat-reading)', whiteSpace: 'nowrap' }}
            >
              {book.pagesRead} / {book.totalPages}
            </span>
          </div>
          <Bar
            pct={pct}
            fillStyle={{
              background: `linear-gradient(90deg, oklch(0.5 0.14 ${book.coverTone}), oklch(0.62 0.13 ${book.coverTone}))`,
            }}
          />
          <div className="t-cap" style={{ marginTop: 8 }}>
            {pct}% complete · {Math.max(0, remaining)} pages to go
          </div>
        </div>

        {!isComplete && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-2)',
              padding: 18,
              marginTop: 14,
            }}
          >
            <div className="t-h3" style={{ marginBottom: 14 }}>
              Log pages read
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
              }}
            >
              <button
                type="button"
                onClick={() => bumpPages(-5)}
                disabled={pagesToLog <= 1}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 99,
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Decrease pages"
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div className="t-num" style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>
                  {pagesToLog}
                </div>
                <div className="t-cap">pages</div>
              </div>
              <button
                type="button"
                onClick={() => bumpPages(5)}
                disabled={!pageValidation.valid && remaining <= 0}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 99,
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Increase pages"
              >
                <Plus size={20} />
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                margin: '14px 0',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  color: 'var(--brand)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Bolt size={14} />+{rewards.xp} XP
              </span>
              <span style={{ color: 'var(--ink-4)' }}>·</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Coin size={14} />
                <span style={{ color: 'var(--coin-ink)' }}>+{rewards.coins}</span>
              </span>
            </div>
            <Button
              variant="primary"
              size="md"
              block
              disabled={!canLog}
              onClick={() => void handleLog()}
            >
              <Book size={18} /> Log {pagesToLog} pages
            </Button>
            {!pageValidation.valid && !isComplete && (
              <div className="t-cap" style={{ marginTop: 8, textAlign: 'center' }}>
                {pageValidation.error === 'pages must be positive'
                  ? 'Enter at least 1 page.'
                  : 'This book is already finished.'}
              </div>
            )}
            {pendingLog && (
              <div
                className="t-cap"
                style={{ marginTop: 10, textAlign: 'center', color: 'var(--coin-ink)' }}
              >
                A page log is already waiting for parent approval.
              </div>
            )}
          </div>
        )}

        {requiresApproval && !isComplete && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 16,
              color: 'var(--ink-3)',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <Shield size={15} /> Parent approval may be required
          </div>
        )}
      </div>
    </div>
  )
}
