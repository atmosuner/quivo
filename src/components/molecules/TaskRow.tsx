import { TASK_CATEGORIES } from '../../data/categories.ts'
import type { Task } from '../../types/domain.ts'
import { Coin } from '../atoms/Coin.tsx'
import { IconTile } from '../atoms/IconTile.tsx'
import { bolt, check, clock, hourglass } from '../icons/icons.tsx'

const Bolt = bolt
const Check = check
const Clock = clock
const Hourglass = hourglass

export interface TaskRowProps {
  task: Task
  onToggle?: (task: Task) => void
  onOpen?: (task: Task) => void
}

function isTaskDone(task: Task): boolean {
  return task.status === 'completed_today'
}

function isTaskPending(task: Task): boolean {
  return task.status === 'pending_approval'
}

export function TaskRow({ task, onToggle, onOpen }: TaskRowProps) {
  const done = isTaskDone(task)
  const pending = isTaskPending(task)
  const category = TASK_CATEGORIES[task.category]

  return (
    <div
      className="pressable"
      onClick={() => onOpen?.(task)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '13px 14px',
        background: 'var(--surface)',
        borderRadius: 'var(--r-md)',
        boxShadow: 'var(--sh-1)',
        opacity: done ? 0.62 : pending ? 0.88 : 1,
      }}
    >
      <IconTile icon={task.icon} tone={category.toneVar} size={42} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="t-h3"
          style={{
            textDecoration: done ? 'line-through' : 'none',
            textDecorationColor: 'var(--ink-4)',
          }}
        >
          {task.title}
        </div>
        {pending && (
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--coin-ink)',
              marginTop: 3,
            }}
          >
            Waiting for parent approval
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 5,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12.5,
              fontWeight: 700,
              color: 'var(--brand)',
            }}
          >
            <Bolt size={13} />+{task.xp}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Coin size={14} />
            <span
              className="t-num"
              style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--coin-ink)' }}
            >
              +{task.coins}
            </span>
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ink-3)',
            }}
          >
            <Clock size={13} />
            {task.estimatedMinutes}m
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle?.(task)
        }}
        className={`cbx${done ? ' on' : ''}${pending ? ' pending' : ''}`}
        aria-label={pending ? 'pending approval' : 'complete'}
        disabled={pending || done}
      >
        {done && <Check size={16} stroke="#fff" />}
        {pending && <Hourglass size={14} stroke="var(--coin-ink)" />}
      </button>
    </div>
  )
}
