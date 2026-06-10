import { Button } from '../../components/index.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { LandingScreen } from './LandingScreen.tsx'
import { ParentSetupScreen } from './ParentSetupScreen.tsx'
import { InviteSentScreen } from './InviteSentScreen.tsx'
import { ChildJoinScreen } from './ChildJoinScreen.tsx'

function ChildWaitingScreen() {
  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div className="q-body" style={{ paddingTop: 80, paddingBottom: 48, textAlign: 'center' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'var(--brand-tint)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 24px',
                fontSize: 32,
              }}
            >
              📬
            </div>
            <h1 className="t-h1" style={{ marginBottom: 10 }}>Check your email</h1>
            <p className="t-body" style={{ color: 'var(--ink-2)', maxWidth: 280, marginInline: 'auto', marginBottom: 32 }}>
              You don't have an account yet. Ask your parent to invite you to Quivo — they'll send you a link by email.
            </p>
            <Button
              variant="ghost"
              size="md"
              onClick={() => useAppStore.getState().setOnboardingScreen('landing')}
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OnboardingShell() {
  const screen = useAppStore((state) => state.onboardingScreen)

  switch (screen) {
    case 'parentSetup':
      return <ParentSetupScreen />
    case 'inviteSent':
      return <InviteSentScreen />
    case 'childJoin':
      return <ChildJoinScreen />
    case 'childWaiting':
      return <ChildWaitingScreen />
    default:
      return <LandingScreen />
  }
}
