import { useState } from 'react'
import { Chip, EmptyState, Header, TaskRow } from '../../components/index.ts'
import { check } from '../../components/icons/icons.tsx'

const Check = check
import { TASK_CATEGORIES } from '../../data/categories.ts'
import type { TaskCategory } from '../../types/domain.ts'
import type { Task } from '../../types/domain.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import {
  getActiveChild,
  getChildTasks,
  isTaskActionable,
  isTaskComplete,
} from '../shared/selectors.ts'

type QuestFilter = 'all' | TaskCategory

const FILTER_OPTIONS: QuestFilter[] = [
  'all',
  'reading',
  'responsibility',
  'learning',
  'health',
  'family',
]

export function QuestsScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const submitTaskCompletion = useFamilyStore((state) => state.submitTaskCompletion)
  const [filter, setFilter] = useState<QuestFilter>('all')

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const allTasks = getChildTasks(snapshot.family, child.id)
  const list =
    filter === 'all'
      ? allTasks
      : allTasks.filter((task) => task.category === filter)
  const active = list.filter((task) => !isTaskComplete(task))
  const done = list.filter(isTaskComplete)

  const handleComplete = (task: Task) => {
    if (!isTaskActionable(task)) return
    void submitTaskCompletion(task.id)
  }

  return (
    <div className="q-scroll q-body-tabbed">
      <Header title="Quests" subtitle={`${active.length} tasks available`} />
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          padding: '6px 20px 4px',
          scrollbarWidth: 'none',
        }}
      >
        {FILTER_OPTIONS.map((key) => (
          <Chip
            key={key}
            active={filter === key}
            onClick={() => setFilter(key)}
            style={{ flexShrink: 0, cursor: 'pointer', border: 'none', font: 'inherit' }}
          >
            {key === 'all' ? 'All' : TASK_CATEGORIES[key].label}
          </Chip>
        ))}
      </div>

      <div className="q-body" style={{ paddingTop: 14 }}>
        {allTasks.length === 0 && (
          <EmptyState
            icon={<Check size={32} />}
            title="No quests yet"
            description="Ask a parent to add tasks from the parent area."
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {active.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={handleComplete}
              onOpen={() =>
                useAppStore.getState().pushChildScreen({ screen: 'task', dataId: task.id })
              }
            />
          ))}
        </div>
        {done.length > 0 && (
          <>
            <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>
              Completed today
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {done.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={handleComplete}
                  onOpen={() =>
                    useAppStore.getState().pushChildScreen({ screen: 'task', dataId: task.id })
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
