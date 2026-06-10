import { Button } from '../../components/index.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'

export function InviteSentScreen() {
  const unlock = useParentGateStore((state) => state.unlock)

  const goToDashboard = () => {
    unlock()
    useAppStore.getState().setMode('parent')
  }

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
                background: 'var(--success-tint)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 24px',
                fontSize: 32,
              }}
            >
              ✉️
            </div>

            <h1 className="t-h1" style={{ marginBottom: 10 }}>Invitation sent!</h1>
            <p className="t-body" style={{ color: 'var(--ink-2)', maxWidth: 280, marginInline: 'auto', marginBottom: 40 }}>
              Your child will receive an email with a link to join Quivo. Once they sign in, they'll appear in your family.
            </p>

            <div style={{ maxWidth: 320, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button variant="primary" size="lg" block onClick={goToDashboard}>
                Go to parent dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
