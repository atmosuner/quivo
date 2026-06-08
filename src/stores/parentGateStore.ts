import { create } from 'zustand'

const SESSION_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 5
const COOLDOWN_MS = 60 * 1000

interface ParentGateState {
  isUnlocked: boolean
  unlockedAt: number | null
  failedAttempts: number
  cooldownUntil: number | null
  pinChangeMode: boolean
  isSessionValid: () => boolean
  isInCooldown: () => boolean
  cooldownRemainingMs: () => number
  unlock: () => void
  lock: () => void
  startPinChange: () => void
  clearPinChange: () => void
  recordFailedAttempt: () => void
  clearSession: () => void
}

export const useParentGateStore = create<ParentGateState>((set, get) => ({
  isUnlocked: false,
  unlockedAt: null,
  failedAttempts: 0,
  cooldownUntil: null,
  pinChangeMode: false,

  isSessionValid: () => {
    const { isUnlocked, unlockedAt } = get()
    if (!isUnlocked || unlockedAt == null) return false
    return Date.now() - unlockedAt < SESSION_MS
  },

  isInCooldown: () => {
    const { cooldownUntil } = get()
    return cooldownUntil != null && Date.now() < cooldownUntil
  },

  cooldownRemainingMs: () => {
    const { cooldownUntil } = get()
    if (cooldownUntil == null) return 0
    return Math.max(0, cooldownUntil - Date.now())
  },

  unlock: () => {
    set({
      isUnlocked: true,
      unlockedAt: Date.now(),
      failedAttempts: 0,
      cooldownUntil: null,
    })
  },

  lock: () => {
    set({ isUnlocked: false, unlockedAt: null })
  },

  startPinChange: () => {
    set({
      pinChangeMode: true,
      isUnlocked: false,
      unlockedAt: null,
      failedAttempts: 0,
      cooldownUntil: null,
    })
  },

  clearPinChange: () => {
    set({ pinChangeMode: false })
  },

  recordFailedAttempt: () => {
    const nextAttempts = get().failedAttempts + 1
    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      set({
        failedAttempts: 0,
        cooldownUntil: Date.now() + COOLDOWN_MS,
      })
      return
    }
    set({ failedAttempts: nextAttempts })
  },

  clearSession: () => {
    set({
      isUnlocked: false,
      unlockedAt: null,
      failedAttempts: 0,
      cooldownUntil: null,
      pinChangeMode: false,
    })
  },
}))
