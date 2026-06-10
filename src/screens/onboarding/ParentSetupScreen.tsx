import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { Avatar, Button } from '../../components/index.ts'
import { auth } from '../../lib/firebase/app.ts'
import { sendChildInvitation } from '../../lib/firebase/emailInvite.ts'
import { saveUserProfile } from '../../lib/firebase/userProfile.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { createNewFamilySnapshot } from '../../data/newFamily.ts'
import type { ChildAvatar } from '../../types/domain.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

type Step = 'family' | 'invite'

const AVATAR_PRESETS: ChildAvatar[] = [
  { hue1: 282, hue2: 250 },
  { hue1: 200, hue2: 160 },
  { hue1: 12, hue2: 45 },
  { hue1: 155, hue2: 180 },
  { hue1: 340, hue2: 310 },
  { hue1: 60, hue2: 90 },
]

export function ParentSetupScreen() {
  const [user, setUser] = useState<User | null>(auth.currentUser)
  const [step, setStep] = useState<Step>('family')
  const [familyName, setFamilyName] = useState('')
  const [childName, setChildName] = useState('')
  const [childAvatar, setChildAvatar] = useState<ChildAvatar>(AVATAR_PRESETS[0])
  const [childEmail, setChildEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return unsub
  }, [])

  const handleCreateFamily = () => {
    if (!familyName.trim()) {
      setError('Please enter your family name.')
      return
    }
    if (!childName.trim()) {
      setError("Please enter your child's name.")
      return
    }
    setError(null)
    setStep('invite')
  }

  const handleSendInvite = async () => {
    if (!childEmail.trim()) {
      setError("Please enter your child's email address.")
      return
    }
    if (!user) {
      setError('Not signed in. Please refresh and try again.')
      return
    }

    setBusy(true)
    setError(null)

    try {
      const childId = crypto.randomUUID()
      const snapshot = createNewFamilySnapshot(user.uid, familyName.trim(), {
        id: childId,
        name: childName.trim(),
        avatar: childAvatar,
      })

      const repo = new FirestoreRepository(user.uid)
      await repo.save(snapshot)

      await saveUserProfile(user.uid, {
        role: 'parent',
        familyId: user.uid,
        createdAt: new Date().toISOString(),
      })

      await sendChildInvitation(childEmail.trim(), user.uid, childId)

      useFamilyStore.getState().setRepository(repo)
      useSessionStore.getState().clearEffects()
      useParentGateStore.getState().clearSession()
      await useFamilyStore.getState().reload()

      useAppStore.getState().setOnboardingScreen('inviteSent')
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.'
      setError(msg)
      setBusy(false)
    }
  }

  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div className="q-body" style={{ paddingTop: 48, paddingBottom: 48 }}>
            <div style={{ maxWidth: 360, marginInline: 'auto' }}>
              {step === 'family' ? (
                <FamilyStep
                  familyName={familyName}
                  childName={childName}
                  childAvatar={childAvatar}
                  error={error}
                  onFamilyNameChange={setFamilyName}
                  onChildNameChange={setChildName}
                  onAvatarChange={setChildAvatar}
                  onNext={handleCreateFamily}
                />
              ) : (
                <InviteStep
                  childName={childName}
                  childAvatar={childAvatar}
                  childEmail={childEmail}
                  busy={busy}
                  error={error}
                  onEmailChange={setChildEmail}
                  onBack={() => { setStep('family'); setError(null) }}
                  onSend={() => void handleSendInvite()}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FamilyStepProps {
  familyName: string
  childName: string
  childAvatar: ChildAvatar
  error: string | null
  onFamilyNameChange: (v: string) => void
  onChildNameChange: (v: string) => void
  onAvatarChange: (v: ChildAvatar) => void
  onNext: () => void
}

function FamilyStep({
  familyName,
  childName,
  childAvatar,
  error,
  onFamilyNameChange,
  onChildNameChange,
  onAvatarChange,
  onNext,
}: FamilyStepProps) {
  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <p className="t-label" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>Step 1 of 2</p>
        <h1 className="t-h1" style={{ marginBottom: 8 }}>Create your family</h1>
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          Set up your family and add your first child.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField label="Family name" hint="e.g. The Smiths">
          <input
            className="field-input"
            type="text"
            placeholder="Your family name"
            value={familyName}
            onChange={(e) => onFamilyNameChange(e.target.value)}
            autoFocus
          />
        </FormField>

        <FormField label="Child's name">
          <input
            className="field-input"
            type="text"
            placeholder="Child's first name"
            value={childName}
            onChange={(e) => onChildNameChange(e.target.value)}
          />
        </FormField>

        <div>
          <p className="t-label" style={{ marginBottom: 10, color: 'var(--ink-2)' }}>Avatar color</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {AVATAR_PRESETS.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAvatarChange(preset)}
                style={{
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderRadius: childName ? `calc(${48 * 0.3}px + 3px)` : undefined,
                  outline: childAvatar === preset
                    ? `3px solid var(--brand)`
                    : '3px solid transparent',
                  outlineOffset: 2,
                }}
              >
                <Avatar
                  size={48}
                  initial={childName ? childName.charAt(0).toUpperCase() : '?'}
                  avatar={preset}
                />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div role="alert" style={errorStyle}>{error}</div>
        )}

        <Button variant="primary" size="lg" block onClick={onNext}>
          Continue
        </Button>
      </div>
    </>
  )
}

interface InviteStepProps {
  childName: string
  childAvatar: ChildAvatar
  childEmail: string
  busy: boolean
  error: string | null
  onEmailChange: (v: string) => void
  onBack: () => void
  onSend: () => void
}

function InviteStep({
  childName,
  childAvatar,
  childEmail,
  busy,
  error,
  onEmailChange,
  onBack,
  onSend,
}: InviteStepProps) {
  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <p className="t-label" style={{ color: 'var(--ink-3)', marginBottom: 4 }}>Step 2 of 2</p>
        <h1 className="t-h1" style={{ marginBottom: 8 }}>Invite {childName}</h1>
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          Send {childName} an invitation link to join your family.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar size={52} initial={childName.charAt(0).toUpperCase()} avatar={childAvatar} />
          <div>
            <p className="t-label" style={{ color: 'var(--ink-3)', fontSize: 12 }}>Child</p>
            <p className="t-body" style={{ fontWeight: 600 }}>{childName}</p>
          </div>
        </div>

        <FormField label="Child's email address" hint="They'll receive a sign-in link at this address">
          <input
            className="field-input"
            type="email"
            placeholder="child@example.com"
            value={childEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            autoFocus
          />
        </FormField>

        {error && (
          <div role="alert" style={errorStyle}>{error}</div>
        )}

        <Button variant="primary" size="lg" block disabled={busy} onClick={onSend}>
          {busy ? 'Sending…' : 'Send invitation'}
        </Button>
        <Button variant="ghost" size="md" block disabled={busy} onClick={onBack}>
          Back
        </Button>
      </div>
    </>
  )
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="t-label">{label}</label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: 0 }}>{hint}</p>}
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
