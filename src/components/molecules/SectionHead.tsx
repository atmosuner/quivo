export interface SectionHeadProps {
  title: string
  action?: string
  onAction?: () => void
}

export function SectionHead({ title, action, onAction }: SectionHeadProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        margin: '0 2px 12px',
      }}
    >
      <h3 className="t-h2">{title}</h3>
      {action && (
        <button
          type="button"
          onClick={onAction}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--brand)',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
