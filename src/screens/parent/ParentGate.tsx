import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { Button } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import { auth } from '../../lib/firebase/app.ts'
import {
  completeGoogleRedirectIfNeeded,
  googleAuthErrorMessage,
  GoogleRedirectPending,
  signInParentWithGoogle,
} from '../../lib/firebase/googleAuth.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Shield = shield

export function ParentGate() {
  const unlock = useParentGateStore((state) => state.unlock)
  const lock = useParentGateStore((state) => state.lock)

  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [hasGoogleLinked, setHasGoogleLinked] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setHasGoogleLinked(
        user?.providerData.some((provider) => provider.providerId === 'google.com') ?? false,
      )
    })
    return unsub
  }, [])

  useEffect(() => {
    let cancelled = false
    setBusy(true)
    setMessage('Checking sign-in…')

    void completeGoogleRedirectIfNeeded()
      .then((user) => {
        if (cancelled) return
        if (user) {
          unlock()
          return
        }
        setMessage(null)
      })
      .catch((error) => {
        if (!cancelled) setMessage(googleAuthErrorMessage(error))
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleGoogleSignIn = async () => {
    if (hasGoogleLinked) {
      unlock()
      return
    }

    setBusy(true)
    setMessage(null)
    try {
      await signInParentWithGoogle()
      unlock()
    } catch (error) {
      if (error instanceof GoogleRedirectPending) {
        setMessage('Redirecting to Google…')
        return
      }
      setMessage(googleAuthErrorMessage(error))
      setBusy(false)
    }
  }

  const exitToChild = () => {
    lock()
    useAppStore.getState().setMode('child')
  }

  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div className="pin-gate">
            <div
              className="g-brand"
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                boxShadow: 'var(--sh-brand)',
                margin: '0 auto',
              }}
            >
              <Shield size={30} />
            </div>

            <h1 className="t-h1" style={{ marginTop: 18 }}>
              Parent area
            </h1>
            <p
              className="t-body"
              style={{ marginTop: 8, maxWidth: 280, marginInline: 'auto' }}
            >
              Sign in with Google to manage tasks, approvals, and rewards.
            </p>

            <div style={{ marginTop: 28, width: '100%', maxWidth: 320, marginInline: 'auto' }}>
              {message && (
                <div className="pin-message" role={busy ? 'status' : 'alert'}>
                  {message}
                </div>
              )}
              <Button
                variant="primary"
                size="md"
                block
                disabled={busy}
                onClick={() => void handleGoogleSignIn()}
              >
                {busy
                  ? 'Signing in…'
                  : hasGoogleLinked
                    ? 'Continue as parent'
                    : 'Continue with Google'}
              </Button>
            </div>

            <Button
              variant="ghost"
              size="md"
              block
              style={{ marginTop: 18, maxWidth: 320, marginInline: 'auto' }}
              onClick={exitToChild}
            >
              Back to child view
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
