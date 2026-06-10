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
import { auth, firebaseProjectId } from '../../lib/firebase/app.ts'
import { normalizePhoneNumber, phoneAuthErrorMessage } from '../../lib/firebase/phoneAuth.ts'
import {
  acquireRecaptcha,
  RECAPTCHA_CONTAINER_ID,
  resetRecaptcha,
  teardownRecaptchaSoon,
} from '../../lib/firebase/recaptcha.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Shield = shield
const OTP_LENGTH = 6
const RATE_LIMIT_COOLDOWN_MS = 15 * 60 * 1000

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

function formatCooldown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function ParentGate() {
  const unlock = useParentGateStore((state) => state.unlock)
  const lock = useParentGateStore((state) => state.lock)

  const linkedPhone = auth.currentUser?.phoneNumber ?? null

  const [step, setStep] = useState<GateStep>('phone')
  const [phoneInput, setPhoneInput] = useState(linkedPhone ?? '')
  const [otp, setOtp] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [smsPending, setSmsPending] = useState(false)
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [recaptchaSolved, setRecaptchaSolved] = useState(false)
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null)
  const [cooldownMs, setCooldownMs] = useState(0)

  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const sendingRef = useRef(false)

  const initRecaptcha = () => {
    resetRecaptcha()
    setRecaptchaReady(false)
    setRecaptchaSolved(false)
    return acquireRecaptcha({
      onSolved: () => setRecaptchaSolved(true),
      onExpired: () => setRecaptchaSolved(false),
    })
  }

  useEffect(() => {
    if (linkedPhone) {
      setPhoneInput(linkedPhone)
    }
  }, [linkedPhone])

  useEffect(() => {
    let cancelled = false

    void initRecaptcha()
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
      teardownRecaptchaSoon(0)
    }
  }, [])

  useEffect(() => {
    if (rateLimitedUntil == null) {
      setCooldownMs(0)
      return
    }

    const tick = () => {
      const remaining = rateLimitedUntil - Date.now()
      if (remaining <= 0) {
        setRateLimitedUntil(null)
        setCooldownMs(0)
        void initRecaptcha()
          .then(() => setRecaptchaReady(true))
          .catch(() => setMessage('Could not reload verification. Refresh and try again.'))
        return
      }
      setCooldownMs(remaining)
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [rateLimitedUntil])

  const sendOtp = async (rawPhone: string) => {
    if (sendingRef.current || busy) return
    if (rateLimitedUntil != null && Date.now() < rateLimitedUntil) return

    const phone = normalizePhoneNumber(rawPhone)
    if (!phone) {
      setMessage('Use international format with country code (example: +1 555 000 0000).')
      return
    }

    sendingRef.current = true
    setBusy(true)
    setSmsPending(true)
    setMessage(null)
    try {
      const appVerifier = await acquireRecaptcha()
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, appVerifier)
      setPhoneInput(phone)
      setStep('otp')
      teardownRecaptchaSoon()
      setRecaptchaReady(false)
      setRecaptchaSolved(false)
    } catch (error) {
      if (import.meta.env.DEV) console.error('Phone auth send failed:', error)
      const errCode = (error as { code?: string })?.code
      setMessage(phoneAuthErrorMessage(error, firebaseProjectId))

      if (errCode === 'auth/too-many-requests') {
        setRateLimitedUntil(Date.now() + RATE_LIMIT_COOLDOWN_MS)
      } else {
        try {
          await initRecaptcha()
          setRecaptchaReady(true)
        } catch {
          setMessage('Could not reload verification. Refresh the page and try again.')
        }
      }
    } finally {
      sendingRef.current = false
      setBusy(false)
      setSmsPending(false)
    }
  }

  const verifyOtp = async (code: string) => {
    if (busy) return
    if (!confirmationRef.current) {
      setMessage('Code session expired. Tap Resend code and try again.')
      setOtp('')
      return
    }
    setBusy(true)
    setMessage('Verifying code…')
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
    } catch (error) {
      if (import.meta.env.DEV) console.error('Phone auth verify failed:', error)
      const errCode = (error as { code?: string })?.code
      if (errCode === 'auth/code-expired') {
        setMessage('Code expired. Tap Resend code.')
      } else if (errCode === 'auth/invalid-verification-code') {
        setMessage('Incorrect code. Try again.')
      } else {
        setMessage('Could not verify code. Try again or resend.')
      }
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

  const displayPhone = phoneInput
  const awaitingSms = step === 'otp' && smsPending
  const rateLimited = rateLimitedUntil != null && cooldownMs > 0
  const phoneReady = recaptchaReady && recaptchaSolved && !busy && !rateLimited

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

            <div style={{ marginTop: 24, width: '100%', maxWidth: 320, marginInline: 'auto' }}>
              {step === 'phone' && (
                <Field
                  label="Phone number"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  disabled={busy || rateLimited}
                  autoComplete="tel"
                />
              )}

              {step === 'phone' && (
                <div id={RECAPTCHA_CONTAINER_ID} className="quivo-recaptcha-host" />
              )}

              {step === 'phone' && (
                <>
                  {!recaptchaSolved && recaptchaReady && !rateLimited && (
                    <p className="t-caption" style={{ marginTop: 8 }}>
                      Complete the checkbox above before sending.
                    </p>
                  )}
                  {rateLimited && (
                    <p className="pin-message" role="status">
                      Too many attempts. Try again in {formatCooldown(cooldownMs)}.
                    </p>
                  )}
                  {message && !rateLimited && <div className="pin-message">{message}</div>}
                  <Button
                    variant="primary"
                    size="md"
                    block
                    disabled={!phoneReady || !phoneInput.trim()}
                    onClick={() => void sendOtp(phoneInput)}
                  >
                    {rateLimited
                      ? `Wait ${formatCooldown(cooldownMs)}`
                      : busy
                        ? 'Sending…'
                        : !recaptchaReady
                          ? 'Loading verification…'
                          : !recaptchaSolved
                            ? 'Complete verification first'
                            : 'Send code'}
                  </Button>
                </>
              )}
            </div>

            {step === 'otp' && (
              <>
                <PinDots length={OTP_LENGTH} filled={otp.length} />
                {message && (
                  <div className="pin-message" role={busy ? 'status' : 'alert'}>
                    {message}
                  </div>
                )}
                <PinKeypad
                  disabled={busy || awaitingSms}
                  onDigit={handleDigit}
                  onBackspace={handleBackspace}
                />
                {awaitingSms && (
                  <p className="t-caption" style={{ marginTop: 8 }} role="status">
                    Sending a new code…
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="md"
                  block
                  style={{ marginTop: 12, maxWidth: 320, marginInline: 'auto' }}
                  disabled={busy || rateLimited}
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setMessage(null)
                    void initRecaptcha()
                      .then(() => setRecaptchaReady(true))
                      .catch(() => setMessage('Could not reload verification. Refresh and try again.'))
                  }}
                >
                  {rateLimited ? `Resend in ${formatCooldown(cooldownMs)}` : 'Resend code'}
                </Button>
              </>
            )}

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
