import {
  AchievementBadge,
  EmptyState,
  Header,
  ProgressBadge,
} from '../../components/index.ts'
import { star } from '../../components/icons/icons.tsx'

const Star = star
import { ACHIEVEMENT_DEFINITIONS } from '../../data/achievements.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { getAchievementViews, getActiveChild } from '../shared/selectors.ts'

export function AchievementsScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const views = getAchievementViews(snapshot.family, child.id)
  const earned = views.filter((view) => view.unlocked)
  const inProgress = views.filter((view) => !view.unlocked)

  const openDetail = (achievementId: string) => {
    useAppStore.getState().pushChildScreen({
      screen: 'achievement',
      dataId: achievementId,
    })
  }

  return (
    <div className="q-scroll q-body-tabbed">
      <Header
        title="Achievements"
        subtitle={`${earned.length} of ${ACHIEVEMENT_DEFINITIONS.length} unlocked`}
      />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginBottom: 8,
          }}
        >
          {earned.map((view) => (
            <AchievementBadge
              key={view.definition.id}
              title={view.definition.title}
              tier={view.definition.tier}
              icon={view.definition.icon}
              tone={view.definition.tone}
              onClick={() => openDetail(view.definition.id)}
            />
          ))}
        </div>
        {earned.length === 0 && inProgress.length === 0 && (
          <EmptyState
            icon={<Star size={32} />}
            title="No achievements yet"
            description="Complete quests and reading to start earning badges."
          />
        )}

        <div className="t-eyebrow" style={{ margin: '22px 2px 14px' }}>
          In progress
        </div>
        {inProgress.length === 0 ? (
          <div className="t-body" style={{ marginBottom: 8 }}>
            All achievements unlocked — amazing work!
          </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {inProgress.map((view) => (
            <ProgressBadge
              key={view.definition.id}
              title={view.definition.title}
              description={view.definition.description}
              icon={view.definition.icon}
              tone={view.definition.tone}
              progress={view.current}
              total={view.target}
              locked={view.locked}
              onClick={() => openDetail(view.definition.id)}
            />
          ))}
        </div>
        )}
      </div>
    </div>
  )
}
