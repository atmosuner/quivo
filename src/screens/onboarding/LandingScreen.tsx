import { useState } from 'react'
import { Button } from '../../components/index.ts'
import { auth } from '../../lib/firebase/app.ts'
import {
  googleAuthErrorMessage,
  GoogleRedirectPending,
  signInWithGoogle,
} from '../../lib/firebase/googleAuth.ts'
import { getUserProfile } from '../../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { LocalStorageRepository } from '../../lib/storage/localStorage.ts'
import { DEMO_STORAGE_KEY, PENDING_SETUP_ROLE_KEY } from '../../stores/bootstrap.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

type Flow = 'idle' | 'parent' | 'child'

export function LandingScreen() {
  const [flow, setFlow] = useState<Flow>('idle')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParent = async () => {
    setFlow('parent')
    setError(null)
    setBusy(true)
    localStorage.setItem(PENDING_SETUP_ROLE_KEY, 'parent')

    // Step 1: Google sign-in
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

    // Step 2: Check for existing profile + load family if it exists
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
      // profile load error — proceed to setup as new parent
    }

    localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
    useAppStore.getState().setOnboardingScreen('parentSetup')
  }

  const handleChild = async () => {
    setFlow('child')
    setError(null)
    setBusy(true)
    localStorage.setItem(PENDING_SETUP_ROLE_KEY, 'child')

    // Step 1: Google sign-in
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

    // Step 2: Check for existing profile
    try {
      const profile = await getUserProfile(user.uid)
      if (profile) {
        useFamilyStore.getState().setRepository(new FirestoreRepository(profile.familyId))
        useSessionStore.getState().clearEffects()
        useParentGateStore.getState().clearSession()
        useAppStore.getState().resetNavigation()
        await useFamilyStore.getState().bootstrap()
        const snapshot = useFamilyStore.getState().snapshot
        if (snapshot && profile.childId && snapshot.family.settings.activeChildId !== profile.childId) {
          const exists = snapshot.family.children.some((c) => c.id === profile.childId)
          if (exists) await useFamilyStore.getState().switchActiveChild(profile.childId)
        }
        localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
        return
      }
    } catch {
      // profile load error — fall through to waiting screen
    }

    localStorage.removeItem(PENDING_SETUP_ROLE_KEY)
    useAppStore.getState().setOnboardingScreen('childWaiting')
  }

  const handleDemo = async () => {
    setFlow('idle')
    setError(null)
    setBusy(true)
    localStorage.setItem(DEMO_STORAGE_KEY, 'true')
    useFamilyStore.getState().setRepository(new LocalStorageRepository())
    useSessionStore.getState().clearEffects()
    useParentGateStore.getState().clearSession()
    useAppStore.getState().resetNavigation()
    await useFamilyStore.getState().bootstrap()
  }

  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div className="q-body" style={{ paddingTop: 80, paddingBottom: 48 }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
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
              {error && (
                <div
                  role="alert"
                  style={{
                    padding: '10px 14px',
                    background: 'oklch(0.97 0.02 15)',
                    borderRadius: 'var(--r-sm)',
                    color: 'oklch(0.45 0.15 15)',
                    fontSize: 14,
                  }}
                >
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                block
                disabled={busy}
                onClick={() => void handleParent()}
              >
                {busy && flow === 'parent' ? 'Signing in…' : "I'm a Parent"}
              </Button>
              <Button
                variant="tint"
                size="lg"
                block
                disabled={busy}
                onClick={() => void handleChild()}
              >
                {busy && flow === 'child' ? 'Signing in…' : "I'm a Child"}
              </Button>

              <div style={{ position: 'relative', textAlign: 'center', margin: '4px 0' }}>
                <div style={{ height: 1, background: 'var(--line)', position: 'absolute', inset: '50% 0 auto' }} />
                <span style={{ position: 'relative', background: 'var(--bg)', padding: '0 12px', color: 'var(--ink-3)', fontSize: 13 }}>or</span>
              </div>

              <Button
                variant="ghost"
                size="md"
                block
                disabled={busy}
                onClick={() => void handleDemo()}
              >
                {busy && flow === 'idle' ? 'Loading…' : 'Try it out'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
