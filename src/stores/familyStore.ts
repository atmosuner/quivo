import { create } from 'zustand'
import type { AppSnapshot } from '../types/storage.ts'
import type { GrantEffect } from '../types/gamification.ts'
import type { DataRepository } from '../lib/storage/repository.ts'
import { localStorageRepository } from '../lib/storage/localStorage.ts'
import {
  generateParentPinSalt,
  hashParentPin,
} from '../lib/security/parentPin.ts'
import {
  loadFamily,
  resetFamily as resetFamilyService,
  switchActiveChild,
} from '../services/familyService.ts'
import { runDailyResetIfNeeded } from '../services/dailyResetService.ts'
import { addTask, submitTaskCompletion } from '../services/taskService.ts'
import type { CreateTaskInput } from '../services/taskService.ts'
import { addBook, proposeBook as proposeBookService, submitPageLog } from '../services/readingService.ts'
import type { AddBookInput } from '../services/readingService.ts'
import { createReward as createRewardService, requestRewardRedemption, toggleReward as toggleRewardService } from '../services/rewardService.ts'
import type { CreateRewardInput } from '../services/rewardService.ts'
import { approveApproval, declineApproval } from '../services/approvalService.ts'
import { downloadSnapshotJson } from '../lib/export/downloadJson.ts'
import { toUserErrorMessage } from '../lib/errors/userMessages.ts'
import { consumeRecoveryNotice } from '../lib/storage/localStorage.ts'
import { useAppStore } from './appStore.ts'
import { useSessionStore } from './sessionStore.ts'

interface FamilyState {
  snapshot: AppSnapshot | null
  isLoading: boolean
  error: string | null
  recoveryNotice: string | null
  repo: DataRepository
  setRepository: (repo: DataRepository) => void
  markReady: () => void
  bootstrap: () => Promise<void>
  reload: () => Promise<void>
  resetFamily: () => Promise<void>
  exportData: () => void
  clearError: () => void
  dismissRecoveryNotice: () => void
  switchActiveChild: (childId: string) => Promise<void>
  submitTaskCompletion: (taskId: string) => Promise<void>
  addBook: (childId: string, input: AddBookInput) => Promise<void>
  submitPageLog: (bookId: string, pages: number) => Promise<void>
  requestRewardRedemption: (childId: string, rewardId: string) => Promise<void>
  createReward: (input: CreateRewardInput) => Promise<void>
  toggleReward: (rewardId: string) => Promise<void>
  proposeBook: (childId: string, input: AddBookInput) => Promise<void>
  approveApproval: (approvalId: string) => Promise<void>
  declineApproval: (approvalId: string) => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<void>
  setChildPin: (childId: string, pin: string | null) => Promise<void>
  setParentPin: (pin: string) => Promise<void>
}

function enqueueServiceEffects(effects: GrantEffect[]): void {
  const deferDisplay = useAppStore.getState().mode === 'parent'
  useSessionStore.getState().enqueueEffects(effects, { deferDisplay })
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  snapshot: null,
  isLoading: true,
  error: null,
  recoveryNotice: null,
  repo: localStorageRepository,

  setRepository: (repo) => set({ repo }),

  markReady: () => set({ isLoading: false }),

  bootstrap: async () => {
    set({ isLoading: true, error: null })
    try {
      const { repo } = get()
      await runDailyResetIfNeeded(repo)
      const snapshot = await loadFamily(repo)
      const recoveryNotice = consumeRecoveryNotice()
      set({ snapshot, isLoading: false, recoveryNotice })
    } catch (error) {
      set({ error: toUserErrorMessage(error), isLoading: false })
    }
  },

  dismissRecoveryNotice: () => set({ recoveryNotice: null }),

  clearError: () => set({ error: null }),

  exportData: () => {
    const { snapshot } = get()
    if (!snapshot) {
      set({ error: 'No data to export yet.' })
      return
    }
    downloadSnapshotJson(snapshot)
    set({ error: null })
  },

  reload: async () => {
    set({ isLoading: true, error: null })
    try {
      const snapshot = await loadFamily(get().repo)
      set({ snapshot, isLoading: false })
    } catch (error) {
      set({ error: toUserErrorMessage(error), isLoading: false })
    }
  },

  resetFamily: async () => {
    set({ isLoading: true, error: null })
    try {
      const snapshot = await resetFamilyService(get().repo)
      useSessionStore.getState().clearEffects()
      set({ snapshot, isLoading: false })
    } catch (error) {
      set({ error: toUserErrorMessage(error), isLoading: false })
    }
  },

  switchActiveChild: async (childId) => {
    try {
      const result = await switchActiveChild(childId, get().repo)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  submitTaskCompletion: async (taskId) => {
    try {
      const result = await submitTaskCompletion(taskId, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  addBook: async (childId, input) => {
    try {
      const result = await addBook(childId, input, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  submitPageLog: async (bookId, pages) => {
    try {
      const result = await submitPageLog(bookId, pages, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  requestRewardRedemption: async (childId, rewardId) => {
    try {
      const result = await requestRewardRedemption(childId, rewardId, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  createReward: async (input) => {
    try {
      const result = await createRewardService(input, get().repo)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  toggleReward: async (rewardId) => {
    try {
      const result = await toggleRewardService(rewardId, get().repo)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  proposeBook: async (childId, input) => {
    try {
      const result = await proposeBookService(childId, input, get().repo)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  approveApproval: async (approvalId) => {
    try {
      const result = await approveApproval(approvalId, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  declineApproval: async (approvalId) => {
    try {
      const result = await declineApproval(approvalId, get().repo)
      enqueueServiceEffects(result.effects)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  createTask: async (input) => {
    try {
      const result = await addTask(input, get().repo)
      set({ snapshot: result.snapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  setChildPin: async (childId, pin) => {
    const { snapshot, repo } = get()
    if (!snapshot) return
    try {
      let pinHash: string | undefined
      let pinSalt: string | undefined
      if (pin) {
        pinSalt = generateParentPinSalt()
        pinHash = await hashParentPin(pin, pinSalt)
      }
      const updatedFamily = {
        ...snapshot.family,
        children: snapshot.family.children.map((c) =>
          c.id === childId
            ? { ...c, pinHash, pinSalt }
            : c,
        ),
      }
      const updatedSnapshot = { ...snapshot, family: updatedFamily }
      await repo.save(updatedSnapshot)
      set({ snapshot: updatedSnapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },

  setParentPin: async (pin) => {
    const { snapshot, repo } = get()
    if (!snapshot) return
    try {
      const parentPinSalt = generateParentPinSalt()
      const parentPinHash = await hashParentPin(pin, parentPinSalt)
      const updatedSnapshot = {
        ...snapshot,
        family: { ...snapshot.family, parentPinHash, parentPinSalt },
      }
      await repo.save(updatedSnapshot)
      set({ snapshot: updatedSnapshot, error: null })
    } catch (error) {
      set({ error: toUserErrorMessage(error) })
    }
  },
}))
