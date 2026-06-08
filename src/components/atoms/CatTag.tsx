import { TASK_CATEGORIES } from '../../data/categories.ts'
import { cssVar } from '../lib/css.ts'
import type { TaskCategory } from '../../types/domain.ts'

export interface CatTagProps {
  category: TaskCategory
  small?: boolean
}

export function CatTag({ category, small = false }: CatTagProps) {
  const meta = TASK_CATEGORIES[category]
  if (!meta) return null

  return (
    <span
      className="tag"
      style={{
        background: cssVar(meta.tintVar),
        color: cssVar(meta.toneVar),
        height: small ? 22 : 24,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 99,
          background: cssVar(meta.toneVar),
        }}
      />
      {meta.label}
    </span>
  )
}
