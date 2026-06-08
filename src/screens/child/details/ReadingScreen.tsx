import { BookCover, EmptyState, SectionHead, SubHead } from '../../../components/index.ts'
import { Bar } from '../../../components/atoms/Bar.tsx'
import { flameFill, plus, check } from '../../../components/icons/icons.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { useAppStore } from '../../../stores/appStore.ts'
import {
  getActiveChild,
  getBooksReadThisYear,
  getPagesReadThisMonth,
  getReadingBooks,
  getReadingStreak,
  getReferenceDate,
} from '../../shared/selectors.ts'

const FlameFill = flameFill
const Plus = plus
const Check = check

export interface ReadingScreenProps {
  onBack: () => void
}

export function ReadingScreen({ onBack }: ReadingScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const pushChildScreen = useAppStore((state) => state.pushChildScreen)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const referenceDate = getReferenceDate(snapshot)
  const books = getReadingBooks(snapshot.family, child.id)
  const reading = books.filter((book) => book.status === 'reading')
  const done = books.filter((book) => book.status === 'done')
  const pagesThisMonth = getPagesReadThisMonth(
    snapshot.family.readingLogs,
    child.id,
    referenceDate,
  )
  const booksThisYear = getBooksReadThisYear(books, child.id, referenceDate)
  const readingStreak = getReadingStreak(
    snapshot.family.readingLogs,
    child.id,
    referenceDate,
  )

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead
        title="Reading"
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={() =>
              pushChildScreen({ screen: 'addbook', dataId: child.id })
            }
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--brand)',
            }}
            aria-label="Add a book"
          >
            <Plus size={24} />
          </button>
        }
      />
      <div className="q-body">
        <div
          className="rise g-reading"
          style={{
            borderRadius: 'var(--r-xl)',
            padding: 20,
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 22px -6px oklch(0.55 0.13 250 / .45)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -30,
              top: -40,
              width: 150,
              height: 150,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FlameFill size={18} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {readingStreak}-day reading streak
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 26,
              marginTop: 18,
              position: 'relative',
            }}
          >
            <div>
              <div className="t-num" style={{ fontSize: 30, fontWeight: 800 }}>
                {pagesThisMonth}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                pages this month
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div>
              <div className="t-num" style={{ fontSize: 30, fontWeight: 800 }}>
                {booksThisYear}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                books this year
              </div>
            </div>
            <div style={{ width: 1, background: 'rgba(255,255,255,0.25)' }} />
            <div>
              <div className="t-num" style={{ fontSize: 30, fontWeight: 800 }}>
                {child.booksReadLifetime}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                books read
              </div>
            </div>
          </div>
        </div>

        {books.length === 0 && (
          <EmptyState
            icon={<Plus size={32} />}
            title="No books yet"
            description="Tap + to add your first book and start tracking reading."
          />
        )}

        <SectionHead title="Currently reading" />
        {reading.length === 0 ? (
          <div className="t-body" style={{ marginBottom: 16 }}>
            No books in progress. Tap + to add one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reading.map((book) => {
              const pct = Math.round((book.pagesRead / book.totalPages) * 100)
              return (
                <button
                  key={book.id}
                  type="button"
                  className="pressable"
                  onClick={() =>
                    pushChildScreen({ screen: 'book', dataId: book.id })
                  }
                  style={{
                    display: 'flex',
                    gap: 14,
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    boxShadow: 'var(--sh-2)',
                    padding: 14,
                    border: 'none',
                    font: 'inherit',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer',
                  }}
                >
                  <BookCover tone={book.coverTone} title={book.title} w={58} h={84} />
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div className="t-h3" style={{ fontSize: 15.5 }}>
                      {book.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: 'var(--ink-3)',
                        marginTop: 1,
                      }}
                    >
                      {book.author}
                    </div>
                    <div style={{ flex: 1 }} />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 6,
                      }}
                    >
                      <span
                        className="t-num"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--cat-reading)',
                        }}
                      >
                        {book.pagesRead} / {book.totalPages} pages
                      </span>
                      <span
                        className="t-num"
                        style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <Bar
                      pct={pct}
                      thin
                      fillStyle={{
                        background: `linear-gradient(90deg, oklch(0.5 0.14 ${book.coverTone}), oklch(0.62 0.13 ${book.coverTone}))`,
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <SectionHead title="Finished" />
        {done.length === 0 ? (
          <div className="t-body">No finished books yet.</div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 13,
              overflowX: 'auto',
              padding: '2px 2px 6px',
              scrollbarWidth: 'none',
            }}
          >
            {done.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() =>
                  pushChildScreen({ screen: 'book', dataId: book.id })
                }
                style={{
                  flexShrink: 0,
                  width: 92,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  font: 'inherit',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <BookCover tone={book.coverTone} title={book.title} w={92} h={132} />
                  <div
                    style={{
                      position: 'absolute',
                      right: 6,
                      top: 6,
                      width: 24,
                      height: 24,
                      borderRadius: 99,
                      background: 'var(--success)',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: 'var(--sh-2)',
                      border: '2px solid #fff',
                    }}
                  >
                    <Check size={13} stroke="#fff" />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginTop: 7,
                    lineHeight: 1.2,
                  }}
                >
                  {book.title}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
