import type { ReactNode } from 'react'

export interface HeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  large?: boolean
  pad?: boolean
}

export function Header({
  title,
  subtitle,
  right,
  large = true,
  pad = true,
}: HeaderProps) {
  return (
    <div style={{ padding: pad ? '60px 20px 8px' : 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {subtitle && (
            <div className="t-eyebrow" style={{ marginBottom: 6 }}>
              {subtitle}
            </div>
          )}
          <h1 className={large ? 't-display' : 't-h1'}>{title}</h1>
        </div>
        {right}
      </div>
    </div>
  )
}
