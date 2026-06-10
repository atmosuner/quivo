/** Child-mode bottom tab keys (match design prototype). */
export type ChildTab = 'home' | 'quests' | 'rewards' | 'achievements' | 'profile'

/** App mode — onboarding shown before any session is established. */
export type AppMode = 'onboarding' | 'child' | 'parent'

/** Sub-screen within the onboarding flow. */
export type OnboardingScreen =
  | 'landing'
  | 'parentSetup'
  | 'inviteSent'
  | 'childJoin'
  | 'childWaiting'

/** Child stack screens pushed over tab content. */
export type ChildStackScreen =
  | 'task'
  | 'reward'
  | 'achievement'
  | 'reading'
  | 'book'
  | 'addbook'
  | 'settings'

export interface ChildStackEntry {
  screen: ChildStackScreen
  /** Entity id or opaque payload id depending on screen. */
  dataId: string
}

/** Parent stack screens (no tab bar in parent mode). */
export type ParentScreen = 'dash' | 'addtask' | 'approval' | 'parentrewards' | 'parentaddbook' | 'reports'

export interface NavigationState {
  mode: AppMode
  childTab: ChildTab
  childStack: ChildStackEntry[]
  parentStack: ParentScreen[]
}
