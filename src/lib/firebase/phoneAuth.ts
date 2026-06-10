const E164_PHONE = /^\+[1-9]\d{7,14}$/

/** Strip spaces/dashes and require international E.164 (+country code). */
export function normalizePhoneNumber(raw: string): string | null {
  const normalized = raw.trim().replace(/[\s()-]/g, '')
  if (!E164_PHONE.test(normalized)) return null
  return normalized
}

export function phoneAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Enter a valid phone number with country code (example: +1 555 000 0000).'
    case 'auth/missing-phone-number':
      return 'Enter your phone number with country code.'
    case 'auth/captcha-check-failed':
      return 'Verification check failed. Complete the checkbox and try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a few minutes, then try again.'
    case 'auth/operation-not-allowed':
      return 'Phone sign-in is not enabled in Firebase Authentication.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Enable billing (Blaze plan) in Firebase to send real codes.'
    case 'auth/billing-not-enabled':
      return 'Firebase billing is required for phone SMS. Upgrade to the Blaze plan.'
    default:
      return 'Could not send code. Check the number, complete verification, and try again.'
  }
}
