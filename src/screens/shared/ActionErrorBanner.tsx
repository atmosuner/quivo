import { close } from '../../components/icons/icons.tsx'

const Close = close

export interface ActionErrorBannerProps {
  message: string
  onDismiss: () => void
  /** When false, sit closer to the bottom edge (detail stack has no tab bar). */
  tabbed?: boolean
}

/** Non-blocking banner for action-level store errors (redeem, log pages, etc.). */
export function ActionErrorBanner({
  message,
  onDismiss,
  tabbed = true,
}: ActionErrorBannerProps) {
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: tabbed
          ? 'calc(100px + var(--safe-bottom))'
          : 'calc(16px + var(--safe-bottom))',
        zIndex: 45,
        padding: '12px 14px',
        borderRadius: 'var(--r-lg)',
        background: 'var(--coin-tint)',
        color: 'var(--coin-ink)',
        boxShadow: 'var(--sh-3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        style={{
          background: 'none',
          border: 'none',
          padding: 2,
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
