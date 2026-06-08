import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
}

/** Centered empty / placeholder state (e.g. approval queue clear). */
export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-3)' }}>
      <div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto 16px',
          borderRadius: 20,
          background: 'var(--success-tint)',
          color: 'var(--success)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </div>
      <div className="t-h2">{title}</div>
      {description && (
        <div className="t-body" style={{ marginTop: 4 }}>
          {description}
        </div>
      )}
    </div>
  )
}
