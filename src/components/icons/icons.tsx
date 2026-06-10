import type { IconProps } from './Icon.tsx'
import { Icon } from './Icon.tsx'
import type { IconComponent, IconName } from './types.ts'

export const home: IconComponent = (p) => (
  <Icon {...p} d="M3.5 10.8 12 4l8.5 6.8M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
)

export const homeFill: IconComponent = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M11.3 3.3a1 1 0 0 1 1.4 0l8 7.2a1 1 0 0 1-.7 1.7H19v7a1.5 1.5 0 0 1-1.5 1.5h-3v-5a1.5 1.5 0 0 0-3 0v5h-3A1.5 1.5 0 0 1 5 19.2v-7H4a1 1 0 0 1-.7-1.7z" />
  </Icon>
)

export const quests: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" />
  </Icon>
)

export const questsFill: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.4" fill="currentColor" opacity="0.18" stroke="none" />
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
  </Icon>
)

export const rewards: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4.5 11.5V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7.5M3 8h18v3a.5.5 0 0 1-.5.5h-17A.5.5 0 0 1 3 11zM12 8v12" />
    <path d="M12 8S11 4 8.6 4a2 2 0 0 0 0 4zM12 8s1-4 3.4-4a2 2 0 0 1 0 4z" />
  </Icon>
)

export const rewardsFill: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 8S11 4 8.6 4a2 2 0 0 0 0 4zM12 8s1-4 3.4-4a2 2 0 0 1 0 4z" />
    <path
      d="M4.5 11.5V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7.5M3 8h18v3a.5.5 0 0 1-.5.5h-17A.5.5 0 0 1 3 11zM12 8v12"
      fill="currentColor"
      fillOpacity="0.16"
    />
  </Icon>
)

export const trophy: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M9.5 14.2 9 18h6l-.5-3.8M7.5 20h9" />
  </Icon>
)

export const trophyFill: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" fillOpacity="0.16" />
    <path d="M7 4h10v5a5 5 0 0 1-10 0zM7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3M9.5 14.2 9 18h6l-.5-3.8M7.5 20h9" />
  </Icon>
)

export const user: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
  </Icon>
)

export const userFill: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.7" fill="currentColor" fillOpacity="0.18" />
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" fill="currentColor" fillOpacity="0.18" />
  </Icon>
)

export const book: IconComponent = (p) => (
  <Icon
    {...p}
    d="M12 6.5C10.5 5 8.5 4.5 5.5 4.7a1 1 0 0 0-.9 1v11.5a.9.9 0 0 0 1 .9c2.8-.2 4.8.3 6.4 1.7M12 6.5c1.5-1.5 3.5-2 6.5-1.8a1 1 0 0 1 .9 1v11.5a.9.9 0 0 1-1 .9c-2.8-.2-4.8.3-6.4 1.7M12 6.5v13.2"
  />
)

export const flame: IconComponent = (p) => (
  <Icon
    {...p}
    d="M12 3.5s5.5 3.8 5.5 9a5.5 5.5 0 0 1-11 0c0-1.4.5-2.6 1.2-3.4.3 1 1 1.8 1.9 2 .2-2.6 1.4-5.2 2.4-7.6z"
  />
)

export const flameFill: IconComponent = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M13.2 2.3c.4 2.4-.7 4-2 5.3-1.3 1.4-2.8 2.6-2.8 5A5.6 5.6 0 0 0 14 18c2.1-.5 3.6-2.4 3.6-4.7 0-2.6-1.7-4.4-3-6.2.3 1.3 0 2.4-.7 3-.1-2.6-.3-5.2-.7-7.8z" />
  </Icon>
)

export const check: IconComponent = (p) => <Icon {...p} sw={2.4} d="M5 12.5 10 17 19 7" />

export const plus: IconComponent = (p) => <Icon {...p} sw={2} d="M12 5v14M5 12h14" />

export const chevR: IconComponent = (p) => <Icon {...p} sw={2} d="M9 5l7 7-7 7" />

export const chevL: IconComponent = (p) => <Icon {...p} sw={2} d="M15 5l-7 7 7 7" />

export const chevD: IconComponent = (p) => <Icon {...p} sw={2} d="M5 9l7 7 7-7" />

export const close: IconComponent = (p) => <Icon {...p} sw={2} d="M6 6l12 12M18 6 6 18" />

export const settings: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" />
  </Icon>
)

export const bell: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.2 2 5.7a.5.5 0 0 1-.4.8H5a.5.5 0 0 1-.4-.8c.5-.5 2-1.7 2-5.7zM10 19a2 2 0 0 0 4 0" />
  </Icon>
)

export const star: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16.8l-4.6 1.2.9-5.1L4.5 9.5l5.2-.7z" />
  </Icon>
)

