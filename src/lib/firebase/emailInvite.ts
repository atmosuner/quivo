import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from './app.ts'

const PENDING_EMAIL_KEY = 'quivo.pendingInviteEmail'

function appBaseUrl(): string {
  const base = import.meta.env.BASE_URL ?? '/'
  return window.location.origin + (base.endsWith('/') ? base : base + '/')
}

export async function sendChildInvitation(
  email: string,
  familyId: string,
  childId: string,
): Promise<void> {
  const url = new URL(appBaseUrl())
  url.searchParams.set('familyId', familyId)
  url.searchParams.set('childId', childId)

  await sendSignInLinkToEmail(auth, email, {
    url: url.toString(),
    handleCodeInApp: true,
  })

  window.localStorage.setItem(PENDING_EMAIL_KEY, email)
}

export interface EmailLinkData {
  familyId: string
  childId: string
  /** null when the link was opened on a different device than it was sent to */
  email: string | null
}

export function detectEmailLinkSignIn(): EmailLinkData | null {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null

  const params = new URLSearchParams(window.location.search)
  const familyId = params.get('familyId')
  const childId = params.get('childId')
  if (!familyId || !childId) return null

  const email = window.localStorage.getItem(PENDING_EMAIL_KEY)
  return { familyId, childId, email }
}

export async function completeEmailLinkSignIn(email: string): Promise<User> {
  const result = await signInWithEmailLink(auth, email, window.location.href)
  window.localStorage.removeItem(PENDING_EMAIL_KEY)
  const clean = new URL(window.location.href)
  clean.searchParams.delete('familyId')
  clean.searchParams.delete('childId')
  window.history.replaceState({}, '', clean.toString())
  return result.user
}
