import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
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
  // Sign out any lingering anonymous session so it doesn't interfere with the popup.
  if (auth.currentUser?.isAnonymous) {
    await signOut(auth)
  }

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
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Try again when ready.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is linked to another sign-in method.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Console.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorised for Google sign-in. Add it in Firebase Console → Authentication → Settings.'
    case 'auth/web-storage-unsupported':
      return 'Browser storage is blocked. Enable cookies/storage for this site.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    default:
      return `Could not sign in with Google (${code ?? 'unknown'}). Try again.`
  }
}
