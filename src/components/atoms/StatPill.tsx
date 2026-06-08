import type { ReactNode } from 'react'
import { getIcon } from '../icons/icons.tsx'
import { cssVar } from '../lib/css.ts'

export interface StatPillProps {
  icon: string
  value: ReactNode
  tone?: string
  tint?: string
}

export function StatPill({
  icon,
  value,
  tone = '--brand',
  tint,
}: StatPillProps) {
  const I = getIcon(icon)

  return (
    <span className="stat-pill">
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 99,
          display: 'grid',
          placeItems: 'center',
          background: tint ?? `color-mix(in oklab, ${cssVar(tone)} 14%, white)`,
          color: cssVar(tone),
        }}
      >
        <I size={15} />
      </span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </span>
  )
}
