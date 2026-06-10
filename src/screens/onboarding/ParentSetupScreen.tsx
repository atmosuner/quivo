import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { Avatar, Button } from '../../components/index.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { auth } from '../../lib/firebase/app.ts'
import { saveUserProfile } from '../../lib/firebase/userProfile.ts'
import { createNewFamilySnapshot } from '../../data/newFamily.ts'
import type { ChildAvatar } from '../../types/domain.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

const AVATAR_PRESETS: ChildAvatar[] = [
  { hue1: 282, hue2: 250 },
  { hue1: 200, hue2: 160 },
  { hue1: 12, hue2: 45 },
  { hue1: 155, hue2: 180 },
  { hue1: 340, hue2: 310 },
  { hue1: 60, hue2: 90 },
]

export function ParentSetupScreen() {
  const [familyName, setFamilyName] = useState('')
  const [childName, setChildName] = useState('')
  const [childAvatar, setChildAvatar] = useState<ChildAvatar>(AVATAR_PRESETS[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!familyName.trim()) { setError('Please enter your family name.'); return }
    if (!childName.trim()) { setError("Please enter your child's name."); return }

    const user = auth.currentUser
    if (!user) { setError('You need to be signed in. Please go back and sign in again.'); return }

    setBusy(true)
    setError(null)

    try {
      const familyId = user.uid
      const childId = crypto.randomUUID()
      const snapshot = createNewFamilySnapshot(familyId, familyName.trim(), {
        id: childId,
        name: childName.trim(),
        avatar: childAvatar,
      })

      const repo = new FirestoreRepository(familyId)
      await repo.save(snapshot)
      await saveUserProfile(user.uid, { familyId, createdAt: new Date().toISOString() })

      useAppStore.getState().setDeviceRole('parent')
      useFamilyStore.getState().setRepository(repo)
      useSessionStore.getState().clearEffects()
      await useFamilyStore.getState().reload()
      useAppStore.getState().setMode('parent')
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
              <button
                type="button"
                onClick={() => useAppStore.getState().setOnboardingScreen('landing')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ink-3)', fontFamily: 'var(--font)', fontWeight: 600,
                  fontSize: 14, padding: '0 0 20px',
                }}
              >
                ← Back
              </button>
              <div style={{ marginBottom: 32 }}>
                <h1 className="t-h1" style={{ marginBottom: 8 }}>Set up your family</h1>
                <p className="t-body" style={{ color: 'var(--ink-2)' }}>
                  Create your family and add your first child. You can add more children from the parent dashboard.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <FormField label="Family name" hint="e.g. The Smiths">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Your family name"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    autoFocus
                  />
                </FormField>

                <FormField label="First child's name">
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Child's first name"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                  />
                </FormField>

                <div>
                  <p className="t-label" style={{ marginBottom: 10, color: 'var(--ink-2)' }}>Avatar colour</p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {AVATAR_PRESETS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setChildAvatar(preset)}
                        style={{
                          padding: 0, border: 'none', background: 'none', cursor: 'pointer',
                          borderRadius: childName ? `calc(${48 * 0.3}px + 3px)` : undefined,
                          outline: childAvatar === preset ? '3px solid var(--brand)' : '3px solid transparent',
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

                {error && <div role="alert" style={errorStyle}>{error}</div>}

                <Button variant="primary" size="lg" block disabled={busy} onClick={() => void handleCreate()}>
                  {busy ? 'Creating…' : 'Create family'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
