import { useState } from 'react'
import { Avatar } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import { verifyParentPin } from '../../lib/security/parentPin.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import type { Child } from '../../types/domain.ts'

const Shield = shield

type Phase = 'select' | 'pin'

export function ChildSelector() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const switchActiveChild = useFamilyStore((state) => state.switchActiveChild)
  const setChildUnlocked = useAppStore((state) => state.setChildUnlocked)

  const [phase, setPhase] = useState<Phase>('select')
  const [selected, setSelected] = useState<Child | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (!snapshot) return null
  const { children } = snapshot.family

  const unlock = (child: Child) => {
    void switchActiveChild(child.id)
    setChildUnlocked(true)
  }

  const handleSelect = (child: Child) => {
    if (!child.pinHash) {
      unlock(child)
      return
    }
    setSelected(child)
    setPin('')
    setError(false)
    setPhase('pin')
  }

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) void checkPin(next)
  }

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1))
    setError(false)
  }

  const checkPin = async (attempt: string) => {
    if (!selected) return
    const ok = await verifyParentPin(attempt, selected.pinSalt ?? null, selected.pinHash ?? null)
    if (ok) {
      unlock(selected)
    } else {
      setError(true)
      setPin('')
    }
  }

  if (phase === 'pin' && selected) {
    return (
      <div className="q-app">
        <div className="q-main">
          <div className="q-scroll">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: 80,
                paddingBottom: 48,
                gap: 0,
              }}
            >
              <Avatar size={64} initial={selected.initial} avatar={selected.avatar} />
              <div className="t-h2" style={{ marginTop: 16, marginBottom: 4 }}>
                Hi, {selected.name}!
              </div>
              <div className="t-body" style={{ color: 'var(--ink-3)', marginBottom: 36 }}>
                Enter your PIN
              </div>

              {/* PIN dots */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: i < pin.length
                        ? (error ? 'oklch(0.55 0.18 15)' : 'var(--brand)')
                        : 'var(--line)',
                      transition: 'background 0.15s',
                    }}
                  />
                ))}
              </div>

              {error && (
                <div
                  style={{
                    fontSize: 13,
                    color: 'oklch(0.55 0.18 15)',
                    marginBottom: 12,
                    fontWeight: 600,
                  }}
                >
                  Wrong PIN — try again
                </div>
              )}
              {!error && <div style={{ height: 29 }} />}

              {/* Number pad */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 72px)',
                  gridTemplateRows: 'repeat(4, 72px)',
                  gap: 8,
                }}
              >
                {['1','2','3','4','5','6','7','8','9'].map((d) => (
                  <PadButton key={d} label={d} onClick={() => handleDigit(d)} />
                ))}
                <div />
                <PadButton label="0" onClick={() => handleDigit('0')} />
                <PadButton label="⌫" onClick={handleDelete} />
              </div>

              <button
                type="button"
                onClick={() => { setPhase('select'); setPin(''); setError(false) }}
                style={{
                  marginTop: 28,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-3)',
                  fontSize: 14,
                  fontFamily: 'var(--font)',
                  fontWeight: 600,
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const goToParent = () => useAppStore.getState().setMode('parent')

  return (
    <div className="q-app">
      <div className="q-main">
        <div className="q-scroll">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 80,
              paddingBottom: 48,
            }}
          >
            <div className="t-h1" style={{ marginBottom: 6 }}>Who's playing?</div>
            <div className="t-body" style={{ color: 'var(--ink-3)', marginBottom: 48 }}>
              Tap your name to start
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 24,
                justifyContent: 'center',
                maxWidth: 320,
              }}
            >
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleSelect(child)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '16px 20px',
                    borderRadius: 'var(--r-lg)',
                    transition: 'background 0.12s',
                  }}
                  className="pressable"
                >
                  <Avatar size={72} initial={child.initial} avatar={child.avatar} />
                  <span className="t-h3" style={{ fontSize: 16 }}>{child.name}</span>
                  {child.pinHash && (
                    <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600 }}>
                      PIN required
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={goToParent}
              style={{
                marginTop: 48,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 99,
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                boxShadow: 'var(--sh-1)',
                cursor: 'pointer',
                fontFamily: 'var(--font)',
                fontWeight: 700,
                fontSize: 13,
                color: 'var(--ink-2)',
              }}
            >
              <Shield size={14} stroke="var(--brand)" /> Parent area
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PadButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        boxShadow: 'var(--sh-1)',
        fontSize: label === '⌫' ? 20 : 24,
        fontFamily: 'var(--font)',
        fontWeight: 600,
        cursor: 'pointer',
        color: 'var(--ink)',
        display: 'grid',
        placeItems: 'center',
      }}
      className="pressable"
    >
      {label}
    </button>
  )
}
