import { useState } from 'react'
import {
  Button,
  Field,
  Placeholder,
  SubHead,
} from '../../../components/index.ts'
import { plus } from '../../../components/icons/icons.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'

const Plus = plus

const COVER_TONES = [250, 160, 12, 295, 78, 45]

export interface AddBookScreenProps {
  childId: string
  onBack: () => void
}

export function AddBookScreen({ childId, onBack }: AddBookScreenProps) {
  const addBook = useFamilyStore((state) => state.addBook)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  const pages = Number.parseInt(totalPages, 10)
  const isValid =
    title.trim().length > 0 &&
    author.trim().length > 0 &&
    Number.isFinite(pages) &&
    pages > 0

  const handleAdd = async () => {
    if (!isValid) {
      setFieldError('Enter a title, author, and a page count greater than zero.')
      return
    }
    setFieldError(null)

    setSaving(true)
    await addBook(childId, {
      title: title.trim(),
      author: author.trim(),
      totalPages: pages,
      coverTone: COVER_TONES[title.length % COVER_TONES.length],
    })
    setSaving(false)

    if (!useFamilyStore.getState().error) {
      onBack()
    }
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Add a book" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <Field
          label="Book title"
          placeholder="e.g. The Wild Robot"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Field
          label="Author"
          placeholder="e.g. Peter Brown"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
        <Field
          label="Total pages"
          placeholder="288"
          num
          value={totalPages}
          onChange={(event) => setTotalPages(event.target.value)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <span className="t-label">Cover</span>
          <Placeholder label="drop cover image" style={{ height: 120 }} />
        </div>
        {fieldError && (
          <div
            className="t-cap"
            role="alert"
            style={{ marginTop: 12, color: 'var(--coin-ink)' }}
          >
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
          <Plus size={20} /> Add book
        </Button>
      </div>
    </div>
  )
}
