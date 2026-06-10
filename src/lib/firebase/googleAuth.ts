import {
  GoogleAuthProvider,
  getRedirectResult,
  linkWithPopup,
  linkWithRedirect,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from 'firebase/auth'
import { auth } from './app.ts'
import { FirestoreRepository } from '../storage/firestoreRepository.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export class GoogleRedirectPending extends Error {
  constructor() {
    super('redirect')
    this.name = 'GoogleRedirectPending'
  }
}

async function rebindFirestore(user: User): Promise<void> {
  useFamilyStore.getState().setRepository(new FirestoreRepository(user.uid))
  await useFamilyStore.getState().reload()
}

/** Completes a Google redirect sign-in flow when the app reloads. */
export async function completeGoogleRedirectIfNeeded(): Promise<User | null> {
  const result = await getRedirectResult(auth)
  if (!result?.user) return null
  await rebindFirestore(result.user)
  return result.user
}

function usePopup(): boolean {
  return !/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

async function signInWithGoogleProvider(): Promise<User> {
  const current = auth.currentUser

  if (usePopup()) {
    try {
      if (current?.isAnonymous) {
        try {
          const linked = await linkWithPopup(current, googleProvider)
          return linked.user
        } catch (linkErr: unknown) {
          const code = (linkErr as { code?: string })?.code
          if (code === 'auth/credential-already-in-use') {
            const signedIn = await signInWithPopup(auth, googleProvider)
            return signedIn.user
          }
          if (code === 'auth/popup-blocked') {
            await linkWithRedirect(current, googleProvider)
            throw new GoogleRedirectPending()
          }
          throw linkErr
        }
      }

      const signedIn = await signInWithPopup(auth, googleProvider)
      return signedIn.user
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider)
        throw new GoogleRedirectPending()
      }
      throw err
    }
  }

  if (current?.isAnonymous) {
    await linkWithRedirect(current, googleProvider)
  } else {
    await signInWithRedirect(auth, googleProvider)
  }
  throw new GoogleRedirectPending()
}

/** Google sign-in for parent access; links to anonymous child data when possible. */
export async function signInParentWithGoogle(): Promise<User> {
  const user = await signInWithGoogleProvider()
  await rebindFirestore(user)
  return user
}

export function googleAuthErrorMessage(error: unknown): string {
  if (error instanceof GoogleRedirectPending) {
    return 'Redirecting to Google…'
  }

  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled. Try again when ready.'
    case 'auth/account-exists-with-different-credential':
      return 'This email is linked to another sign-in method.'
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Enable it in Firebase Authentication.'
    default:
      return 'Could not sign in with Google. Try again.'
  }
}
