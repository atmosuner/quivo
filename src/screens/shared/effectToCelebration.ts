import type { CelebrationData } from '../../components/organisms/Celebration.tsx'
import type { GrantEffect } from '../../types/gamification.ts'

export function isCelebratableEffect(effect: GrantEffect): boolean {
  return effect.type !== 'STREAK_UPDATED'
}

export function mapGrantEffectToCelebration(
  effect: GrantEffect,
): CelebrationData | null {
  switch (effect.type) {
    case 'XP_GRANTED':
      return {
        title: 'XP earned!',
        sub: 'Nice work on that quest.',
        xp: effect.amount,
        coins: 0,
      }
    case 'COINS_GRANTED':
      return {
        title: 'Coins earned!',
        sub: 'Save up for something special.',
        xp: 0,
        coins: effect.amount,
      }
    case 'LEVEL_UP':
      return {
        title: 'Level up!',
        sub: `You reached level ${effect.newLevel}.`,
        xp: 0,
        coins: 0,
        levelUp: true,
      }
    case 'ACHIEVEMENT_UNLOCKED':
      return {
        title: 'Achievement unlocked!',
        sub: effect.title,
        xp: 0,
        coins: 0,
      }
    case 'STREAK_UPDATED':
      return null
    default:
      return null
  }
}
