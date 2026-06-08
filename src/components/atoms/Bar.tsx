import type { CSSProperties } from 'react'

export interface BarProps {
  pct: number
  thin?: boolean
  /** Optional inline bar fill style (e.g. book cover tone gradient). */
  fillStyle?: CSSProperties
}

export function Bar({ pct, thin = false, fillStyle }: BarProps) {
  const width = `${Math.max(0, Math.min(100, pct))}%`

  return (
    <div className={`bar${thin ? ' thin' : ''}`}>
      <i style={{ width, ...fillStyle }} />
    </div>
  )
}
