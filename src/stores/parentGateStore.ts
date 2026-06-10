import { create } from 'zustand'

const SESSION_MS = 15 * 60 * 1000

interface ParentGateState {
  isUnlocked: boolean
  unlockedAt: number | null
  isSessionValid: () => boolean
  unlock: () => void
  lock: () => void
  clearSession: () => void
}

export const useParentGateStore = create<ParentGateState>((set, get) => ({
  isUnlocked: false,
  unlockedAt: null,

  isSessionValid: () => {
    const { isUnlocked, unlockedAt } = get()
    if (!isUnlocked || unlockedAt == null) return false
    return Date.now() - unlockedAt < SESSION_MS
  },

  unlock: () => set({ isUnlocked: true, unlockedAt: Date.now() }),

  lock: () => set({ isUnlocked: false, unlockedAt: null }),

  clearSession: () => set({ isUnlocked: false, unlockedAt: null }),
}))
