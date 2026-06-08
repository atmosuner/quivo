import type { CSSProperties } from 'react'

export interface PlaceholderProps {
  label?: string
  tone?: number
  style?: CSSProperties
  className?: string
}

export function Placeholder({
  label = 'image',
  tone,
  style,
  className = '',
}: PlaceholderProps) {
  return (
    <div
      className={`ph ${className}`.trim()}
      style={{
        ...(tone
          ? {
              background: `linear-gradient(145deg, oklch(0.92 0.05 ${tone}), oklch(0.86 0.07 ${tone}))`,
            }
          : {}),
        ...style,
      }}
    >
      <span
        className="ph-label"
        style={tone ? { color: `oklch(0.45 0.12 ${tone})` } : {}}
      >
        {label}
      </span>
    </div>
  )
}
