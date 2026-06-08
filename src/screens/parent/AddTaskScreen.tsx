import { useState } from 'react'
import {
  Button,
  Field,
  IconTile,
  Stepper,
  SubHead,
  Toggle,
} from '../../components/index.ts'
import { TASK_CATEGORIES } from '../../data/categories.ts'
import { cssVar } from '../../components/lib/css.ts'
import { plus } from '../../components/icons/icons.tsx'
import type {
  TaskCategory,
  TaskDifficulty,
  TaskRepeat,
} from '../../types/domain.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Plus = plus

type Assignee = 'one' | 'all'

export function AddTaskScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const createTask = useFamilyStore((state) => state.createTask)
  const setParentScreen = useAppStore((state) => state.setParentScreen)

  const children = snapshot?.family.children ?? []
  const defaultChildId = children[0]?.id ?? ''

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<TaskCategory>('responsibility')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(1)
  const [xp, setXp] = useState(10)
  const [coins, setCoins] = useState(5)
  const [requiresApproval, setRequiresApproval] = useState(true)
  const [repeat, setRepeat] = useState<TaskRepeat>('daily')
  const [assignee, setAssignee] = useState<Assignee>('one')
  const [childId, setChildId] = useState(defaultChildId)
  const [estimatedMinutes, setEstimatedMinutes] = useState(10)
  const [saving, setSaving] = useState(false)

  const handleCreate = async () => {
    if (!title.trim() || !children.length) return

    const childIds =
      assignee === 'all' ? children.map((child) => child.id) : [childId]

    setSaving(true)
    await createTask({
      childIds,
      title,
      category,
      xp,
      coins,
      difficulty,
      estimatedMinutes,
      repeat,
      requiresApproval,
    })
    setSaving(false)

    if (!useFamilyStore.getState().error) {
      setParentScreen('dash')
    }
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="New task" onBack={() => setParentScreen('dash')} />
      <div className="q-body" style={{ paddingTop: 8 }}>
        <Field
          label="Task name"
          placeholder="e.g. Practice piano"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Category</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            {Object.values(TASK_CATEGORIES).map((meta) => (
              <button
                key={meta.key}
                type="button"
                className="chip"
                onClick={() => setCategory(meta.key)}
                style={{
                  cursor: 'pointer',
                  border:
                    category === meta.key
                      ? `1.5px solid ${cssVar(meta.toneVar)}`
                      : '1.5px solid transparent',
                  background:
                    category === meta.key ? cssVar(meta.tintVar) : 'var(--surface-3)',
                  color:
                    category === meta.key ? cssVar(meta.toneVar) : 'var(--ink-2)',
                  fontWeight: 700,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: cssVar(meta.toneVar),
                  }}
                />
                {meta.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Assign to</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={
                  assignee === 'one' && childId === child.id ? 'on' : ''
                }
                onClick={() => {
                  setAssignee('one')
                  setChildId(child.id)
                }}
              >
                {child.name}
              </button>
            ))}
            <button
              type="button"
              className={assignee === 'all' ? 'on' : ''}
              onClick={() => setAssignee('all')}
            >
              Both
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Difficulty</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {(['Easy', 'Medium', 'Hard'] as const).map((label, index) => (
              <button
                key={label}
                type="button"
                className={difficulty === index + 1 ? 'on' : ''}
                onClick={() => setDifficulty((index + 1) as TaskDifficulty)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          <Stepper label="XP reward" icon="bolt" tone="--brand" value={xp} onChange={setXp} step={5} />
          <Stepper label="Coins" coin value={coins} onChange={setCoins} step={1} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <Stepper
            label="Est. minutes"
            icon="clock"
            tone="--ink-2"
            value={estimatedMinutes}
            onChange={setEstimatedMinutes}
            step={5}
            min={1}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <span className="t-label">Repeat</span>
          <div className="seg" style={{ marginTop: 10 }}>
            {(['Once', 'Daily', 'Weekly'] as const).map((label) => {
              const value = label.toLowerCase() as TaskRepeat
              return (
                <button
                  key={label}
                  type="button"
                  className={repeat === value ? 'on' : ''}
                  onClick={() => setRepeat(value)}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            padding: '14px 16px',
            background: 'var(--surface)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-1)',
          }}
        >
          <IconTile icon="shield" tone="--brand" size={38} r={11} />
          <div style={{ flex: 1 }}>
            <div className="t-h3" style={{ fontSize: 15 }}>
              Require approval
            </div>
            <div className="t-cap">Review before XP is granted</div>
          </div>
          <Toggle on={requiresApproval} onChange={setRequiresApproval} />
        </div>
      </div>

      <div style={{ padding: '6px 20px 8px' }}>
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!title.trim() || saving}
          onClick={() => void handleCreate()}
        >
          <Plus size={20} /> Create task
        </Button>
      </div>
    </div>
  )
}
