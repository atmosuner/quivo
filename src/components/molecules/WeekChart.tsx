export interface WeekDayData {
  label: string
  xp: number
  today?: boolean
  done?: boolean
}

export interface WeekChartProps {
  days: WeekDayData[]
}

export function WeekChart({ days }: WeekChartProps) {
  const max = Math.max(...days.map((d) => d.xp), 1)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 96,
        gap: 9,
      }}
    >
      {days.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 26,
              height: `${(d.xp / max) * 100}%`,
              borderRadius: 7,
              background: d.today
                ? 'var(--surface-3)'
                : 'linear-gradient(var(--brand), var(--brand-strong))',
              border: d.today ? '2px dashed var(--brand)' : 'none',
              opacity: d.done || d.today ? 1 : 0.4,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: d.today ? 'var(--brand)' : 'var(--ink-4)',
            }}
          >
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
