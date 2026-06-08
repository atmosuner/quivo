import { Coin, EmptyState, Header, Placeholder } from '../../components/index.ts'
import { gift } from '../../components/icons/icons.tsx'

const Gift = gift
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { getActiveChild, getActiveRewards } from '../shared/selectors.ts'

export function RewardsScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const rewards = getActiveRewards(snapshot.family.rewards)

  const openReward = (rewardId: string) => {
    useAppStore.getState().pushChildScreen({ screen: 'reward', dataId: rewardId })
  }

  return (
    <div className="q-scroll q-body-tabbed">
      <Header
        title="Rewards"
        subtitle="Reward store"
        right={
          <span className="stat-pill" style={{ marginTop: 30 }}>
            <Coin size={20} />
            <span className="t-num">{child.coins}</span>
          </span>
        }
      />
      <div className="q-body" style={{ paddingTop: 10 }}>
        {rewards.length === 0 && (
          <EmptyState
            icon={<Gift size={32} />}
            title="No rewards yet"
            description="Rewards will appear here when a parent adds them."
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13 }}>
          {rewards.map((reward) => {
            const can = child.coins >= reward.cost
            const pendingForReward = snapshot.family.approvals.some(
              (approval) =>
                approval.status === 'pending' &&
                approval.type === 'reward_redemption' &&
                approval.childId === child.id &&
                approval.rewardId === reward.id,
            )

            return (
              <button
                key={reward.id}
                type="button"
                className="pressable"
                onClick={() => openReward(reward.id)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--sh-2)',
                  overflow: 'hidden',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <Placeholder
                  label={reward.title.toLowerCase()}
                  tone={reward.coverTone}
                  style={{ height: 92, borderRadius: 0 }}
                />
                <div style={{ padding: '11px 13px 13px' }}>
                  <div className="t-h3" style={{ fontSize: 15 }}>
                    {reward.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--ink-3)',
                      marginTop: 2,
                      marginBottom: 10,
                    }}
                  >
                    {reward.description}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <Coin size={17} />
                      <span
                        className="t-num"
                        style={{
                          fontWeight: 800,
                          fontSize: 15,
                          color: can ? 'var(--ink)' : 'var(--ink-4)',
                        }}
                      >
                        {reward.cost}
                      </span>
                    </span>
                    {pendingForReward ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--coin-ink)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Pending approval
                      </span>
                    ) : can ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--success)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Affordable
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: 'var(--ink-4)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {reward.cost - child.coins} more
                      </span>
                    )}
                  </div>
                  <div
                    className="t-cap"
                    style={{
                      fontWeight: 700,
                      color: pendingForReward
                        ? 'var(--coin-ink)'
                        : can
                          ? 'var(--brand)'
                          : 'var(--ink-4)',
                    }}
                  >
                    {pendingForReward
                      ? 'Awaiting parent'
                      : can
                        ? 'Tap to redeem'
                        : 'Not enough coins'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {child.coinsPending > 0 && (
          <div className="t-cap" style={{ marginTop: 14, textAlign: 'center' }}>
            {child.coinsPending} coins pending parent approval
          </div>
        )}
      </div>
    </div>
  )
}
