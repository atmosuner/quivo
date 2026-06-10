import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { ActionErrorBanner } from '../shared/ActionErrorBanner.tsx'
import { AddTaskScreen } from './AddTaskScreen.tsx'
import { ApprovalScreen } from './ApprovalScreen.tsx'
import { ParentAddBookScreen } from './ParentAddBookScreen.tsx'
import { ParentDashboard } from './ParentDashboard.tsx'
import { ParentRewardsScreen } from './ParentRewardsScreen.tsx'

export function ParentShell() {
  const parentScreen = useAppStore((state) => state.parentScreen)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const error = useFamilyStore((state) => state.error)
  const clearError = useFamilyStore((state) => state.clearError)
  const snapshot = useFamilyStore((state) => state.snapshot)

  if (isLoading) {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 80 }}>
              <div className="t-body">Loading family data…</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!snapshot) return null

  return (
    <div className="q-app">
      <div className="q-main">
        {parentScreen === 'dash' && <ParentDashboard />}
        {parentScreen === 'approval' && <ApprovalScreen />}
        {parentScreen === 'addtask' && <AddTaskScreen />}
        {parentScreen === 'parentrewards' && <ParentRewardsScreen />}
        {parentScreen === 'parentaddbook' && <ParentAddBookScreen />}
      </div>
      {error && (
        <ActionErrorBanner message={error} onDismiss={clearError} tabbed={false} />
      )}
    </div>
  )
}
