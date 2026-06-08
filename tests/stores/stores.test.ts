import { beforeEach, describe, expect, it } from 'vitest'
import { createSeedSnapshot } from '../../src/data/seed.ts'
import { bootstrapQuivoApp } from '../../src/stores/bootstrap.ts'
import { useAppStore } from '../../src/stores/appStore.ts'
import { useFamilyStore } from '../../src/stores/familyStore.ts'
import { useSessionStore } from '../../src/stores/sessionStore.ts'
import { MemoryRepository } from '../services/memoryRepository.ts'

function resetStores(): void {
  useFamilyStore.setState({
    snapshot: null,
    isLoading: false,
    error: null,
    repo: useFamilyStore.getState().repo,
  })
  useSessionStore.getState().clearEffects()
  useAppStore.getState().resetNavigation()
}

function makeTestRepo(): MemoryRepository {
  const repo = new MemoryRepository()
  const snapshot = createSeedSnapshot()

  repo.seed({
    ...snapshot,
    family: {
      ...snapshot.family,
      children: snapshot.family.children.map((child) =>
        child.id === 'child-mia'
          ? { ...child, totalXp: 50, coins: 50, coinsPending: 0, level: 1, xpInLevel: 50 }
          : child,
      ),
      tasks: [
        {
          id: 'task-open',
          childId: 'child-mia',
          title: 'Instant task',
          category: 'health',
          icon: 'check',
          xp: 10,
          coins: 5,
          difficulty: 1,
          estimatedMinutes: 5,
          repeat: 'daily',
          requiresApproval: false,
          activeToday: true,
          status: 'open',
          completedAt: null,
        },
      ],
      approvals: [],
    },
  })

  return repo
}

describe('zustand stores', () => {
  beforeEach(() => {
    resetStores()
  })

  it('bootstrap loads snapshot into familyStore', async () => {
    const repo = makeTestRepo()
    await bootstrapQuivoApp(repo)

    const { snapshot, isLoading, error } = useFamilyStore.getState()
    expect(isLoading).toBe(false)
    expect(error).toBeNull()
    expect(snapshot).not.toBeNull()
    expect(snapshot?.family.children.length).toBeGreaterThan(0)
  })

  it('submitTaskCompletion updates snapshot through familyStore', async () => {
    const repo = makeTestRepo()
    await bootstrapQuivoApp(repo)

    await useFamilyStore.getState().submitTaskCompletion('task-open')

    const child = useFamilyStore.getState().snapshot?.family.children.find(
      (entry) => entry.id === 'child-mia',
    )
    expect(child?.totalXp).toBe(60)
    expect(
      useFamilyStore.getState().snapshot?.family.tasks[0].status,
    ).toBe('completed_today')
  })

  it('enqueues service effects into sessionStore', async () => {
    const repo = makeTestRepo()
    await bootstrapQuivoApp(repo)

    await useFamilyStore.getState().submitTaskCompletion('task-open')

    const { effectQueue, currentEffect } = useSessionStore.getState()
    const allEffects = [
      ...effectQueue,
      ...(currentEffect ? [currentEffect] : []),
    ]
    expect(allEffects.some((effect) => effect.type === 'XP_GRANTED')).toBe(true)
  })

  it('supports navigation push and pop', () => {
    const { pushChildScreen, popChildScreen, setActiveTab } = useAppStore.getState()

    setActiveTab('quests')
    pushChildScreen({ screen: 'task', dataId: 'task-open' })

    expect(useAppStore.getState().activeTab).toBe('quests')
    expect(useAppStore.getState().childStack).toEqual([
      { screen: 'task', dataId: 'task-open' },
    ])

    popChildScreen()
    expect(useAppStore.getState().childStack).toHaveLength(0)
  })

  it('manages session effect queue', () => {
    const session = useSessionStore.getState()
    session.clearEffects()

    session.enqueueEffects([
      { type: 'XP_GRANTED', amount: 10 },
      { type: 'COINS_GRANTED', amount: 5 },
    ])

    expect(useSessionStore.getState().celebrationVisible).toBe(true)
    expect(useSessionStore.getState().currentEffect).toEqual({
      type: 'XP_GRANTED',
      amount: 10,
    })
    expect(useSessionStore.getState().effectQueue).toHaveLength(1)

    session.dismissCurrentEffect()
    expect(useSessionStore.getState().currentEffect).toEqual({
      type: 'COINS_GRANTED',
      amount: 5,
    })
  })
})
