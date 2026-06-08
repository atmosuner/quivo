export interface CoinProps {
  size?: number
}

export function Coin({ size = 18 }: CoinProps) {
  return (
    <span className="coin" style={{ width: size, height: size }}>
      <span style={{ fontSize: size * 0.58 }}>Q</span>
    </span>
  )
}
