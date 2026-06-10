import { useEffect } from 'react'
import { ChildShell } from './screens/shared/ChildShell.tsx'
import { BootstrapError } from './screens/shared/BootstrapError.tsx'
import { ParentGate } from './screens/parent/ParentGate.tsx'
import { ParentShell } from './screens/parent/ParentShell.tsx'
import { OnboardingShell } from './screens/onboarding/OnboardingShell.tsx'
import { bootstrapQuivoApp } from './stores/bootstrap.ts'
import { useAppStore } from './stores/appStore.ts'
import { useFamilyStore } from './stores/familyStore.ts'
import { useParentSessionValid } from './stores/parentGateStore.ts'

export default function App() {
  const mode = useAppStore((state) => state.mode)
  const deviceRole = useAppStore((state) => state.deviceRole)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const error = useFamilyStore((state) => state.error)
  const snapshot = useFamilyStore((state) => state.snapshot)
  const parentSessionValid = useParentSessionValid()

  useEffect(() => {
    void bootstrapQuivoApp()
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const { snapshot: current, isLoading: loading } = useFamilyStore.getState()
        if (current && !loading) void useFamilyStore.getState().reload()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  if (isLoading) {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 80 }}>
              <div className="t-body" role="status">Loading Quivo…</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'onboarding') {
    return <OnboardingShell />
  }

  if (!snapshot) {
    return <BootstrapError message={error ?? 'Family data could not be loaded.'} />
  }

  if (mode === 'parent' && deviceRole !== 'child') {
    if (!parentSessionValid) {
      return <ParentGate />
    }
    return <ParentShell />
  }

  return <ChildShell />
}
