import type { TaskDifficulty } from '../../types/domain.ts'

export interface DifficultyProps {
  level?: TaskDifficulty
}

export function Difficulty({ level = 1 }: DifficultyProps) {
  return (
    <span className="diff">
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= level ? 'on' : ''} />
      ))}
    </span>
  )
}
