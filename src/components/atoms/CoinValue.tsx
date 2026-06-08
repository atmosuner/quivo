import { Coin } from './Coin.tsx'

export interface CoinValueProps {
  value: number | string
  size?: number
  gap?: number
  weight?: number
}

export function CoinValue({
  value,
  size = 15,
  gap = 5,
  weight = 800,
}: CoinValueProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Coin size={size + 3} />
      <span
        className="t-num"
        style={{ fontWeight: weight, fontSize: size, color: 'var(--ink)' }}
      >
        {value}
      </span>
    </span>
  )
}
