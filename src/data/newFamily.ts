import type { AppSnapshot } from '../types/storage.ts'
import { CURRENT_SCHEMA_VERSION } from '../types/storage.ts'
import type { Child, ChildAvatar, Family } from '../types/domain.ts'

function getMondayIso(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  return monday.toISOString().slice(0, 10)
}

export function createNewFamilySnapshot(
  familyId: string,
  familyName: string,
  child: { id: string; name: string; avatar: ChildAvatar },
): AppSnapshot {
  const now = new Date().toISOString()

  const newChild: Child = {
    id: child.id,
    name: child.name,
    initial: child.name.charAt(0).toUpperCase(),
    avatar: child.avatar,
    totalXp: 0,
    level: 1,
    xpInLevel: 0,
    coins: 0,
    coinsPending: 0,
    habitStreak: 0,
    lastStreakDate: null,
    tasksCompletedLifetime: 0,
    booksReadLifetime: 0,
    weeklyXp: [0, 0, 0, 0, 0, 0, 0],
    weeklyXpStartDate: getMondayIso(),
  }

  const family: Family = {
    id: familyId,
    name: familyName,
    settings: {
      requireApprovalDefault: true,
      activeChildId: child.id,
    },
    children: [newChild],
    tasks: [],
    books: [],
    readingLogs: [],
    rewards: [],
    approvals: [],
    achievementProgress: [],
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    family,
    meta: {
      lastModified: now,
      createdAt: now,
    },
  }
}
