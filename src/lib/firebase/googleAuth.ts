import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth'
import { auth } from './app.ts'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export class GoogleRedirectPending extends Error {
  constructor() {
    super('redirect')
    this.name = 'GoogleRedirectPending'
  }
}

function usePopup(): boolean {
  return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

/** Returns the Google redirect-result user if one is pending, null otherwise. */
export async function completeGoogleRedirectIfNeeded(): Promise<User | null> {
  const result = await getRedirectResult(auth)
  return result?.user ?? null
}

/** Signs in with Google via popup (desktop) or redirect (mobile). */
export async function signInWithGoogle(): Promise<User> {
  if (usePopup()) {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      return result.user
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider)
        throw new GoogleRedirectPending()
      }
      throw err
    }
  }

  await signInWithRedirect(auth, googleProvider)
  throw new GoogleRedirectPending()
}

export function googleAuthErrorMessage(error: unknown): string {
  if (error instanceof GoogleRedirectPending) return 'Redirecting to Google…'

  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Try again when ready.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is linked to another sign-in method.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Console.'
    default:
      return 'Could not sign in with Google. Try again.'
  }
}
