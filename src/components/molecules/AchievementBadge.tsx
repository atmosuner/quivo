import { getIcon } from '../icons/icons.tsx'
import type { AchievementTier } from '../../types/gamification.ts'

export interface AchievementBadgeProps {
  title: string
  tier: AchievementTier | string
  icon: string
  tone: number
  onClick?: () => void
}

export function AchievementBadge({
  title,
  tier,
  icon,
  tone,
  onClick,
}: AchievementBadgeProps) {
  const I = getIcon(icon)

  return (
    <div
      className="pressable"
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-2)',
        padding: '16px 8px 13px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          margin: '0 auto',
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          background: `linear-gradient(145deg, oklch(0.7 0.14 ${tone}), oklch(0.55 0.15 ${tone}))`,
          boxShadow: `0 6px 14px -4px oklch(0.6 0.15 ${tone} / 0.5)`,
        }}
      >
        <I size={28} />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          marginTop: 9,
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--ink-4)',
          marginTop: 3,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {tier}
      </div>
    </div>
  )
}
