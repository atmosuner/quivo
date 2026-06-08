import { create } from 'zustand'
import type { GrantEffect } from '../types/gamification.ts'

interface SessionState {
  effectQueue: GrantEffect[]
  currentEffect: GrantEffect | null
  celebrationVisible: boolean
  enqueueEffects: (
    effects: GrantEffect[],
    options?: { deferDisplay?: boolean },
  ) => void
  showNextEffect: () => void
  dismissCurrentEffect: () => void
  clearEffects: () => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  effectQueue: [],
  currentEffect: null,
  celebrationVisible: false,

  enqueueEffects: (effects, options) => {
    if (!effects.length) return
    set((state) => ({
      effectQueue: [...state.effectQueue, ...effects],
    }))

    if (options?.deferDisplay) return

    const { celebrationVisible, currentEffect } = get()
    if (!celebrationVisible && !currentEffect) {
      get().showNextEffect()
    }
  },

  showNextEffect: () => {
    let queue = get().effectQueue

    while (queue.length > 0) {
      const [currentEffect, ...rest] = queue
      queue = rest

      if (currentEffect.type === 'STREAK_UPDATED') {
        set({ effectQueue: queue })
        continue
      }

      set({
        currentEffect,
        effectQueue: queue,
        celebrationVisible: true,
      })
      return
    }

    set({ currentEffect: null, celebrationVisible: false, effectQueue: [] })
  },

  dismissCurrentEffect: () => {
    set({ currentEffect: null, celebrationVisible: false })
    get().showNextEffect()
  },

  clearEffects: () => {
    set({
      effectQueue: [],
      currentEffect: null,
      celebrationVisible: false,
    })
  },
}))
