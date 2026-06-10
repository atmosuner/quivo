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
import { bolt, book, shield } from '../../../components/icons/icons.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { getBookById } from '../../shared/selectors.ts'

const Bolt = bolt
const Book = book
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
  const isPending = book.status === 'pending'
  const isComplete = book.status === 'done'
  const pct = Math.round((book.pagesRead / book.totalPages) * 100)
  const rewards = readingRewardsForPages(pagesToLog)
  const remaining = book.totalPages - book.pagesRead

  const pageValidation = validatePageLog(book, pagesToLog)
  const canLog = pageValidation.valid && !isComplete && !isPending && !pendingLog && !submitting

  const handleLog = async () => {
    if (!canLog) return
    setSubmitting(true)
    await submitPageLog(book.id, pagesToLog)
    setSubmitting(false)
    if (!useFamilyStore.getState().error) {
      onBack()
    }
  }

  const setPages = (n: number) => {
    setPagesToLog(Math.max(1, Math.min(remaining, n)))
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

        {isPending && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-2)',
              padding: 18,
              marginTop: 14,
              textAlign: 'center',
            }}
          >
            <div className="t-cap" style={{ color: 'var(--coin-ink)', fontWeight: 700 }}>
              Waiting for parent approval
            </div>
            <div className="t-body" style={{ color: 'var(--ink-3)', marginTop: 6, fontSize: 13 }}>
              Your parent needs to approve this book before you can log pages.
            </div>
          </div>
        )}

        {!isComplete && !isPending && (
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <input
                  type="number"
                  min={1}
                  max={remaining}
                  value={pagesToLog}
                  onChange={(e) => setPages(Number.parseInt(e.target.value, 10) || 1)}
                  style={{
                    width: 100,
                    textAlign: 'center',
                    fontSize: 38,
                    fontWeight: 800,
                    fontFamily: 'var(--font)',
                    border: '2px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--bg)',
                    color: 'var(--ink)',
                    padding: '6px 4px',
                    lineHeight: 1,
                  }}
                  aria-label="Pages read"
                />
                <div className="t-cap" style={{ marginTop: 4 }}>pages today</div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {[5, 10, 20].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPages(n)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 99,
                      border: pagesToLog === n ? '2px solid var(--brand)' : '1px solid var(--line)',
                      background: pagesToLog === n ? 'var(--brand-tint)' : 'var(--surface)',
                      color: pagesToLog === n ? 'var(--brand)' : 'var(--ink-2)',
                      fontFamily: 'var(--font)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {n}
                  </button>
                ))}
                {remaining > 0 && (
                  <button
                    type="button"
                    onClick={() => setPages(remaining)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 99,
                      border: pagesToLog === remaining ? '2px solid var(--success)' : '1px solid var(--line)',
                      background: pagesToLog === remaining ? 'oklch(0.96 0.04 145)' : 'var(--surface)',
                      color: pagesToLog === remaining ? 'var(--success)' : 'var(--ink-2)',
                      fontFamily: 'var(--font)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Finish!
                  </button>
                )}
              </div>
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
              <Book size={18} /> {submitting ? 'Logging…' : `Log ${pagesToLog} pages`}
            </Button>
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
