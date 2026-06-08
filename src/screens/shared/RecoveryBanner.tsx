import { close } from '../../components/icons/icons.tsx'

const Close = close

export interface RecoveryBannerProps {
  message: string
  onDismiss: () => void
}

/** One-shot notice after corrupted localStorage was auto-recovered. */
export function RecoveryBanner({ message, onDismiss }: RecoveryBannerProps) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        padding: '12px 16px',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        background: 'var(--coin-tint)',
        color: 'var(--coin-ink)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: 'var(--sh-2)',
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notice"
        style={{
          background: 'none',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: 'inherit',
          flexShrink: 0,
        }}
      >
        <Close size={18} />
      </button>
    </div>
  )
}
