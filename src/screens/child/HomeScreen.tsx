import {
  Avatar,
  Button,
  Coin,
  EmptyState,
  IconTile,
  Ring,
  TaskRow,
} from '../../components/index.ts'
import { TASK_CATEGORIES } from '../../data/categories.ts'
import { XP_PER_LEVEL } from '../../types/gamification.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import type { Task } from '../../types/domain.ts'
import {
  formatGreetingDate,
  getActiveChild,
  getPagesReadThisMonth,
  getReferenceDate,
  getTodayTasks,
  getLevelTitle,
  isTaskActionable,
  isTaskComplete,
  isTaskPending,
} from '../shared/selectors.ts'
import { book, check, flameFill, refresh } from '../../components/icons/icons.tsx'

const Book = book
const Check = check
const FlameFill = flameFill
const Refresh = refresh

export function HomeScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const submitTaskCompletion = useFamilyStore((state) => state.submitTaskCompletion)
  const reload = useFamilyStore((state) => state.reload)
  const setActiveTab = useAppStore((state) => state.setActiveTab)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const referenceDate = getReferenceDate(snapshot)
  const todayTasks = getTodayTasks(snapshot.family, child.id)
  const doneCount = todayTasks.filter(isTaskComplete).length
  const nextTask = todayTasks.find(isTaskActionable)
  const hasPending = todayTasks.some(isTaskPending)
  const pct = Math.round((child.xpInLevel / XP_PER_LEVEL) * 100)
  const pagesThisMonth = getPagesReadThisMonth(
    snapshot.family.readingLogs,
    child.id,
    referenceDate,
  )

  const handleComplete = (task: Task) => {
    if (!isTaskActionable(task)) return
    void submitTaskCompletion(task.id)
  }

  return (
    <div className="q-scroll q-body-tabbed">
      <div
        style={{
          padding: '60px 20px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 5 }}>
            {formatGreetingDate(snapshot.meta.lastModified)}
          </div>
          <h1 className="t-h1">Good morning, {child.name}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => void reload()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              color: 'var(--ink-3)',
            }}
            aria-label="Refresh"
          >
            <Refresh size={18} />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            aria-label="Open profile"
          >
            <Avatar size={48} initial={child.initial} avatar={child.avatar} />
          </button>
        </div>
      </div>

      <div className="q-body">
        <div
          className="rise g-brand"
          style={{
            borderRadius: 'var(--r-xl)',
            padding: 20,
            position: 'relative',
            overflow: 'hidden',
            color: '#fff',
            boxShadow: 'var(--sh-brand)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: -40,
              top: -50,
              width: 170,
              height: 170,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.12)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 40,
              bottom: -70,
              width: 130,
              height: 130,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 15,
                    background: 'rgba(255,255,255,0.18)',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
                  }}
                >
                  <div style={{ textAlign: 'center', lineHeight: 1 }}>
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        opacity: 0.8,
                        letterSpacing: '0.06em',
                      }}
                    >
                      LVL
                    </div>
                    <div className="t-num" style={{ fontSize: 20, fontWeight: 800 }}>
                      {child.level}
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getLevelTitle(child.level)}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.82 }}>
                    {child.totalXp.toLocaleString()} total XP
                  </div>
                </div>
              </div>
              <span
                className="t-num"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  height: 34,
                  padding: '0 12px',
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.2)',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                <FlameFill size={15} />
                {child.habitStreak}
              </span>
            </div>
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 7,
                  gap: 10,
                }}
              >
                <span
                  className="t-num"
                  style={{ fontSize: 13, fontWeight: 700, opacity: 0.95, whiteSpace: 'nowrap' }}
                >
                  {child.xpInLevel} / {XP_PER_LEVEL} XP
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    opacity: 0.8,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {XP_PER_LEVEL - child.xpInLevel} to Lvl {child.level + 1}
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 99,
                  background: 'rgba(255,255,255,0.22)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: 'rgba(255,255,255,0.95)',
                    transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            type="button"
            className="pressable"
            onClick={() => setActiveTab('rewards')}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-2)',
              padding: '15px 16px',
              border: 'none',
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Coin size={22} />
              <span className="t-cap">Coin balance</span>
            </div>
            <div
              className="t-num"
              style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: 'var(--ink)' }}
            >
              {child.coins}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brand)',
                marginTop: 2,
              }}
            >
              Spend in Rewards →
            </div>
          </button>
          <button
            type="button"
            className="pressable"
            onClick={() => useAppStore.getState().pushChildScreen({ screen: 'reading', dataId: child.id })}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-2)',
              padding: '15px 16px',
              border: 'none',
              textAlign: 'left',
              font: 'inherit',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--cat-reading)',
              }}
            >
              <Book size={20} />
              <span className="t-cap">Reading</span>
            </div>
            <div
              className="t-num"
              style={{ fontSize: 26, fontWeight: 800, marginTop: 8, color: 'var(--ink)' }}
            >
              {pagesThisMonth}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--ink-3)',
                marginTop: 2,
              }}
            >
              pages this month
            </div>
          </button>
        </div>

        <div style={{ marginTop: 26 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '0 2px 13px',
            }}
          >
            <h3 className="t-h2">Today</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                className="t-num"
                style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}
              >
                {doneCount}/{todayTasks.length} done
              </span>
              <Ring
                pct={todayTasks.length ? (doneCount / todayTasks.length) * 100 : 0}
                size={26}
              />
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon={<Check size={32} />}
              title="No quests today"
              description="Check back later or ask a parent to add tasks."
            />
          ) : nextTask ? (
            <div
              style={{
                marginBottom: 14,
                background: 'var(--brand-tint)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
                border: '1px solid color-mix(in oklab, var(--brand) 12%, transparent)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <IconTile
                  icon={nextTask.icon}
                  tone={TASK_CATEGORIES[nextTask.category].toneVar}
                  size={46}
                  fill
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-eyebrow" style={{ color: 'var(--brand)' }}>
                    Up next
                  </div>
                  <div className="t-h3" style={{ marginTop: 2 }}>
                    {nextTask.title}
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="md"
                block
                style={{ marginTop: 14, whiteSpace: 'nowrap' }}
                onClick={() => handleComplete(nextTask)}
              >
                <Check size={19} /> Complete · +{nextTask.xp} XP
              </Button>
            </div>
          ) : hasPending ? (
            <div
              style={{
                marginBottom: 14,
                background: 'var(--coin-tint)',
                borderRadius: 'var(--r-lg)',
                padding: '18px 16px',
              }}
            >
              <div className="t-h3">Submitted — waiting for parent</div>
              <div className="t-body" style={{ fontSize: 13, marginTop: 4 }}>
                Your quests are in the approval queue.
              </div>
            </div>
          ) : (
            <div
              style={{
                marginBottom: 14,
                background: 'var(--success-tint)',
                borderRadius: 'var(--r-lg)',
                padding: '18px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: 'var(--success)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                }}
              >
                <Check size={24} />
              </div>
              <div>
                <div className="t-h3">All done for today!</div>
                <div className="t-body" style={{ fontSize: 13 }}>
                  Amazing work. Come back tomorrow.
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayTasks.map((task) => (
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
        </div>
      </div>
    </div>
  )
}
