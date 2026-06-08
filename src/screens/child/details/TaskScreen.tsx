import {
  Button,
  CatTag,
  CoinStat,
  Difficulty,
  IconTile,
  RewardStat,
  SubHead,
} from '../../../components/index.ts'
import { DetailNotFound } from '../../shared/DetailNotFound.tsx'
import { TASK_CATEGORIES } from '../../../data/categories.ts'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import {
  formatDifficulty,
  formatRepeat,
  getTaskById,
  isTaskActionable,
  isTaskComplete,
  isTaskPending,
} from '../../shared/selectors.ts'
import { check, shield } from '../../../components/icons/icons.tsx'

const Check = check
const Shield = shield

export interface TaskScreenProps {
  taskId: string
  onBack: () => void
}

export function TaskScreen({ taskId, onBack }: TaskScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const submitTaskCompletion = useFamilyStore((state) => state.submitTaskCompletion)

  if (!snapshot) return null

  const task = getTaskById(snapshot.family, taskId)
  if (!task) {
    return <DetailNotFound title="Task" onBack={onBack} />
  }

  const category = TASK_CATEGORIES[task.category]
  const done = isTaskComplete(task)
  const pending = isTaskPending(task)
  const open = isTaskActionable(task)

  const handleComplete = async () => {
    if (!open) return
    await submitTaskCompletion(task.id)
    if (!useFamilyStore.getState().error) {
      onBack()
    }
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="" onBack={onBack} />
      <div className="q-body" style={{ paddingTop: 4 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <IconTile icon={task.icon} tone={category.toneVar} size={84} r={26} fill />
          <div style={{ marginTop: 16 }}>
            <CatTag category={task.category} />
          </div>
          <h1 className="t-h1" style={{ marginTop: 12 }}>
            {task.title}
          </h1>
          {pending && (
            <div
              className="t-cap"
              style={{ marginTop: 8, color: 'var(--coin-ink)', fontWeight: 700 }}
            >
              Waiting for parent approval
            </div>
          )}
          {done && (
            <div
              className="t-cap"
              style={{ marginTop: 8, color: 'var(--success)', fontWeight: 700 }}
            >
              Completed today
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginTop: 24,
          }}
        >
          <RewardStat icon="bolt" value={`+${task.xp}`} label="XP" tone="--brand" />
          <CoinStat value={`+${task.coins}`} />
          <RewardStat
            icon="clock"
            value={`${task.estimatedMinutes}m`}
            label="Est. time"
            tone="--ink-2"
          />
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-2)',
            padding: '16px 18px',
            marginTop: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>
              Difficulty
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Difficulty level={task.difficulty} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {formatDifficulty(task.difficulty)}
              </span>
            </span>
          </div>
          <hr className="hr" style={{ margin: '13px 0' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>
              Repeats
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {formatRepeat(task.repeat)}
            </span>
          </div>
          <hr className="hr" style={{ margin: '13px 0' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>
              Approval
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ink-2)',
                whiteSpace: 'nowrap',
              }}
            >
              <Shield size={15} />
              {task.requiresApproval ? 'Parent reviews' : 'Instant reward'}
            </span>
          </div>
          <hr className="hr" style={{ margin: '13px 0' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="t-label" style={{ color: 'var(--ink-2)' }}>
              Status
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {done ? 'Completed today' : pending ? 'Pending approval' : 'Open'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '6px 20px 8px' }}>
        {open && (
          <Button variant="primary" size="lg" block onClick={() => void handleComplete()}>
            <Check size={21} /> Complete task
          </Button>
        )}
        {pending && (
          <Button variant="quiet" size="lg" block disabled>
            Submitted — awaiting parent
          </Button>
        )}
        {done && (
          <Button variant="quiet" size="lg" block disabled>
            Completed for today
          </Button>
        )}
      </div>
    </div>
  )
}
