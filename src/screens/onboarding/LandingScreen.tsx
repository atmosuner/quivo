import { useState } from 'react'
import type { CSSProperties } from 'react'
import { isSignInWithEmailLink } from 'firebase/auth'
import { Button } from '../../components/index.ts'
import { auth } from '../../lib/firebase/app.ts'
import {
  googleAuthErrorMessage,
  GoogleRedirectPending,
  signInWithGoogle,
} from '../../lib/firebase/googleAuth.ts'
import { sendChildSignInLink } from '../../lib/firebase/emailInvite.ts'
import { getUserProfile } from '../../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { PENDING_SETUP_ROLE_KEY } from '../../stores/bootstrap.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

type Step = 'landing' | 'childEmail' | 'childLinkSent'

export function LandingScreen() {
  const [step, setStep] = useState<Step>('landing')
  const [childEmail, setChildEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pastedLink, setPastedLink] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)

  // ── Parent ──────────────────────────────────────────────────────────────────

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

  // ── Child email sign-in ─────────────────────────────────────────────────────

  const handleSendChildLink = async () => {
    if (!childEmail.trim()) {
      setError('Please enter your email address.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await sendChildSignInLink(childEmail.trim())
      setStep('childLinkSent')
    } catch (err) {
      const code = (err as { code?: string })?.code
      setError(
        code === 'auth/invalid-email'
          ? 'That doesn\'t look like a valid email address.'
          : code === 'auth/operation-not-allowed'
            ? 'Email sign-in is not enabled. Enable Email/Link in Firebase Console → Authentication.'
            : 'Could not send the link. Check your email address and try again.',
      )
    } finally {
      setBusy(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (step === 'childEmail') {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 64, paddingBottom: 48 }}>
              <div style={{ maxWidth: 340, marginInline: 'auto' }}>
                <h1 className="t-h1" style={{ marginBottom: 8 }}>Sign in to Quivo</h1>
                <p className="t-body" style={{ color: 'var(--ink-2)', marginBottom: 28 }}>
                  Enter your email and we'll send you a sign-in link. Works with any email address.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="t-label">Email address</label>
                    <input
                      className="field-input"
                      type="email"
                      placeholder="your@email.com"
                      value={childEmail}
                      onChange={(e) => setChildEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleSendChildLink() }}
                      autoFocus
                    />
                  </div>

                  {error && <div role="alert" style={errorStyle}>{error}</div>}

                  <Button
                    variant="primary"
                    size="lg"
                    block
                    disabled={busy}
                    onClick={() => void handleSendChildLink()}
                  >
                    {busy ? 'Sending…' : 'Send sign-in link'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    block
                    disabled={busy}
                    onClick={() => { setStep('landing'); setError(null) }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handlePasteLink = () => {
    setPasteError(null)
    const trimmed = pastedLink.trim()
    if (!trimmed) {
      setPasteError('Please paste the link from your email.')
      return
    }
    let url: URL
    try {
      url = new URL(trimmed)
    } catch {
      setPasteError('That doesn\'t look like a valid link. Copy the full URL from your email.')
      return
    }
    // Must be same origin + same base path as the app
    const appBase = window.location.origin + (import.meta.env.BASE_URL ?? '/')
    if (!trimmed.startsWith(appBase.replace(/\/$/, ''))) {
      setPasteError('This link doesn\'t match the Quivo app. Make sure you copied the full link.')
      return
    }
    if (!isSignInWithEmailLink(auth, trimmed)) {
      setPasteError('This doesn\'t appear to be a sign-in link. Check your email for the correct link.')
      return
    }
    window.location.replace(url.toString())
  }

  if (step === 'childLinkSent') {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 80, paddingBottom: 48 }}>
              <div style={{ maxWidth: 340, marginInline: 'auto', textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'var(--brand-tint)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 20px',
                    fontSize: 28,
                  }}
                >
                  ✉️
                </div>
                <h1 className="t-h1" style={{ marginBottom: 8 }}>Check your email</h1>
                <p className="t-body" style={{ color: 'var(--ink-2)', marginBottom: 28 }}>
                  We sent a sign-in link to <strong>{childEmail}</strong>. Tap the link in your email to sign in.
                </p>

                <div
                  style={{
                    textAlign: 'left',
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-lg)',
                    padding: '16px',
                    boxShadow: 'var(--sh-1)',
                    marginBottom: 20,
                  }}
                >
                  <div className="t-eyebrow" style={{ marginBottom: 8 }}>On iPhone? Paste the link here</div>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>
                    iOS home screen apps can't open email links directly. Copy the link from your email and paste it below.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      className="field-input"
                      type="url"
                      placeholder="Paste sign-in link…"
                      value={pastedLink}
                      onChange={(e) => setPastedLink(e.target.value)}
                    />
                    {pasteError && (
                      <div role="alert" style={errorStyle}>{pasteError}</div>
                    )}
                    <Button
                      variant="tint"
                      size="md"
                      block
                      onClick={handlePasteLink}
                    >
                      Continue with pasted link
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => { setStep('childEmail'); setError(null) }}
                >
                  Use a different email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
              {error && <div role="alert" style={errorStyle}>{error}</div>}

              <Button
                variant="primary"
                size="lg"
                block
                disabled={busy}
                onClick={() => void handleParent()}
              >
                {busy ? 'Signing in…' : "I'm a Parent"}
              </Button>

              <Button
                variant="tint"
                size="lg"
                block
                disabled={busy}
                onClick={() => { setStep('childEmail'); setError(null) }}
              >
                I'm a Child
              </Button>
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
