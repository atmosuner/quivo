import type { ReactNode } from 'react'
import { Button } from './Button.tsx'

export interface ErrorStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

/** Centered error / recovery state with optional retry action. */
export function ErrorState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
      {icon && (
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 16px',
            borderRadius: 20,
            background: 'var(--coin-tint)',
            color: 'var(--coin-ink)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {icon}
        </div>
      )}
      <h2 className="t-h2">{title}</h2>
      {description && (
        <p className="t-body" style={{ marginTop: 6, maxWidth: 320, marginInline: 'auto' }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" style={{ marginTop: 18 }} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
