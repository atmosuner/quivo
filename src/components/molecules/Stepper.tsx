import { Coin } from '../atoms/Coin.tsx'
import { getIcon } from '../icons/icons.tsx'
import { plus } from '../icons/icons.tsx'
import { cssVar } from '../lib/css.ts'

const Plus = plus

export interface StepperProps {
  label: string
  icon?: string
  coin?: boolean
  tone?: string
  value: number
  onChange: (next: number) => void
  step?: number
  min?: number
}

export function Stepper({
  label,
  icon,
  coin = false,
  tone = '--brand',
  value,
  onChange,
  step = 1,
  min = 0,
}: StepperProps) {
  const I = icon ? getIcon(icon) : null

  return (
    <div style={{ flex: 1 }}>
      <span className="t-label">{label}</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
          height: 52,
          background: 'var(--surface)',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--line)',
          padding: '0 10px',
        }}
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: 'none',
            background: 'var(--surface-3)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--ink-2)',
          }}
          aria-label={`Decrease ${label}`}
        >
          <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
        </button>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
          }}
        >
          {coin ? (
            <Coin size={16} />
          ) : (
            I && (
              <span style={{ color: cssVar(tone) }}>
                <I size={16} />
              </span>
            )
          )}
          <span className="t-num" style={{ fontWeight: 800, fontSize: 17 }}>
            {value}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onChange(value + step)}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: 'none',
            background: 'var(--surface-3)',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--ink-2)',
          }}
          aria-label={`Increase ${label}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
