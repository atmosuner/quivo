/** Core domain entities for the Quivo MVP. */

// ─── Primitive unions ───────────────────────────────────────────────────────

export type TaskCategory =
  | 'reading'
  | 'responsibility'
  | 'learning'
  | 'health'
  | 'family'

export type TaskRepeat = 'once' | 'daily' | 'weekly'

export type TaskDifficulty = 1 | 2 | 3

export type TaskStatus = 'open' | 'pending_approval' | 'completed_today'

export type BookStatus = 'pending' | 'reading' | 'done'

export type ApprovalType =
  | 'task_completion'
  | 'reading_log'
  | 'reward_redemption'
  | 'book_proposal'

export type ApprovalStatus = 'pending' | 'approved' | 'declined'

// ─── Family settings ────────────────────────────────────────────────────────

export interface FamilySettings {
  /** Default for new tasks created by the parent. */
  requireApprovalDefault: boolean
  /** Active child profile shown in child mode. */
  activeChildId: string
}

// ─── Child ──────────────────────────────────────────────────────────────────

export interface ChildAvatar {
  hue1: number
  hue2: number
}

/**
 * XP (totalXp, level, xpInLevel) and coins (coins, coinsPending) are separate
 * economies. Spending or escrowing coins must never mutate XP fields.
 */
export interface Child {
  id: string
  name: string
  initial: string
  avatar: ChildAvatar

  // Progression (XP only)
  totalXp: number
  level: number
  xpInLevel: number

  // Spendable currency (coins only)
  coins: number
  coinsPending: number

  // Habit streak — stored minimum; reading streak is derived from logs
  habitStreak: number
  /** ISO date (YYYY-MM-DD) of last qualifying habit activity. */
  lastStreakDate: string | null

  // Denormalized lifetime stats (profile screen)
  tasksCompletedLifetime: number
  booksReadLifetime: number

  // Optional child PIN (stored as salted SHA-256 hash)
  pinHash?: string
  pinSalt?: string

  /**
   * XP earned per day for the profile week chart (index 0 = weeklyXpStartDate).
   * Avoids a full XP event log in MVP.
   */
  weeklyXp: [number, number, number, number, number, number, number]
  /** ISO date (YYYY-MM-DD) for weeklyXp[0], typically the Monday of the week. */
  weeklyXpStartDate: string
}

// ─── Tasks (instances only — no templates in MVP) ───────────────────────────

export interface Task {
  id: string
  childId: string
  title: string
  category: TaskCategory
  icon: string
  xp: number
  coins: number
  difficulty: TaskDifficulty
  estimatedMinutes: number
  repeat: TaskRepeat
  requiresApproval: boolean
  /** Whether this task appears on the child's list today. */
  activeToday: boolean
  status: TaskStatus
  /** ISO datetime when the task was marked complete, if applicable. */
  completedAt: string | null
}

// ─── Reading ────────────────────────────────────────────────────────────────

export interface Book {
  id: string
  childId: string
  title: string
  author: string
  totalPages: number
  pagesRead: number
  status: BookStatus
  coverTone: number
  /** ISO datetime */
  startedAt: string
  /** ISO datetime; set when the book is finished. */
  finishedAt: string | null
}

/**
 * Immutable committed reading log.
 * Created only after instant grant or parent approval — never updated in place.
 * Pending reading before approval lives on Approval.pages, not here.
 */
export interface ReadingLog {
  id: string
  childId: string
  bookId: string
  pages: number
  /** ISO datetime */
  loggedAt: string
  xpGranted: number
  coinsGranted: number
}

// ─── Rewards (family-wide catalog) ──────────────────────────────────────────

export interface Reward {
  id: string
  title: string
  description: string
  cost: number
  coverTone: number
  active: boolean
}

// ─── Unified approval queue ─────────────────────────────────────────────────

/**
 * Single queue for task completions, reading logs, and reward redemptions.
 * Flat context fields — pending reading pages sit here until approved.
 * Resolved rows are the audit trail; prune oldest when over MAX_RESOLVED_APPROVALS.
 */
export interface Approval {
  id: string
  type: ApprovalType
  childId: string
  status: ApprovalStatus
  /** ISO datetime */
  createdAt: string
  /** ISO datetime; set when approved or declined. */
  resolvedAt: string | null
  /** XP to grant on approve (0 on decline). */
  xp: number
  /** Coins to grant on approve (0 on decline). Redemption spends via escrow. */
  coins: number
  taskId: string | null
  bookId: string | null
  rewardId: string | null
  /** Pending pages for reading_log approvals. */
  pages: number | null
  note: string | null
}

// ─── Achievements (progress only — definitions are bundled in code) ───────────

export interface AchievementProgress {
  achievementId: string
  childId: string
  current: number
  /** ISO datetime; null while locked/in progress. */
  unlockedAt: string | null
}

// ─── Family aggregate ───────────────────────────────────────────────────────

export interface Family {
  id: string
  name: string
  settings: FamilySettings
  children: Child[]
  tasks: Task[]
  books: Book[]
  readingLogs: ReadingLog[]
  rewards: Reward[]
  approvals: Approval[]
  achievementProgress: AchievementProgress[]
}
