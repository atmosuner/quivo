import { create } from 'zustand'
import type {
  AppMode,
  ChildStackEntry,
  ChildTab,
  OnboardingScreen,
  ParentScreen,
} from '../types/navigation.ts'

interface AppState {
  mode: AppMode
  onboardingScreen: OnboardingScreen
  activeTab: ChildTab
  childStack: ChildStackEntry[]
  parentScreen: ParentScreen
  setMode: (mode: AppMode) => void
  setOnboardingScreen: (screen: OnboardingScreen) => void
  setActiveTab: (tab: ChildTab) => void
  pushChildScreen: (entry: ChildStackEntry) => void
  popChildScreen: () => void
  resetChildStack: () => void
  setParentScreen: (screen: ParentScreen) => void
  resetNavigation: () => void
}

const childNavigation = {
  mode: 'child' as AppMode,
  onboardingScreen: 'landing' as OnboardingScreen,
  activeTab: 'home' as ChildTab,
  childStack: [] as ChildStackEntry[],
  parentScreen: 'dash' as ParentScreen,
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'onboarding',
  onboardingScreen: 'landing',
  activeTab: 'home',
  childStack: [],
  parentScreen: 'dash',

  setMode: (mode) =>
    set({
      mode,
      ...(mode === 'parent' ? { parentScreen: 'dash' as ParentScreen } : {}),
    }),

  setOnboardingScreen: (screen) => set({ onboardingScreen: screen }),

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

  resetNavigation: () => set(childNavigation),
}))
