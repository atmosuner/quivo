import { Bar, SubHead } from '../../../components/index.ts'
import { DetailNotFound } from '../../shared/DetailNotFound.tsx'
import { getIcon } from '../../../components/icons/icons.tsx'
import { check, lock } from '../../../components/icons/icons.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { getAchievementView, getActiveChild } from '../../shared/selectors.ts'

const Check = check
const Lock = lock

export interface AchievementScreenProps {
  achievementId: string
  onBack: () => void
}

export function AchievementScreen({ achievementId, onBack }: AchievementScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const view = getAchievementView(snapshot.family, child.id, achievementId)
  if (!view) {
    return <DetailNotFound title="Achievement" onBack={onBack} />
  }

  const { definition, current, target, unlocked, locked } = view
  const I = getIcon(definition.icon)
  const pct = target ? Math.round((current / target) * 100) : 100
  const unlockedAt = view.progress?.unlockedAt

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 10, textAlign: 'center' }}>
        <div
          className={unlocked ? 'pop' : ''}
          style={{
            width: 120,
            height: 120,
            margin: '0 auto',
            borderRadius: 36,
            display: 'grid',
            placeItems: 'center',
            color: unlocked ? '#fff' : 'var(--ink-4)',
            background: unlocked
              ? `linear-gradient(145deg, oklch(0.72 0.14 ${definition.tone}), oklch(0.54 0.15 ${definition.tone}))`
              : 'var(--surface-3)',
            boxShadow: unlocked
              ? `0 14px 30px -8px oklch(0.6 0.15 ${definition.tone} / 0.55)`
              : 'none',
          }}
        >
          {locked ? <Lock size={48} /> : <I size={56} />}
        </div>

        <div
          style={{
            marginTop: 16,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 28,
            padding: '0 13px',
            borderRadius: 99,
            background: unlocked ? 'var(--success-tint)' : 'var(--surface-3)',
            color: unlocked ? 'var(--success)' : 'var(--ink-3)',
            fontWeight: 700,
            fontSize: 12.5,
          }}
        >
          {unlocked ? (
            <>
              <Check size={15} /> Unlocked · {definition.tier}
            </>
          ) : (
            `${definition.tier} · ${locked ? 'Locked' : 'In progress'}`
          )}
        </div>

        <h1 className="t-h1" style={{ marginTop: 14 }}>
          {definition.title}
        </h1>
        <div className="t-body" style={{ marginTop: 6, maxWidth: 280, marginInline: 'auto' }}>
          {definition.description}
        </div>

        {unlockedAt && (
          <div className="t-cap" style={{ marginTop: 10 }}>
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </div>
        )}

        {!unlocked && (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-2)',
              padding: 18,
              marginTop: 24,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 10,
              }}
            >
              <span className="t-h3">Progress</span>
              <span className="t-num" style={{ fontWeight: 700, color: 'var(--ink-2)' }}>
                {current} / {target}
              </span>
            </div>
            <Bar pct={pct} />
            <div className="t-cap" style={{ marginTop: 8 }}>
              {Math.max(0, target - current)} more to unlock
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
