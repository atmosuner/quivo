export interface RingProps {
  pct: number
  size?: number
  sw?: number
  color?: string
}

export function Ring({
  pct,
  size = 26,
  sw = 4,
  color = 'var(--brand)',
}: RingProps) {
  const r = (size - sw) / 2
  const cx = size / 2
  const circ = 2 * Math.PI * r

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--surface-3)"
        strokeWidth={sw}
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ - (circ * Math.min(100, pct)) / 100}
        style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)' }}
      />
    </svg>
  )
}
