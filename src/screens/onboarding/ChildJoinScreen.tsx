import { useEffect, useState } from 'react'
import { Button } from '../../components/index.ts'
import { detectEmailLinkSignIn, completeEmailLinkSignIn } from '../../lib/firebase/emailInvite.ts'
import { saveUserProfile } from '../../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

type Phase = 'confirm' | 'completing' | 'error'

export function ChildJoinScreen() {
  const linkData = detectEmailLinkSignIn()
  const [email, setEmail] = useState(linkData?.email ?? '')
  const [phase, setPhase] = useState<Phase>('confirm')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (linkData?.email) {
      void completeJoin(linkData.email)
    }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const completeJoin = async (emailAddr: string) => {
    if (!linkData) return
    setPhase('completing')
    setErrorMsg(null)
    try {
      const user = await completeEmailLinkSignIn(emailAddr)

      await saveUserProfile(user.uid, {
        role: 'child',
        familyId: linkData.familyId,
        childId: linkData.childId,
        createdAt: new Date().toISOString(),
      })

      useFamilyStore.getState().setRepository(new FirestoreRepository(linkData.familyId))
      useSessionStore.getState().clearEffects()
      useParentGateStore.getState().clearSession()
      useAppStore.getState().resetNavigation()
      await useFamilyStore.getState().bootstrap()

      const snapshot = useFamilyStore.getState().snapshot
      if (snapshot && snapshot.family.settings.activeChildId !== linkData.childId) {
        const exists = snapshot.family.children.some((c) => c.id === linkData.childId)
        if (exists) await useFamilyStore.getState().switchActiveChild(linkData.childId)
      }
    } catch (err) {
      const msg = (err as { code?: string; message?: string })
      const errorMessage =
        msg.code === 'auth/invalid-action-code'
          ? 'This invitation link has expired or already been used. Ask your parent to send a new one.'
          : msg.code === 'auth/invalid-email'
            ? 'That email address does not match the invitation.'
            : msg.message ?? 'Could not complete sign-in. Please try again.'
      setErrorMsg(errorMessage)
      setPhase('error')
    }
  }

  if (!linkData) {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div className="q-body" style={{ paddingTop: 80, textAlign: 'center' }}>
              <h1 className="t-h1" style={{ marginBottom: 10 }}>Invalid link</h1>
              <p className="t-body" style={{ color: 'var(--ink-2)' }}>
                This link is not a valid invitation. Ask your parent to send a new one.
              </p>
              <Button
                variant="ghost"
                size="md"
                style={{ marginTop: 24 }}
                onClick={() => useAppStore.getState().setOnboardingScreen('landing')}
              >
                Back to start
              </Button>
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
            <div style={{ maxWidth: 340, marginInline: 'auto', textAlign: 'center' }}>
              {phase === 'completing' && (
                <>
                  <div className="t-body" role="status" style={{ color: 'var(--ink-2)' }}>
                    Joining your family…
                  </div>
                </>
              )}

              {phase === 'confirm' && (
                <>
                  <h1 className="t-h1" style={{ marginBottom: 10 }}>Join your family</h1>
                  <p className="t-body" style={{ color: 'var(--ink-2)', marginBottom: 32 }}>
                    Confirm your email address to complete your account.
                  </p>

                  <div style={{ textAlign: 'left', marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label className="t-label">Your email address</label>
                      <input
                        className="field-input"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    block
                    onClick={() => void completeJoin(email)}
                  >
                    Complete sign-in
                  </Button>
                </>
              )}

              {phase === 'error' && (
                <>
                  <h1 className="t-h1" style={{ marginBottom: 10 }}>Could not join</h1>
                  {errorMsg && (
                    <p className="t-body" style={{ color: 'oklch(0.45 0.15 15)', marginBottom: 24 }}>
                      {errorMsg}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => useAppStore.getState().setOnboardingScreen('landing')}
                  >
                    Back to start
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
