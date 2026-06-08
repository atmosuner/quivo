import { create } from 'zustand'
import type {
  AppMode,
  ChildStackEntry,
  ChildTab,
  ParentScreen,
} from '../types/navigation.ts'

interface AppState {
  mode: AppMode
  activeTab: ChildTab
  childStack: ChildStackEntry[]
  parentScreen: ParentScreen
  setMode: (mode: AppMode) => void
  setActiveTab: (tab: ChildTab) => void
  pushChildScreen: (entry: ChildStackEntry) => void
  popChildScreen: () => void
  resetChildStack: () => void
  setParentScreen: (screen: ParentScreen) => void
  resetNavigation: () => void
}

const initialNavigation = {
  mode: 'child' as AppMode,
  activeTab: 'home' as ChildTab,
  childStack: [] as ChildStackEntry[],
  parentScreen: 'dash' as ParentScreen,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialNavigation,

  setMode: (mode) =>
    set({
      mode,
      ...(mode === 'parent' ? { parentScreen: 'dash' as ParentScreen } : {}),
    }),

  setActiveTab: (tab) => set({ activeTab: tab, childStack: [] }),

  pushChildScreen: (entry) =>
    set((state) => ({
      childStack: [...state.childStack, entry],
    })),

  popChildScreen: () =>
    set((state) => ({
      childStack: state.childStack.slice(0, -1),
    })),

  resetChildStack: () => set({ childStack: [] }),

  setParentScreen: (screen) => set({ parentScreen: screen }),

  resetNavigation: () => set(initialNavigation),
}))
