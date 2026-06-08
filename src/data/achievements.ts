import type { AchievementDefinition } from '../types/gamification.ts'

/**
 * Bundled achievement catalog — not stored in AppSnapshot.
 * Progress lives in family.achievementProgress.
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'a1',
    title: 'First Chapter',
    description: 'Finish your first book',
    icon: 'book',
    tier: 'Bronze',
    tone: 250,
    target: 1,
  },
  {
    id: 'a2',
    title: 'Early Riser',
    description: 'Make your bed 20 times',
    icon: 'home',
    tier: 'Bronze',
    tone: 295,
    target: 20,
    category: 'responsibility',
  },
  {
    id: 'a3',
    title: 'Week Warrior',
    description: 'Keep a 7-day streak',
    icon: 'flame',
    tier: 'Silver',
    tone: 45,
    target: 7,
  },
  {
    id: 'a4',
    title: 'Page Turner',
    description: 'Read 100 pages',
    icon: 'pages',
    tier: 'Silver',
    tone: 250,
    target: 100,
  },
  {
    id: 'a5',
    title: 'Task Master',
    description: 'Complete 30 tasks',
    icon: 'check',
    tier: 'Silver',
    tone: 155,
    target: 30,
  },
  {
    id: 'a6',
    title: 'Bookworm',
    description: 'Finish 10 books',
    icon: 'book',
    tier: 'Gold',
    tone: 250,
    target: 10,
  },
  {
    id: 'a7',
    title: 'Month of Habits',
    description: 'Keep a 30-day streak',
    icon: 'flame',
    tier: 'Gold',
    tone: 45,
    target: 30,
  },
  {
    id: 'a8',
    title: 'Helping Hand',
    description: 'Help out 25 times',
    icon: 'heart',
    tier: 'Gold',
    tone: 12,
    target: 25,
    category: 'family',
  },
  {
    id: 'a9',
    title: 'Scholar',
    description: 'Complete 50 learning tasks',
    icon: 'star',
    tier: 'Platinum',
    tone: 65,
    target: 50,
    category: 'learning',
    lockedByDefault: true,
  },
]

export const ACHIEVEMENT_DEFINITION_IDS = ACHIEVEMENT_DEFINITIONS.map((a) => a.id)
