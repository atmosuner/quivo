import { useAppStore } from '../../stores/appStore.ts'
import { LandingScreen } from './LandingScreen.tsx'
import { ParentSetupScreen } from './ParentSetupScreen.tsx'

export function OnboardingShell() {
  const screen = useAppStore((state) => state.onboardingScreen)

  switch (screen) {
    case 'parentSetup':
      return <ParentSetupScreen />
    default:
      return <LandingScreen />
  }
}
