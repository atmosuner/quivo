import {
  Avatar,
  Button,
  CatTag,
  Coin,
  EmptyState,
  IconTile,
} from '../../components/index.ts'
import { bolt, check, close, pages } from '../../components/icons/icons.tsx'
import type { TaskCategory } from '../../types/domain.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import {
  buildApprovalCardView,
  getPendingApprovals,
} from '../shared/parentSelectors.ts'

const Bolt = bolt
const Check = check
const Close = close
const Pages = pages

export function ApprovalScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const approveApproval = useFamilyStore((state) => state.approveApproval)
  const declineApproval = useFamilyStore((state) => state.declineApproval)
  const setParentScreen = useAppStore((state) => state.setParentScreen)

  if (!snapshot) return null

  const pending = getPendingApprovals(snapshot.family)
  const redemptions = pending.filter(
    (approval) => approval.type === 'reward_redemption',
  )
  const readingLogs = pending.filter((approval) => approval.type === 'reading_log')
  const taskCompletions = pending.filter(
    (approval) => approval.type === 'task_completion',
  )

  const renderCard = (view: ReturnType<typeof buildApprovalCardView>) => {
    const isRedemption = view.approval.type === 'reward_redemption'

    return (
      <div
        key={view.approval.id}
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--sh-2)',
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {isRedemption ? (
            <IconTile icon="gift" tone="--coin-ink" size={44} />
          ) : (
            <Avatar
              size={42}
              initial={view.childInitial}
              avatar={view.childAvatar}
              glyphs={false}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="t-h3"
              style={{
                fontSize: 15.5,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {view.title}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 5,
                flexWrap: 'wrap',
              }}
            >
              {view.categoryKey && (
                <CatTag category={view.categoryKey as TaskCategory} small />
              )}
              <span className="t-cap" style={{ whiteSpace: 'nowrap' }}>
                {view.subtitle}
              </span>
            </div>
            {view.note && (
              <div
                style={{
                  marginTop: 10,
                  padding: '9px 12px',
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--ink-2)',
                  display: 'flex',
                  gap: 7,
                  alignItems: 'center',
                }}
              >
                <Pages size={15} stroke="var(--ink-3)" />
                {view.note}
              </div>
            )}
          </div>
          {view.rewardCost != null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Coin size={18} />
              <span className="t-num" style={{ fontWeight: 800 }}>
                {view.rewardCost}
              </span>
            </span>
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            gap: 10,
          }}
        >
          {!isRedemption && (view.xp > 0 || view.coins > 0) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {view.xp > 0 && (
                <span
                  style={{
                    color: 'var(--brand)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Bolt size={14} />+{view.xp}
                </span>
              )}
              {view.coins > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Coin size={14} />
                  <span style={{ color: 'var(--coin-ink)' }}>+{view.coins}</span>
                </span>
              )}
            </div>
          )}
          {isRedemption && <div />}
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => void declineApproval(view.approval.id)}
              style={{ minWidth: 44, padding: '0 12px' }}
              aria-label="Decline"
            >
              <Close size={18} />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void approveApproval(view.approval.id)}
            >
              <Check size={17} /> Approve
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          paddingTop: 52,
          paddingBottom: 10,
          background: 'linear-gradient(var(--bg) 78%, transparent)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
          }}
        >
          <button
            type="button"
            onClick={() => setParentScreen('dash')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 99,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              boxShadow: 'var(--sh-1)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Go back"
          >
            ←
          </button>
          <span className="t-h3" style={{ fontSize: 16 }}>
            Approvals
          </span>
          <div style={{ width: 40 }} />
        </div>
      </div>

      <div className="q-body" style={{ paddingTop: 6 }}>
        {pending.length === 0 && (
          <EmptyState
            icon={<Check size={32} />}
            title="All caught up"
            description="No pending approvals."
          />
        )}

        {redemptions.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ margin: '4px 2px 12px' }}>
              Reward redemptions
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 22,
              }}
            >
              {redemptions.map((approval) =>
                renderCard(buildApprovalCardView(snapshot.family, approval)),
              )}
            </div>
          </>
        )}

        {readingLogs.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ margin: '4px 2px 12px' }}>
              Reading logs
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginBottom: 22,
              }}
            >
              {readingLogs.map((approval) =>
                renderCard(buildApprovalCardView(snapshot.family, approval)),
              )}
            </div>
          </>
        )}

        {taskCompletions.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ margin: '4px 2px 12px' }}>
              Task completions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {taskCompletions.map((approval) =>
                renderCard(buildApprovalCardView(snapshot.family, approval)),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
