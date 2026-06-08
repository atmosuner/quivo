import { getIcon } from '../icons/icons.tsx'
import { cssVar } from '../lib/css.ts'

export interface IconTileProps {
  icon: string
  tone?: string
  size?: number
  r?: number
  fill?: boolean
}

export function IconTile({
  icon,
  tone = '--brand',
  size = 44,
  r = 13,
  fill = false,
}: IconTileProps) {
  const I = getIcon(icon)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: fill
          ? cssVar(tone)
          : `color-mix(in oklab, ${cssVar(tone)} 13%, white)`,
        color: fill ? '#fff' : cssVar(tone),
      }}
    >
      <I size={size * 0.5} />
    </div>
  )
}
