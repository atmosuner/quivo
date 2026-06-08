export interface BookCoverProps {
  tone?: number
  w?: number
  h?: number
  title: string
}

export function BookCover({ tone = 250, w = 56, h = 80, title }: BookCoverProps) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 8,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(145deg, oklch(0.72 0.12 ${tone}), oklch(0.55 0.14 ${tone}))`,
        boxShadow: 'var(--sh-2)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 6,
          top: 0,
          bottom: 0,
          width: 3,
          background: 'rgba(0,0,0,0.12)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '10px 8px 8px 14px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: w * 0.13,
            fontWeight: 800,
            color: 'rgba(255,255,255,0.96)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
      </div>
    </div>
  )
}
