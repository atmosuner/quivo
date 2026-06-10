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
    expect(phoneAuthErrorMessage({ code: 'auth/billing-not-enabled' })).toMatch(/billing/i)
  })
})
