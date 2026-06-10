import { useAppStore } from '../../stores/appStore.ts'
import { ChildJoinScreen } from './ChildJoinScreen.tsx'
import { LandingScreen } from './LandingScreen.tsx'
import { ParentSetupScreen } from './ParentSetupScreen.tsx'

export function OnboardingShell() {
  const screen = useAppStore((state) => state.onboardingScreen)

  switch (screen) {
    case 'parentSetup': return <ParentSetupScreen />
    case 'childJoin': return <ChildJoinScreen />
    default: return <LandingScreen />
  }
}
