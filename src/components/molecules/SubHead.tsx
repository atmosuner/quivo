import type { ReactNode } from 'react'
import { chevL } from '../icons/icons.tsx'

const ChevL = chevL

export interface SubHeadProps {
  title: string
  onBack: () => void
  right?: ReactNode
}

export function SubHead({ title, onBack, right }: SubHeadProps) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        paddingTop: 52,
        paddingBottom: 10,
        background: 'linear-gradient(var(--bg) 78%, transparent)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 99,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            boxShadow: 'var(--sh-1)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
          aria-label="Go back"
        >
          <ChevL size={20} />
        </button>
        <span className="t-h3" style={{ fontSize: 16 }}>
          {title}
        </span>
        <div style={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>
          {right}
        </div>
      </div>
    </div>
  )
}
