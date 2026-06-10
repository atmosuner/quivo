import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from './app.ts'

export const RECAPTCHA_CONTAINER_ID = 'quivo-recaptcha'

export interface RecaptchaHandlers {
  onSolved?: () => void
  onExpired?: () => void
}

let verifier: RecaptchaVerifier | null = null
let renderTask: Promise<RecaptchaVerifier> | null = null
let handlers: RecaptchaHandlers | undefined
let solved = false

export function isRecaptchaSolved(): boolean {
  return solved
}

/** Create or reuse a rendered reCAPTCHA widget bound to the app-level container. */
export function acquireRecaptcha(nextHandlers?: RecaptchaHandlers): Promise<RecaptchaVerifier> {
  if (nextHandlers) {
    handlers = nextHandlers
  }

  const container = document.getElementById(RECAPTCHA_CONTAINER_ID)
  if (!container) {
    return Promise.reject(new Error(`Missing #${RECAPTCHA_CONTAINER_ID} in the document.`))
  }

  if (verifier && renderTask) {
    return renderTask
  }

  solved = false

  verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'normal',
    callback: () => {
      solved = true
      handlers?.onSolved?.()
    },
    'expired-callback': () => {
      solved = false
      handlers?.onExpired?.()
      window.setTimeout(() => resetRecaptcha(), 300)
    },
  })

  renderTask = verifier
    .render()
    .then(() => verifier!)
    .catch((error) => {
      resetRecaptcha()
      throw error
    })

  return renderTask
}

export function resetRecaptcha(): void {
  if (verifier) {
    try {
      verifier.clear()
    } catch {
      /* widget may already be torn down */
    }
  }
  verifier = null
  renderTask = null
  solved = false
}

/** Let reCAPTCHA finish its callback before tearing down the widget container. */
export function teardownRecaptchaSoon(delayMs = 400): void {
  window.setTimeout(() => resetRecaptcha(), delayMs)
}
