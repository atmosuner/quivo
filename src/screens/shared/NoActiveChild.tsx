import { EmptyState } from '../../components/index.ts'
import { user } from '../../components/icons/icons.tsx'

const User = user

/** Shown when family data loads but activeChildId does not match any child. */
export function NoActiveChild() {
  return (
    <div className="q-scroll">
      <EmptyState
        icon={<User size={32} />}
        title="No active profile"
        description="Choose a child in Settings or reset local data to restore the demo family."
      />
    </div>
  )
}
