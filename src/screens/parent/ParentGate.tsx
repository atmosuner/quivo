import { useEffect, useState } from 'react'
import { shield } from '../../components/icons/icons.tsx'
import { isValidPin, verifyParentPin } from '../../lib/security/parentPin.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Shield = shield

type Phase = 'enter' | 'create' | 'confirm'

export function ParentGate() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const setParentPin = useFamilyStore((state) => state.setParentPin)
  const unlock = useParentGateStore((state) => state.unlock)
  const lock = useParentGateStore((state) => state.lock)

  const hasPin = Boolean(snapshot?.family.parentPinHash)
  const [phase, setPhase] = useState<Phase>(hasPin ? 'enter' : 'create')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)

  // If snapshot reloads and PIN now exists (e.g. just saved), switch to enter phase
  useEffect(() => {
    if (hasPin && phase === 'create') setPhase('enter')
  }, [hasPin, phase])

  const activePin = phase === 'confirm' ? confirmPin : pin
  const setActivePin = phase === 'confirm'
    ? (v: string) => setConfirmPin(v)
    : (v: string) => setPin(v)

  const handleDigit = (d: string) => {
    if (activePin.length >= 4) return
    const next = activePin + d
    setActivePin(next)
    setError(false)
    if (next.length === 4) void handleFourDigits(next)
  }

  const handleDelete = () => {
    setActivePin(activePin.slice(0, -1))
    setError(false)
  }

  const handleFourDigits = async (digits: string) => {
    if (phase === 'enter') {
      const { parentPinHash, parentPinSalt } = snapshot!.family
      const ok = await verifyParentPin(digits, parentPinSalt ?? null, parentPinHash ?? null)
      if (ok) {
        unlock()
      } else {
        setError(true)
        setPin('')
      }
    } else if (phase === 'create') {
      if (!isValidPin(digits)) { setError(true); setPin(''); return }
      setPhase('confirm')
    } else if (phase === 'confirm') {
      if (digits === pin) {
        setBusy(true)
        await setParentPin(pin)
        unlock()
      } else {
        setError(true)
        setConfirmPin('')
      }
    }
  }

  const exitToChild = () => {
    lock()
    useAppStore.getState().setMode('child')
  }

  const subtitle =
    phase === 'enter' ? 'Enter your PIN' :
    phase === 'create' ? 'Create a 4-digit parent PIN' :
    'Confirm your PIN'

  const errorMsg =
    phase === 'enter' ? 'Wrong PIN — try again' :
    phase === 'confirm' ? "PINs don't match — try again" :
    'Invalid PIN'

  const displayPin = phase === 'confirm' ? confirmPin : pin

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

            <div className="t-h2" style={{ marginTop: 18, marginBottom: 4 }}>
              Parent area
            </div>
            <div className="t-body" style={{ color: 'var(--ink-3)', marginBottom: 36 }}>
              {subtitle}
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
                    background: i < displayPin.length
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
                {errorMsg}
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
                opacity: busy ? 0.5 : 1,
                pointerEvents: busy ? 'none' : undefined,
              }}
            >
              {['1','2','3','4','5','6','7','8','9'].map((d) => (
                <PadButton key={d} label={d} onClick={() => handleDigit(d)} />
              ))}
              <div />
              <PadButton label="0" onClick={() => handleDigit('0')} />
              <PadButton label="⌫" onClick={handleDelete} />
            </div>

            {phase === 'confirm' && (
              <button
                type="button"
                onClick={() => { setPhase('create'); setPin(''); setConfirmPin(''); setError(false) }}
                style={{
                  marginTop: 20,
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
            )}

            <button
              type="button"
              onClick={exitToChild}
              style={{
                marginTop: phase === 'confirm' ? 12 : 28,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-3)',
                fontSize: 14,
                fontFamily: 'var(--font)',
                fontWeight: 600,
              }}
            >
              ← Back to child view
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