export const starFill: IconComponent = (p) => (
  <Icon {...p} fill="currentColor" stroke="currentColor">
    <path d="M12 4l2.3 4.8 5.2.7-3.8 3.6.9 5.1L12 16.8l-4.6 1.2.9-5.1L4.5 9.5l5.2-.7z" />
  </Icon>
)

export const clock: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5V12l3 1.8" />
  </Icon>
)

export const sparkle: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 4c.4 3.5 1.5 4.6 5 5-3.5.4-4.6 1.5-5 5-.4-3.5-1.5-4.6-5-5 3.5-.4 4.6-1.5 5-5z" />
    <path d="M18.5 13c.2 1.7.7 2.2 2.5 2.5-1.8.3-2.3.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5z" />
  </Icon>
)

export const lock: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
  </Icon>
)

export const pages: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10A.5.5 0 0 1 7 20zM14 3.5V7.5h4M9.5 12h5M9.5 15h5" />
  </Icon>
)

export const shield: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 3.5 19 6v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
)

export const heart: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M12 19.5C6 16 3.5 12.8 3.5 9.5A4 4 0 0 1 12 7a4 4 0 0 1 8.5 2.5c0 3.3-2.5 6.5-8.5 10z" />
  </Icon>
)

export const arrowUp: IconComponent = (p) => (
  <Icon {...p} sw={2}>
    <path d="M12 19V6M6 11l6-6 6 6" />
  </Icon>
)

export const camera: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4.5 8.5h3l1.3-2h6.4l1.3 2h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.2" />
  </Icon>
)

export const calendar: IconComponent = (p) => (
  <Icon {...p}>
    <rect x="4" y="5.5" width="16" height="15" rx="2.5" />
    <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
  </Icon>
)

export const bolt: IconComponent = (p) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <path d="M13 3 5.5 13H11l-1 8 7.5-10H12z" />
  </Icon>
)

export const gift: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4.5 11.5V19a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7.5M3 8h18v3a.5.5 0 0 1-.5.5h-17A.5.5 0 0 1 3 11zM12 8v12" />
    <path d="M12 8S11 4 8.6 4a2 2 0 0 0 0 4zM12 8s1-4 3.4-4a2 2 0 0 1 0 4z" />
  </Icon>
)

export const trash: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M5.5 7h13M9 7V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5V7M7 7l.8 11a1.5 1.5 0 0 0 1.5 1.4h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" />
  </Icon>
)

export const edit: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M14 5.5l4 4M4.5 19.5l1-4L16 5a1.5 1.5 0 0 1 2 0l1 1a1.5 1.5 0 0 1 0 2L8.5 18.5z" />
  </Icon>
)

export const target: IconComponent = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="4.6" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
  </Icon>
)

export const hourglass: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M7 4h10M7 20h10M8 4c0 4 8 4 8 8s-8 4-8 8M16 4c0 4-8 4-8 8s8 4 8 8" />
  </Icon>
)

export const moon: IconComponent = (p) => (
  <Icon {...p} d="M19 13.5A7.5 7.5 0 0 1 9.5 4 7.5 7.5 0 1 0 19 13.5z" />
)

export const refresh: IconComponent = (p) => (
  <Icon {...p} sw={2} d="M4 4v5h5M20 20v-5h-5M4.5 15A8 8 0 1 0 5.6 7.4" />
)

export const pencilSquare: IconComponent = (p) => (
  <Icon {...p}>
    <path d="M4.5 7.5a3 3 0 0 1 3-3H12M19.5 12v4.5a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-4M16 4l3.5 3.5L12 15l-3.7.7L9 12z" />
  </Icon>
)

const ICON_MAP: Record<IconName, IconComponent> = {
  home,
  homeFill,
  quests,
  questsFill,
  rewards,
  rewardsFill,
  trophy,
  trophyFill,
  user,
  userFill,
  book,
  flame,
  flameFill,
  check,
  plus,
  chevR,
  chevL,
  chevD,
  close,
  settings,
  bell,
  star,
  starFill,
  clock,
  sparkle,
  lock,
  pages,
  shield,
  heart,
  arrowUp,
  camera,
  calendar,
  bolt,
  gift,
  trash,
  edit,
  target,
  hourglass,
  moon,
  pencilSquare,
}

/** Resolve an icon by name; falls back to star when unknown. */
export function getIcon(name: string): IconComponent {
  return ICON_MAP[name as IconName] ?? star
}

/** Tab icons use filled variants when active. */
export function getTabIcon(baseName: string, active: boolean): IconComponent {
  const filled = `${baseName}Fill` as IconName
  if (active && filled in ICON_MAP) {
    return ICON_MAP[filled]
  }
  return getIcon(baseName)
}

export type { IconProps }
