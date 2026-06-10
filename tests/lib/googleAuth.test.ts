import { describe, expect, it } from 'vitest'
import {
  googleAuthErrorMessage,
  GoogleRedirectPending,
} from '../../src/lib/firebase/googleAuth.ts'

describe('googleAuthErrorMessage', () => {
  it('maps known Firebase auth codes', () => {
    expect(googleAuthErrorMessage({ code: 'auth/popup-closed-by-user' })).toMatch(/cancelled/i)
    expect(googleAuthErrorMessage({ code: 'auth/operation-not-allowed' })).toMatch(/Google sign-in/i)
  })

  it('handles redirect pending state', () => {
    expect(googleAuthErrorMessage(new GoogleRedirectPending())).toMatch(/Redirecting/i)
  })
})
