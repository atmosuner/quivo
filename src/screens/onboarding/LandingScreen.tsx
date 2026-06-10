import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Button } from '../../components/index.ts'
import { auth } from '../../lib/firebase/app.ts'
import {
  googleAuthErrorMessage,
  GoogleRedirectPending,
  signInWithGoogle,
} from '../../lib/firebase/googleAuth.ts'
import { getUserProfile } from '../../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { PENDING_SETUP_ROLE_KEY } from '../../stores/bootstrap.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

export function LandingScreen() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParent = async () => {
    setError(null)
    setBusy(true)
    localStorage.setItem(PENDING_SETUP_ROLE_KEY, 'parent')

    let user = auth.currentUser
    if (!user?.providerData.some((p) => p.providerId === 'google.com')) {
      try {
        user = await signInWithGoogle()
      } catch (err) {
        if (err instanceof GoogleRedirectPending) return
        setError(googleAuthErrorMessage(err))
        setBusy(false)
        return
      }
    }

    try {
      const profile = await getUserProfile(user.uid)
      if (profile) {
        useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
        useSessionStore.getState().clearEffects()
        useParentGateStore.getState().clearSession()
        useAppStore.getState().resetNavigation()
        await useFamilyStore.getState().bootstrap()
        localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
        return
      }
    } catch {
      // no profile — proceed to setup
    }

    localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
    useAppStore.getState().setOnboardingScreen('parentSetup')
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
                Family adventures, tasks and achievements — together.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320, marginInline: 'auto' }}>
              {error && <div role="alert" style={errorStyle}>{error}</div>}

              <Button
                variant="primary"
                size="lg"
                block
                disabled={busy}
                onClick={() => void handleParent()}
              >
                {busy ? 'Signing in…' : 'Sign in with Google'}
              </Button>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-3)', margin: '4px 0 0' }}>
                Parents sign in here. Children tap their name when the app opens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const errorStyle: CSSProperties = {
  padding: '10px 14px',
  background: 'oklch(0.97 0.02 15)',
  borderRadius: 'var(--r-sm)',
  color: 'oklch(0.45 0.15 15)',
  fontSize: 14,
}
