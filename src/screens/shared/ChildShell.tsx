import { useEffect } from 'react'
import { Celebration, TabBar } from '../../components/index.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'
import type { ChildTab } from '../../types/navigation.ts'
import {
  AchievementsScreen,
  HomeScreen,
  ProfileScreen,
  QuestsScreen,
  RewardsScreen,
} from '../child/index.ts'
import { getActiveChild } from './selectors.ts'
import { ChildStack } from './ChildStack.tsx'
import { ChildSelector } from './ChildSelector.tsx'
import { NoActiveChild } from './NoActiveChild.tsx'
import { ActionErrorBanner } from './ActionErrorBanner.tsx'
import { RecoveryBanner } from './RecoveryBanner.tsx'
import { mapGrantEffectToCelebration } from './effectToCelebration.ts'

function ChildTabContent({ tab }: { tab: ChildTab }) {
  switch (tab) {
    case 'home':
      return <HomeScreen />
    case 'quests':
      return <QuestsScreen />
    case 'rewards':
      return <RewardsScreen />
    case 'achievements':
      return <AchievementsScreen />
    case 'profile':
      return <ProfileScreen />
    default:
      return <HomeScreen />
  }
}

export function ChildShell() {
  const activeTab = useAppStore((state) => state.activeTab)
  const setActiveTab = useAppStore((state) => state.setActiveTab)
  const childStack = useAppStore((state) => state.childStack)
  const popChildScreen = useAppStore((state) => state.popChildScreen)
  const childUnlocked = useAppStore((state) => state.childUnlocked)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const error = useFamilyStore((state) => state.error)
  const snapshot = useFamilyStore((state) => state.snapshot)
  const recoveryNotice = useFamilyStore((state) => state.recoveryNotice)
  const dismissRecoveryNotice = useFamilyStore((state) => state.dismissRecoveryNotice)
  const clearError = useFamilyStore((state) => state.clearError)

  const currentEffect = useSessionStore((state) => state.currentEffect)
  const celebrationVisible = useSessionStore((state) => state.celebrationVisible)
  const dismissCurrentEffect = useSessionStore((state) => state.dismissCurrentEffect)

  const topStack = childStack[childStack.length - 1]
  const celebrationData =
    celebrationVisible && currentEffect
      ? mapGrantEffectToCelebration(currentEffect)
      : null

  useEffect(() => {
    if (celebrationVisible && currentEffect && !celebrationData) {
      dismissCurrentEffect()
    }
  }, [celebrationVisible, currentEffect, celebrationData, dismissCurrentEffect])

  useEffect(() => {
    const session = useSessionStore.getState()
    if (
      !session.celebrationVisible &&
      !session.currentEffect &&
      session.effectQueue.length > 0
    ) {
      session.showNextEffect()
    }
  }, [])

  if (!isLoading && snapshot && !childUnlocked) {
    return <ChildSelector />
  }

  return (
    <div className="q-app">
      {recoveryNotice && (
        <RecoveryBanner message={recoveryNotice} onDismiss={dismissRecoveryNotice} />
      )}

      <div className="q-main">
        {isLoading && (
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 80 }}>
              <div className="t-body">Loading family data…</div>
            </div>
          </div>
        )}

        {!isLoading && snapshot && !getActiveChild(snapshot.family) && <NoActiveChild />}

        {!isLoading && snapshot && getActiveChild(snapshot.family) && !topStack && (
          <ChildTabContent tab={activeTab} />
        )}
      </div>

      {!isLoading && snapshot && getActiveChild(snapshot.family) && !topStack && (
        <TabBar active={activeTab} onTab={setActiveTab} />
      )}

      {error && !isLoading && (
        <ActionErrorBanner
          message={error}
          onDismiss={clearError}
          tabbed={!topStack}
        />
      )}

      {topStack && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ChildStack entry={topStack} onBack={popChildScreen} />
        </div>
      )}

      <Celebration data={celebrationData} onClose={dismissCurrentEffect} />
    </div>
  )
}
