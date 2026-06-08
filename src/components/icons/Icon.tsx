import type { CSSProperties, ReactNode } from 'react'

export interface IconProps {
  size?: number
  sw?: number
  fill?: string
  stroke?: string
  vb?: number
  style?: CSSProperties
  className?: string
}

export interface IconComponentProps extends IconProps {
  d?: string
  children?: ReactNode
}

export function Icon({
  d,
  size = 24,
  sw = 1.8,
  fill = 'none',
  stroke = 'currentColor',
  children,
  vb = 24,
  style,
  className,
}: IconComponentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill={fill}
      style={style}
      className={className}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d ? <path d={d} /> : children}
    </svg>
  )
}
