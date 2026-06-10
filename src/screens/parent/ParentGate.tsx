import { useEffect, useRef, useState } from 'react'
import {
  signInWithPhoneNumber,
  linkWithCredential,
  signInWithCredential,
  PhoneAuthProvider,
  type ConfirmationResult,
} from 'firebase/auth'
import { Button, Field } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import { auth } from '../../lib/firebase/app.ts'
import { normalizePhoneNumber, phoneAuthErrorMessage } from '../../lib/firebase/phoneAuth.ts'
import {
  acquireRecaptcha,
  RECAPTCHA_CONTAINER_ID,
  resetRecaptcha,
} from '../../lib/firebase/recaptcha.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Shield = shield
const OTP_LENGTH = 6

type GateStep = 'phone' | 'otp'

function PinDots({ length, filled }: { length: number; filled: number }) {
  return (
    <div className="pin-dots" aria-hidden="true">
      {Array.from({ length }, (_, index) => (
        <span key={index} className={index < filled ? 'on' : ''} />
      ))}
    </div>
  )
}

function PinKeypad({
  disabled,
  onDigit,
  onBackspace,
}: {
  disabled?: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
}) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

  return (
    <div className="pin-keypad">
      {keys.map((key, index) => {
        if (key === '') {
          return <span key={index} />
        }
        if (key === 'back') {
          return (
            <button
              key={index}
              type="button"
              className="pin-key"
              disabled={disabled}
              onClick={onBackspace}
              aria-label="Delete"
            >
              ⌫
            </button>
          )
        }
        return (
          <button
            key={index}
            type="button"
            className="pin-key"
            disabled={disabled}
            onClick={() => onDigit(key)}
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

export function ParentGate() {
  const unlock = useParentGateStore((state) => state.unlock)
  const lock = useParentGateStore((state) => state.lock)

  const existingPhone = auth.currentUser?.phoneNumber ?? null

  const [step, setStep] = useState<GateStep>(existingPhone ? 'otp' : 'phone')
  const [phoneInput, setPhoneInput] = useState(existingPhone ?? '')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const autoSendStartedRef = useRef(false)

  useEffect(() => {
    resetRecaptcha()
    let cancelled = false

    void acquireRecaptcha()
      .then(() => {
        if (!cancelled) setRecaptchaReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setMessage('Could not load verification. Refresh and try again.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const sendOtp = async (rawPhone: string) => {
    const phone = normalizePhoneNumber(rawPhone)
    if (!phone) {
      setMessage('Use international format with country code (example: +1 555 000 0000).')
      return
    }

    setBusy(true)
    setMessage(null)
    try {
      const appVerifier = await acquireRecaptcha()
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, appVerifier)
      setPhoneInput(phone)
      setStep('otp')
    } catch (error) {
      if (import.meta.env.DEV) console.error('Phone auth send failed:', error)
      setMessage(phoneAuthErrorMessage(error))
      resetRecaptcha()
      setRecaptchaReady(false)
      try {
        await acquireRecaptcha()
        setRecaptchaReady(true)
      } catch {
        setMessage('Could not reload verification. Refresh and try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!existingPhone || !recaptchaReady || autoSendStartedRef.current) return
    autoSendStartedRef.current = true
    void sendOtp(existingPhone)
  }, [existingPhone, recaptchaReady])

  const verifyOtp = async (code: string) => {
    if (!confirmationRef.current || busy) return
    setBusy(true)
    setMessage(null)
    try {
      const credential = PhoneAuthProvider.credential(
        confirmationRef.current.verificationId,
        code,
      )
      const currentUser = auth.currentUser
      if (currentUser?.isAnonymous) {
        try {
          await linkWithCredential(currentUser, credential)
        } catch (linkErr: unknown) {
          if ((linkErr as { code?: string })?.code === 'auth/credential-already-in-use') {
            await signInWithCredential(auth, credential)
          } else {
            throw linkErr
          }
        }
      } else {
        await signInWithCredential(auth, credential)
      }
      unlock()
    } catch {
      setMessage('Incorrect code. Try again.')
      setOtp('')
    } finally {
      setBusy(false)
    }
  }

  const handleDigit = (digit: string) => {
    if (busy) return
    setMessage(null)
    const next = otp.length < OTP_LENGTH ? otp + digit : otp
    setOtp(next)
    if (next.length === OTP_LENGTH) void verifyOtp(next)
  }

  const handleBackspace = () => {
    if (busy) return
    setMessage(null)
    setOtp((current) => current.slice(0, -1))
  }

  const exitToChild = () => {
    lock()
    useAppStore.getState().setMode('child')
  }

  const displayPhone = existingPhone ?? phoneInput
  const phoneReady = recaptchaReady && !busy

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
              {step === 'phone' ? 'Parent area' : 'Enter code'}
            </h1>
            <p
              className="t-body"
              style={{ marginTop: 8, maxWidth: 280, marginInline: 'auto' }}
            >
              {step === 'phone'
                ? 'Enter your phone number with country code, complete verification, then send the code.'
                : `We sent a 6-digit code to ${displayPhone}.`}
            </p>

            {step === 'phone' && (
              <div style={{ marginTop: 24, width: '100%', maxWidth: 320, marginInline: 'auto' }}>
                <Field
                  label="Phone number"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  disabled={busy}
                  autoComplete="tel"
                />
                {message && <div className="pin-message">{message}</div>}
                <Button
                  variant="primary"
                  size="md"
                  block
                  disabled={!phoneReady || !phoneInput.trim()}
                  onClick={() => void sendOtp(phoneInput)}
                >
                  {busy ? 'Sending…' : recaptchaReady ? 'Send code' : 'Loading verification…'}
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <>
                <PinDots length={OTP_LENGTH} filled={otp.length} />
                {message && <div className="pin-message">{message}</div>}
                <PinKeypad
                  disabled={busy}
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                />
                <Button
                  variant="ghost"
                  size="md"
                  block
                  style={{ marginTop: 12, maxWidth: 320, marginInline: 'auto' }}
                  disabled={busy}
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setMessage(null)
                    resetRecaptcha()
                    setRecaptchaReady(false)
                    void acquireRecaptcha()
                      .then(() => setRecaptchaReady(true))
                      .catch(() => setMessage('Could not reload verification. Refresh and try again.'))
                  }}
                >
                  Resend code
                </Button>
              </>
            )}

            <div
              id={RECAPTCHA_CONTAINER_ID}
              className={`quivo-recaptcha-host${step === 'otp' ? ' quivo-recaptcha-host--hidden' : ''}`}
              aria-hidden={step === 'otp'}
            />

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
