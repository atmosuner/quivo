import { useEffect, useRef, useState } from 'react'
import {
  signInWithPhoneNumber,
  linkWithCredential,
  signInWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  type ConfirmationResult,
} from 'firebase/auth'
import { Button, Field } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import { auth } from '../../lib/firebase/app.ts'
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

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  const getRecaptcha = () => {
    if (!recaptchaRef.current && recaptchaContainerRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(
        auth,
        recaptchaContainerRef.current,
        { size: 'invisible' },
      )
    }
    return recaptchaRef.current!
  }

  const sendOtp = async (phone: string) => {
    setBusy(true)
    setMessage(null)
    try {
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, getRecaptcha())
      setStep('otp')
    } catch {
      setMessage('Could not send code. Check the number and try again.')
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (existingPhone) {
      void sendOtp(existingPhone)
    }
    return () => {
      recaptchaRef.current?.clear()
    }
  }, [])

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
                ? 'Enter your phone number to receive a verification code.'
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
                />
                {message && <div className="pin-message">{message}</div>}
                <Button
                  variant="primary"
                  size="md"
                  block
                  disabled={busy || !phoneInput.trim()}
                  onClick={() => void sendOtp(phoneInput.trim())}
                >
                  {busy ? 'Sending…' : 'Send code'}
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
              </>
            )}

            <div ref={recaptchaContainerRef} />

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
