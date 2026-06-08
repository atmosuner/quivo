import type { ChildAvatar } from '../../types/domain.ts'

export interface AvatarProps {
  size?: number
  initial?: string
  hue1?: number
  hue2?: number
  ring?: boolean
  glyphs?: boolean
  avatar?: ChildAvatar
}

export function Avatar({
  size = 48,
  initial = 'M',
  hue1: hue1Prop,
  hue2: hue2Prop,
  ring = false,
  glyphs = true,
  avatar,
}: AvatarProps) {
  const hue1 = avatar?.hue1 ?? hue1Prop ?? 282
  const hue2 = avatar?.hue2 ?? hue2Prop ?? 250
  const r = size * 0.3

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: r,
        fontSize: size * 0.42,
        background: `linear-gradient(140deg, oklch(0.64 0.16 ${hue1}), oklch(0.52 0.17 ${hue2}))`,
        boxShadow: ring
          ? `0 0 0 ${size * 0.05}px var(--surface), 0 0 0 calc(${size * 0.05}px + 2px) oklch(0.6 0.15 ${hue1} / .5), var(--sh-2)`
          : 'var(--sh-2)',
      }}
    >
      {glyphs && (
        <>
          <span
            className="avatar-glyph"
            style={{
              width: size * 0.5,
              height: size * 0.5,
              right: -size * 0.12,
              top: -size * 0.12,
              background: `oklch(0.85 0.12 ${hue1} / 0.4)`,
            }}
          />
          <span
            className="avatar-glyph"
            style={{
              width: size * 0.34,
              height: size * 0.34,
              left: -size * 0.08,
              bottom: -size * 0.08,
              background: `oklch(0.45 0.16 ${hue2} / 0.45)`,
            }}
          />
        </>
      )}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {initial}
      </span>
    </div>
  )
}
