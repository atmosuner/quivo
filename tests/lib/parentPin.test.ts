import { describe, expect, it } from 'vitest'
import {
  generateParentPinSalt,
  hashParentPin,
  isValidPin,
  verifyParentPin,
} from '../../src/lib/security/parentPin.ts'

describe('parentPin', () => {
  it('validates 4-digit PIN format', () => {
    expect(isValidPin('1234')).toBe(true)
    expect(isValidPin('123')).toBe(false)
    expect(isValidPin('abcd')).toBe(false)
  })

  it('hashes and verifies a PIN with salt', async () => {
    const salt = generateParentPinSalt()
    const hash = await hashParentPin('4321', salt)

    expect(hash).toHaveLength(64)
    expect(await verifyParentPin('4321', salt, hash)).toBe(true)
    expect(await verifyParentPin('4322', salt, hash)).toBe(false)
  })
})
