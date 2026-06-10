import { RecaptchaVerifier } from 'firebase/auth'
import { auth } from './app.ts'

export const RECAPTCHA_CONTAINER_ID = 'quivo-recaptcha'

let verifier: RecaptchaVerifier | null = null
let renderTask: Promise<RecaptchaVerifier> | null = null

/** Create or reuse a rendered reCAPTCHA widget bound to the app-level container. */
export function acquireRecaptcha(): Promise<RecaptchaVerifier> {
  const container = document.getElementById(RECAPTCHA_CONTAINER_ID)
  if (!container) {
    return Promise.reject(new Error(`Missing #${RECAPTCHA_CONTAINER_ID} in the document.`))
  }

  if (verifier && renderTask) {
    return renderTask
  }

  verifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
    size: 'normal',
    callback: () => {
      /* solved — signInWithPhoneNumber proceeds */
    },
    'expired-callback': () => {
      resetRecaptcha()
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
}
