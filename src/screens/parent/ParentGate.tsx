import { useEffect, useState } from 'react'
import { Button } from '../../components/index.ts'
import { shield } from '../../components/icons/icons.tsx'
import {
  PIN_LENGTH,
  verifyParentPin,
} from '../../lib/security/parentPin.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Shield = shield

type GateStep = 'enter' | 'setup' | 'confirm'

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
  const snapshot = useFamilyStore((state) => state.snapshot)
  const setParentPin = useFamilyStore((state) => state.setParentPin)
  const storeError = useFamilyStore((state) => state.error)

  const unlock = useParentGateStore((state) => state.unlock)
  const lock = useParentGateStore((state) => state.lock)
  const pinChangeMode = useParentGateStore((state) => state.pinChangeMode)
  const clearPinChange = useParentGateStore((state) => state.clearPinChange)
  const recordFailedAttempt = useParentGateStore((state) => state.recordFailedAttempt)
  const isInCooldown = useParentGateStore((state) => state.isInCooldown)
  const cooldownRemainingMs = useParentGateStore((state) => state.cooldownRemainingMs)

  const hasPin = Boolean(
    snapshot?.family.settings.parentPinHash &&
      snapshot.family.settings.parentPinSalt,
  )

  const [step, setStep] = useState<GateStep>(hasPin ? 'enter' : 'setup')
  const [pin, setPin] = useState('')
  const [draftPin, setDraftPin] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [cooldownLabel, setCooldownLabel] = useState('')

  useEffect(() => {
    if (pinChangeMode && hasPin) {
      setStep('enter')
      return
    }
    setStep(hasPin ? 'enter' : 'setup')
  }, [hasPin, pinChangeMode])

  useEffect(() => {
    if (!isInCooldown()) {
      setCooldownLabel('')
      return
    }

    const tick = () => {
      const seconds = Math.ceil(cooldownRemainingMs() / 1000)
      setCooldownLabel(`${seconds}s`)
    }

    tick()
    const timer = window.setInterval(tick, 250)
    return () => window.clearInterval(timer)
  }, [isInCooldown, cooldownRemainingMs])

  const exitToChild = () => {
    clearPinChange()
    lock()
    useAppStore.getState().setMode('child')
    setPin('')
    setDraftPin('')
    setMessage(null)
  }

  const completePin = async (value: string) => {
    if (value.length !== PIN_LENGTH || busy) return

    if (step === 'setup') {
      setDraftPin(value)
      setPin('')
      setStep('confirm')
      setMessage('Enter your PIN again to confirm.')
      return
    }

    if (step === 'confirm') {
      if (value !== draftPin) {
        setMessage('PINs did not match. Try again.')
        setPin('')
        setDraftPin('')
        setStep('setup')
        return
      }

      setBusy(true)
      await setParentPin(value)
      setBusy(false)

      if (useFamilyStore.getState().error) {
        setMessage(useFamilyStore.getState().error)
        setPin('')
        return
      }

      if (pinChangeMode) {
        clearPinChange()
        lock()
        useAppStore.getState().setMode('child')
        setPin('')
        setDraftPin('')
        setMessage('Parent PIN updated.')
        return
      }

      unlock()
      setPin('')
      setDraftPin('')
      setMessage(null)
      return
    }

    if (!snapshot) return
    if (isInCooldown()) {
      setMessage('Too many attempts. Please wait a moment.')
      setPin('')
      return
    }

    setBusy(true)
    const valid = await verifyParentPin(
      value,
      snapshot.family.settings.parentPinSalt,
      snapshot.family.settings.parentPinHash,
    )
    setBusy(false)

    if (!valid) {
      recordFailedAttempt()
      setPin('')
      setMessage(
        useParentGateStore.getState().isInCooldown()
          ? 'Too many attempts. Please wait a moment.'
          : 'Incorrect PIN. Try again.',
      )
      return
    }

    if (pinChangeMode) {
      setPin('')
      setStep('setup')
      setMessage('Choose a new 4-digit PIN.')
      return
    }

    unlock()
    setPin('')
    setMessage(null)
  }

  const handleDigit = (digit: string) => {
    if (busy || isInCooldown()) return
    setMessage(null)
    const next = pin.length < PIN_LENGTH ? pin + digit : pin
    setPin(next)
    if (next.length === PIN_LENGTH) {
      void completePin(next)
    }
  }

  const handleBackspace = () => {
    if (busy || isInCooldown()) return
    setMessage(null)
    setPin((current) => current.slice(0, -1))
  }

  const title =
    pinChangeMode && step === 'enter'
      ? 'Enter current PIN'
      : step === 'setup'
        ? pinChangeMode
          ? 'Choose new PIN'
          : 'Create parent PIN'
        : step === 'confirm'
          ? pinChangeMode
            ? 'Confirm new PIN'
            : 'Confirm parent PIN'
          : 'Enter parent PIN'

  const subtitle =
    pinChangeMode && step === 'enter'
      ? 'Verify your current PIN before choosing a new one.'
      : step === 'setup'
        ? pinChangeMode
          ? 'Pick a new 4-digit PIN for the parent area.'
          : 'Choose a 4-digit PIN to protect the parent area.'
        : step === 'confirm'
          ? pinChangeMode
            ? 'Re-enter the new PIN to save it.'
            : 'Re-enter the same PIN to finish setup.'
          : 'Parents only — enter your PIN to continue.'

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
            {title}
          </h1>
          <p
            className="t-body"
            style={{ marginTop: 8, maxWidth: 280, marginInline: 'auto' }}
          >
            {subtitle}
          </p>

          <PinDots length={PIN_LENGTH} filled={pin.length} />

          {(message || storeError) && (
            <div className="pin-message">{message ?? storeError}</div>
          )}
          {isInCooldown() && (
            <div className="pin-message">Try again in {cooldownLabel}</div>
          )}

          <PinKeypad
            disabled={busy || isInCooldown()}
            onDigit={handleDigit}
            onBackspace={handleBackspace}
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
