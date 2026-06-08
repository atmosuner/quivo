import { Button, Coin, Placeholder, SubHead } from '../../../components/index.ts'
import { DetailNotFound } from '../../shared/DetailNotFound.tsx'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { getActiveChild, getRewardById } from '../../shared/selectors.ts'
import { gift, shield } from '../../../components/icons/icons.tsx'

const Gift = gift
const Shield = shield

export interface RewardScreenProps {
  rewardId: string
  onBack: () => void
}

export function RewardScreen({ rewardId, onBack }: RewardScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const requestRewardRedemption = useFamilyStore(
    (state) => state.requestRewardRedemption,
  )

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  const reward = getRewardById(snapshot.family, rewardId)

  if (!child || !reward) {
    return <DetailNotFound title="Reward" onBack={onBack} />
  }

  const can = child.coins >= reward.cost
  const pending = snapshot.family.approvals.some(
    (approval) =>
      approval.status === 'pending' &&
      approval.type === 'reward_redemption' &&
      approval.childId === child.id &&
      approval.rewardId === reward.id,
  )

  const handleRedeem = async () => {
    if (!can || pending) return
    await requestRewardRedemption(child.id, reward.id)
    if (!useFamilyStore.getState().error) {
      onBack()
    }
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <Placeholder
          label={reward.title.toLowerCase()}
          tone={reward.coverTone}
          style={{ height: 180, borderRadius: 'var(--r-xl)' }}
        />
        <h1 className="t-h1" style={{ marginTop: 18 }}>
          {reward.title}
        </h1>
        <div className="t-body" style={{ marginTop: 4 }}>
          {reward.description}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            marginTop: 18,
            padding: '14px 16px',
            background: 'var(--coin-tint)',
            borderRadius: 'var(--r-lg)',
          }}
        >
          <Coin size={28} />
          <div>
            <div className="t-num" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>
              {reward.cost} coins
            </div>
            <div className="t-cap">Cost to redeem</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ textAlign: 'right' }}>
            <div
              className="t-num"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: pending ? 'var(--coin-ink)' : can ? 'var(--success)' : 'var(--ink-3)',
              }}
            >
              {pending
                ? 'Pending approval'
                : can
                  ? 'You can afford this'
                  : `${reward.cost - child.coins} more`}
            </div>
            <div className="t-cap">Balance: {child.coins}</div>
          </div>
        </div>

        {child.coinsPending > 0 && (
          <div className="t-cap" style={{ marginTop: 10, textAlign: 'center' }}>
            {child.coinsPending} coins currently in escrow
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 16,
            color: 'var(--ink-3)',
            fontSize: 12.5,
            fontWeight: 600,
          }}
        >
          <Shield size={16} /> A parent will approve this redemption.
        </div>
      </div>

      <div style={{ padding: '6px 20px 8px' }}>
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!can || pending}
          onClick={() => void handleRedeem()}
        >
          {pending ? (
            'Awaiting parent approval'
          ) : can ? (
            <>
              <Gift size={20} /> Redeem reward
            </>
          ) : (
            'Not enough coins yet'
          )}
        </Button>
      </div>
    </div>
  )
}
