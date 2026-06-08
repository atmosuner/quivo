import { describe, expect, it } from 'vitest'
import { toUserErrorMessage } from '../../src/lib/errors/userMessages.ts'

describe('toUserErrorMessage', () => {
  it('maps insufficient coins', () => {
    expect(toUserErrorMessage(new Error('insufficient coins for redemption'))).toBe(
      'Not enough coins for this reward.',
    )
  })

  it('maps invalid page log', () => {
    expect(toUserErrorMessage(new Error('pages must be positive'))).toBe(
      'Enter a valid number of pages to log.',
    )
  })

  it('maps PIN validation', () => {
    expect(toUserErrorMessage(new Error('PIN must be exactly 4 digits'))).toBe(
      'PIN must be exactly 4 digits.',
    )
  })

  it('passes through unknown errors', () => {
    expect(toUserErrorMessage(new Error('custom failure'))).toBe('custom failure')
  })
})
