import { Coin } from '../atoms/Coin.tsx'

export interface CoinStatProps {
  value: string | number
}

export function CoinStat({ value }: CoinStatProps) {
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Coin size={22} />
      </div>
      <div
        className="t-num"
        style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: 'var(--ink)' }}
      >
        {value}
      </div>
      <div className="t-cap">Coins</div>
    </div>
  )
}
