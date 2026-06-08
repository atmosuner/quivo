import { describe, expect, it } from 'vitest'
import {
  applyGrant,
  calculateLevel,
  escrowCoins,
  finalizeCoinEscrow,
  grantCoins,
  grantXp,
  restoreCoinEscrow,
} from '../../src/engines/gamification.ts'
import { makeChild } from './fixtures.ts'

describe('gamification engine', () => {
  it('calculates level thresholds', () => {
    expect(calculateLevel(499)).toEqual({
      level: 1,
      xpInLevel: 499,
      xpToLevel: 500,
    })
    expect(calculateLevel(500)).toEqual({
      level: 2,
      xpInLevel: 0,
      xpToLevel: 500,
    })
    expect(calculateLevel(1000)).toEqual({
      level: 3,
      xpInLevel: 0,
      xpToLevel: 500,
    })
  })

  it('keeps XP and coins separate when spending coins', () => {
    const child = makeChild({
      totalXp: 600,
      level: 2,
      xpInLevel: 100,
      coins: 80,
      coinsPending: 0,
    })

    const escrowed = escrowCoins(child, 40)
    expect(escrowed.coins).toBe(40)
    expect(escrowed.coinsPending).toBe(40)
    expect(escrowed.totalXp).toBe(600)
    expect(escrowed.level).toBe(2)
    expect(escrowed.xpInLevel).toBe(100)

    const finalized = finalizeCoinEscrow(escrowed, 40)
    expect(finalized.coinsPending).toBe(0)
    expect(finalized.totalXp).toBe(600)
    expect(finalized.level).toBe(2)
  })

  it('restores escrow without changing XP', () => {
    const child = makeChild({
      totalXp: 250,
      level: 1,
      xpInLevel: 250,
      coins: 20,
      coinsPending: 40,
    })

    const restored = restoreCoinEscrow(child, 40)
    expect(restored.coins).toBe(60)
    expect(restored.coinsPending).toBe(0)
    expect(restored.totalXp).toBe(250)
    expect(restored.level).toBe(1)
  })

  it('grants XP and coins independently via applyGrant', () => {
    const child = makeChild({ totalXp: 0, coins: 0 })
    const result = applyGrant(child, { xp: 15, coins: 7 })

    expect(result.child.totalXp).toBe(15)
    expect(result.child.coins).toBe(7)
    expect(result.effects).toEqual(
      expect.arrayContaining([
        { type: 'XP_GRANTED', amount: 15 },
        { type: 'COINS_GRANTED', amount: 7 },
      ]),
    )
  })

  it('grantCoins never mutates XP fields', () => {
    const child = makeChild({ totalXp: 900, level: 2, xpInLevel: 400 })
    const result = grantCoins(child, 12)

    expect(result.child.coins).toBe(112)
    expect(result.child.totalXp).toBe(900)
    expect(result.child.level).toBe(2)
    expect(result.child.xpInLevel).toBe(400)
  })

  it('grantXp never mutates coin fields', () => {
    const child = makeChild({ coins: 55, coinsPending: 10 })
    const result = grantXp(child, 20)

    expect(result.child.totalXp).toBe(20)
    expect(result.child.coins).toBe(55)
    expect(result.child.coinsPending).toBe(10)
  })
})
