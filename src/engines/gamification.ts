import type { Child } from '../types/domain.ts'
import type { GrantAmounts, GrantEffect, LevelState } from '../types/gamification.ts'
import { XP_PER_LEVEL } from '../types/gamification.ts'

export interface ChildGrantResult {
  child: Child
  effects: GrantEffect[]
}

/** Derive level state from lifetime XP. */
export function calculateLevel(totalXp: number): LevelState {
  const safeXp = Math.max(0, totalXp)
  return {
    level: Math.floor(safeXp / XP_PER_LEVEL) + 1,
    xpInLevel: safeXp % XP_PER_LEVEL,
    xpToLevel: XP_PER_LEVEL,
  }
}

function withProgression(child: Child, totalXp: number): ChildGrantResult {
  const previousLevel = child.level
  const { level, xpInLevel } = calculateLevel(totalXp)
  const effects: GrantEffect[] = []

  if (level > previousLevel) {
    effects.push({ type: 'LEVEL_UP', newLevel: level })
  }

  return {
    child: {
      ...child,
      totalXp,
      level,
      xpInLevel,
    },
    effects,
  }
}

/** Grant XP only — never touches coins. */
export function grantXp(child: Child, xp: number): ChildGrantResult {
  const amount = Math.max(0, xp)
  const result = withProgression(child, child.totalXp + amount)

  if (amount > 0) {
    result.effects.unshift({ type: 'XP_GRANTED', amount })
  }

  return result
}

/** Grant coins only — never touches XP or level. */
export function grantCoins(child: Child, coins: number): ChildGrantResult {
  const amount = Math.max(0, coins)
  const effects: GrantEffect[] = []

  if (amount > 0) {
    effects.push({ type: 'COINS_GRANTED', amount })
  }

  return {
    child: {
      ...child,
      coins: child.coins + amount,
    },
    effects,
  }
}

/** Apply XP and coin grants independently. */
export function applyGrant(child: Child, grant: GrantAmounts): ChildGrantResult {
  const xpResult = grantXp(child, grant.xp)
  const coinResult = grantCoins(xpResult.child, grant.coins)

  return {
    child: coinResult.child,
    effects: [...xpResult.effects, ...coinResult.effects],
  }
}

/**
 * Move coins into escrow for a pending redemption.
 * Does not affect XP, level, or totalXp.
 */
export function escrowCoins(child: Child, amount: number): Child {
  if (amount < 0) {
    throw new Error('escrow amount cannot be negative')
  }
  if (child.coins < amount) {
    throw new Error('insufficient coins for escrow')
  }

  return {
    ...child,
    coins: child.coins - amount,
    coinsPending: child.coinsPending + amount,
  }
}

/** Finalize an approved redemption — clears escrow only. */
export function finalizeCoinEscrow(child: Child, amount: number): Child {
  if (amount < 0) {
    throw new Error('escrow finalize amount cannot be negative')
  }
  if (child.coinsPending < amount) {
    throw new Error('insufficient pending coins to finalize')
  }

  return {
    ...child,
    coinsPending: child.coinsPending - amount,
  }
}

/** Restore escrowed coins after a declined redemption. */
export function restoreCoinEscrow(child: Child, amount: number): Child {
  if (amount < 0) {
    throw new Error('escrow restore amount cannot be negative')
  }
  if (child.coinsPending < amount) {
    throw new Error('insufficient pending coins to restore')
  }

  return {
    ...child,
    coins: child.coins + amount,
    coinsPending: child.coinsPending - amount,
  }
}
