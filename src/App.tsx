import { useEffect } from 'react'
import { ChildShell } from './screens/shared/ChildShell.tsx'
import { BootstrapError } from './screens/shared/BootstrapError.tsx'
import { ParentGate } from './screens/parent/ParentGate.tsx'
import { ParentShell } from './screens/parent/ParentShell.tsx'
import { bootstrapQuivoApp } from './stores/bootstrap.ts'
import { useAppStore } from './stores/appStore.ts'
import { useFamilyStore } from './stores/familyStore.ts'
import { useParentGateStore } from './stores/parentGateStore.ts'

export default function App() {
  const mode = useAppStore((state) => state.mode)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const error = useFamilyStore((state) => state.error)
  const snapshot = useFamilyStore((state) => state.snapshot)
  const isSessionValid = useParentGateStore((state) => state.isSessionValid)

  useEffect(() => {
    void bootstrapQuivoApp()
  }, [])

  if (isLoading) {
    return (
      <div className="q-app">
        <div className="q-scroll">
          <div className="q-body" style={{ paddingTop: 80 }}>
            <div className="t-body" role="status">Loading Quivo…</div>
          </div>
        </div>
      </div>
    )
  }

  if (!snapshot) {
    return <BootstrapError message={error ?? 'Family data could not be loaded.'} />
  }

  if (mode === 'parent') {
    if (!isSessionValid()) {
      return <ParentGate />
    }
    return <ParentShell />
  }

  return <ChildShell />
}
