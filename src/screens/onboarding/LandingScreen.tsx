import { useState } from 'react'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { signInWithGoogle, googleAuthErrorMessage } from '../../lib/firebase/googleAuth.ts'
import { getUserProfile } from '../../lib/firebase/userProfile.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

export function LandingScreen() {
  const setOnboardingScreen = useAppStore((state) => state.setOnboardingScreen)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParent = async () => {
    setBusy(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      const profile = await getUserProfile(user.uid)
      if (!profile) {
        useAppStore.getState().setDeviceRole('parent')
        setOnboardingScreen('parentSetup')
        return
      }
      useAppStore.getState().setDeviceRole('parent')
      useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
      useSessionStore.getState().clearEffects()
      await useFamilyStore.getState().bootstrap()
      useAppStore.getState().setMode('parent')
    } catch (err) {
      setError(googleAuthErrorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div className="q-body" style={{ paddingTop: 80, paddingBottom: 48 }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div
                className="g-brand"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 20px',
                  boxShadow: 'var(--sh-brand)',
                }}
              >
                <span style={{ fontSize: 36, color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>Q</span>
              </div>
              <h1 className="t-h1" style={{ marginBottom: 8 }}>Welcome to Quivo</h1>
              <p className="t-body" style={{ color: 'var(--ink-2)', maxWidth: 280, marginInline: 'auto' }}>
                What kind of device is this?
              </p>
            </div>

            <div style={{ maxWidth: 320, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <DeviceChoice
                emoji="👨‍👩‍👧"
                title="Parent device"
                sub={busy ? 'Signing in…' : 'Sign in with Google to manage your family'}
                onClick={() => { void handleParent() }}
                disabled={busy}
              />
              <DeviceChoice
                emoji="🧒"
                title="Child device"
                sub="Scan the code from your parent's device to connect"
                onClick={() => setOnboardingScreen('childJoin')}
                disabled={busy}
              />
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  maxWidth: 320,
                  marginInline: 'auto',
                  marginTop: 16,
                  padding: '10px 14px',
                  background: 'oklch(0.97 0.02 15)',
                  borderRadius: 'var(--r-sm)',
                  color: 'oklch(0.45 0.15 15)',
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceChoice({
  emoji,
  title,
  sub,
  onClick,
  disabled,
}: {
  emoji: string
  title: string
  sub: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="pressable"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        background: 'var(--surface)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-2)',
        border: '1px solid var(--line-soft)',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        font: 'inherit',
        width: '100%',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{emoji}</div>
      <div>
        <div className="t-h3" style={{ fontSize: 16, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>{sub}</div>
      </div>
    </button>
  )
}
