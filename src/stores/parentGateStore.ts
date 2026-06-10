import { create } from 'zustand'
import { useMemo } from 'react'

export const PARENT_SESSION_MS = 15 * 60 * 1000

/** Subscribe to primitive gate state — selecting the store method alone does not re-render. */
export function useParentSessionValid(): boolean {
  const isUnlocked = useParentGateStore((state) => state.isUnlocked)
  const unlockedAt = useParentGateStore((state) => state.unlockedAt)
  return useMemo(() => {
    if (!isUnlocked || unlockedAt == null) return false
    return Date.now() - unlockedAt < PARENT_SESSION_MS
  }, [isUnlocked, unlockedAt])
}

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
    return Date.now() - unlockedAt < PARENT_SESSION_MS
  },

  unlock: () => set({ isUnlocked: true, unlockedAt: Date.now() }),

  lock: () => set({ isUnlocked: false, unlockedAt: null }),

  clearSession: () => set({ isUnlocked: false, unlockedAt: null }),
}))
