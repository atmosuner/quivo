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

/** Invitation link sent by a parent — includes familyId + childId in the URL. */
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

/** Sign-in link for a returning child — no custom params, just authenticates. */
export async function sendChildSignInLink(email: string): Promise<void> {
  await sendSignInLinkToEmail(auth, email, {
    url: appBaseUrl(),
    handleCodeInApp: true,
  })

  window.localStorage.setItem(PENDING_EMAIL_KEY, email)
}

export interface EmailLinkData {
  /** null for returning-user sign-in links (no invitation params) */
  familyId: string | null
  /** null for returning-user sign-in links */
  childId: string | null
  /** null when opened on a different device than the email was sent from */
  email: string | null
}

/** Returns data for any email link (invitation or returning sign-in), null if URL is not an email link. */
export function detectEmailLinkSignIn(): EmailLinkData | null {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null

  const params = new URLSearchParams(window.location.search)
  const email = window.localStorage.getItem(PENDING_EMAIL_KEY)
  return {
    familyId: params.get('familyId'),
    childId: params.get('childId'),
    email,
  }
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
