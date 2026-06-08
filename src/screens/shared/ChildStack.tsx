import type { ChildStackEntry } from '../../types/navigation.ts'
import {
  AchievementScreen,
  AddBookScreen,
  BookScreen,
  ReadingScreen,
  RewardScreen,
  SettingsScreen,
  TaskScreen,
} from '../child/details/index.ts'

export interface ChildStackProps {
  entry: ChildStackEntry
  onBack: () => void
}

export function ChildStack({ entry, onBack }: ChildStackProps) {
  switch (entry.screen) {
    case 'task':
      return <TaskScreen taskId={entry.dataId} onBack={onBack} />
    case 'reward':
      return <RewardScreen rewardId={entry.dataId} onBack={onBack} />
    case 'achievement':
      return <AchievementScreen achievementId={entry.dataId} onBack={onBack} />
    case 'reading':
      return <ReadingScreen onBack={onBack} />
    case 'book':
      return <BookScreen bookId={entry.dataId} onBack={onBack} />
    case 'addbook':
      return <AddBookScreen childId={entry.dataId} onBack={onBack} />
    case 'settings':
      return <SettingsScreen onBack={onBack} />
    default:
      return null
  }
}
