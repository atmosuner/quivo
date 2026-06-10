import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './app.ts'

export class GoogleRedirectPending extends Error {
  constructor() {
    super('Sign-in popup was blocked. Please allow popups and try again.')
  }
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    return result.user
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === 'auth/popup-blocked') throw new GoogleRedirectPending()
    throw err
  }
}

export function googleAuthErrorMessage(error: unknown): string {
  if (error instanceof GoogleRedirectPending) return error.message
  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for sign-in. Add it in Firebase Console → Authentication → Authorized domains.'
    default:
      return `Sign-in failed (${code ?? 'unknown'}). Please try again.`
  }
}

export async function signOutGoogle(): Promise<void> {
  await signOut(auth)
}
