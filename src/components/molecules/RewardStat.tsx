import { getIcon } from '../icons/icons.tsx'
import { cssVar } from '../lib/css.ts'

export interface RewardStatProps {
  icon: string
  value: string | number
  label: string
  tone?: string
}

export function RewardStat({
  icon,
  value,
  label,
  tone = '--brand',
}: RewardStatProps) {
  const I = getIcon(icon)

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-1)',
        padding: '14px 8px',
        textAlign: 'center',
      }}
    >
      <span style={{ color: cssVar(tone) }}>
        <I size={22} />
      </span>
      <div
        className="t-num"
        style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: 'var(--ink)' }}
      >
        {value}
      </div>
      <div className="t-cap">{label}</div>
    </div>
  )
}
