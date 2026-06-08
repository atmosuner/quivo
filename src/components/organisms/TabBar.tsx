import type { ChildTab } from '../../types/navigation.ts'
import { getTabIcon } from '../icons/icons.tsx'

export interface TabBarItem {
  key: ChildTab
  label: string
  icon: string
}

export const CHILD_TABS: TabBarItem[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'quests', label: 'Quests', icon: 'quests' },
  { key: 'rewards', label: 'Rewards', icon: 'rewards' },
  { key: 'achievements', label: 'Awards', icon: 'trophy' },
  { key: 'profile', label: 'Profile', icon: 'user' },
]

export interface TabBarProps {
  active: ChildTab
  onTab: (tab: ChildTab) => void
}

export function TabBar({ active, onTab }: TabBarProps) {
  return (
    <div className="tabbar">
      {CHILD_TABS.map((t) => {
        const on = active === t.key
        const I = getTabIcon(t.icon, on)
        return (
          <button
            key={t.key}
            type="button"
            className={`tab${on ? ' active' : ''}`}
            onClick={() => onTab(t.key)}
            aria-label={t.label}
            aria-current={on ? 'page' : undefined}
          >
            <span className="tab-ic">
              <I size={25} />
            </span>
            <span>{t.label}</span>
          </button>
        )
      })}
    </div>
  )
}
