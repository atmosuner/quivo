import type { ReactNode } from 'react'

export interface MiniProps {
  label: string
  value: ReactNode
}

export function Mini({ label, value }: MiniProps) {
  return (
    <div style={{ flex: 1 }}>
      <div className="t-num" style={{ fontSize: 20, fontWeight: 800 }}>
        {value}
      </div>
      <div className="t-cap" style={{ marginTop: 1 }}>
        {label}
      </div>
    </div>
  )
}
