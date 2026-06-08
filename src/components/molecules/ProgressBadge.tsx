import { Bar } from '../atoms/Bar.tsx'
import { getIcon } from '../icons/icons.tsx'
import { lock } from '../icons/icons.tsx'

const Lock = lock

export interface ProgressBadgeProps {
  title: string
  description: string
  icon: string
  tone: number
  progress: number
  total: number
  locked?: boolean
  onClick?: () => void
}

export function ProgressBadge({
  title,
  description,
  icon,
  tone,
  progress,
  total,
  locked = false,
  onClick,
}: ProgressBadgeProps) {
  const I = getIcon(icon)
  const pct = total ? (progress / total) * 100 : 0

  return (
    <div
      className="pressable"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-1)',
        padding: '13px 15px',
        opacity: locked ? 0.7 : 1,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          background: locked
            ? 'var(--surface-3)'
            : `color-mix(in oklab, oklch(0.62 0.15 ${tone}) 14%, white)`,
          color: locked ? 'var(--ink-4)' : `oklch(0.55 0.15 ${tone})`,
        }}
      >
        {locked ? <Lock size={22} /> : <I size={24} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <div
            className="t-h3"
            style={{
              fontSize: 15,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </div>
          <span
            className="t-num"
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--ink-3)',
              flexShrink: 0,
            }}
          >
            {progress}/{total}
          </span>
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--ink-3)',
            margin: '2px 0 9px',
          }}
        >
          {description}
        </div>
        <Bar pct={pct} thin />
      </div>
    </div>
  )
}
