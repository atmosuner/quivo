import { useState } from 'react'
import { Button, Field, SubHead } from '../../components/index.ts'
import { plus } from '../../components/icons/icons.tsx'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Plus = plus

const COVER_TONES = [250, 160, 12, 295, 78, 45]

export function ParentAddBookScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const addBook = useFamilyStore((state) => state.addBook)
  const setParentScreen = useAppStore((state) => state.setParentScreen)

  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    return snapshot?.family.settings.activeChildId ?? ''
  })
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  if (!snapshot) return null

  const { children } = snapshot.family
  const pages = Number.parseInt(totalPages, 10)
  const isValid =
    selectedChildId.length > 0 &&
    title.trim().length > 0 &&
    author.trim().length > 0 &&
    Number.isFinite(pages) &&
    pages > 0

  const handleAdd = async () => {
    if (!isValid) {
      setFieldError('Fill in all fields with a page count greater than zero.')
      return
    }
    setFieldError(null)
    setSaving(true)
    await addBook(selectedChildId, {
      title: title.trim(),
      author: author.trim(),
      totalPages: pages,
      coverTone: COVER_TONES[title.length % COVER_TONES.length],
    })
    setSaving(false)
    if (!useFamilyStore.getState().error) {
      setParentScreen('dash')
    }
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Add book" onBack={() => setParentScreen('dash')} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        {children.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <div className="t-label" style={{ marginBottom: 8 }}>For</div>
            <div className="seg" role="group" aria-label="Select child">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className={child.id === selectedChildId ? 'on' : ''}
                  onClick={() => setSelectedChildId(child.id)}
                  aria-pressed={child.id === selectedChildId}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field
          label="Book title"
          placeholder="e.g. The Wild Robot"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Field
          label="Author"
          placeholder="e.g. Peter Brown"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <Field
          label="Total pages"
          placeholder="288"
          num
          value={totalPages}
          onChange={(e) => setTotalPages(e.target.value)}
        />

        {fieldError && (
          <div className="t-cap" role="alert" style={{ marginBottom: 12, color: 'var(--coin-ink)' }}>
            {fieldError}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          block
          style={{ marginTop: 22 }}
          disabled={saving || !isValid}
          onClick={() => void handleAdd()}
        >
          <Plus size={20} /> {saving ? 'Adding…' : 'Add to reading list'}
        </Button>
        <div className="t-cap" style={{ marginTop: 8, textAlign: 'center', color: 'var(--ink-3)' }}>
          Added directly — no approval needed.
        </div>
      </div>
    </div>
  )
}
