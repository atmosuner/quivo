import { describe, expect, it } from 'vitest'
import { normalizePhoneNumber, phoneAuthErrorMessage } from '../../src/lib/firebase/phoneAuth.ts'

describe('normalizePhoneNumber', () => {
  it('accepts E.164 numbers with optional spacing', () => {
    expect(normalizePhoneNumber('+1 555 000 0000')).toBe('+15550000000')
    expect(normalizePhoneNumber('+40722111222')).toBe('+40722111222')
  })

  it('rejects numbers without country code', () => {
    expect(normalizePhoneNumber('5550000000')).toBeNull()
    expect(normalizePhoneNumber('+0123456789')).toBeNull()
  })
})

describe('phoneAuthErrorMessage', () => {
  it('maps known Firebase auth codes', () => {
    expect(phoneAuthErrorMessage({ code: 'auth/invalid-phone-number' })).toMatch(/country code/i)
    expect(
      phoneAuthErrorMessage({ code: 'auth/billing-not-enabled' }, 'quivo-f811b'),
    ).toMatch(/quivo-f811b/)
  })

  it('explains reCAPTCHA for invalid app credential', () => {
    expect(
      phoneAuthErrorMessage({
        code: 'auth/invalid-app-credential',
        message: 'INVALID_APP_CREDENTIAL',
      }),
    ).toMatch(/robot/i)
  })

  it('explains SMS region policy for operation-not-allowed', () => {
    expect(
      phoneAuthErrorMessage({
        code: 'auth/operation-not-allowed',
        message: 'SMS unable to be sent until this region enabled by the app developer.',
      }),
    ).toMatch(/SMS region policy/i)
  })
})
