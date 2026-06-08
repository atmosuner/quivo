import {
  Avatar,
  Bar,
  Coin,
  IconTile,
  Mini,
  WeekChart,
} from '../../components/index.ts'
import { bell, chevR, flameFill, shield, star } from '../../components/icons/icons.tsx'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { getReferenceDate } from '../shared/selectors.ts'
import {
  countPendingApprovals,
  countPendingApprovalsForChild,
  countTasksDoneToday,
  countTasksTodayTotal,
  getFamilyWeekChartDays,
} from '../shared/parentSelectors.ts'

const Bell = bell
const ChevR = chevR
const FlameFill = flameFill
const Shield = shield
const Star = star

export function ParentDashboard() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const setParentScreen = useAppStore((state) => state.setParentScreen)
  const setMode = useAppStore((state) => state.setMode)
  const lock = useParentGateStore((state) => state.lock)

  if (!snapshot) return null

  const { family } = snapshot
  const queueCount = countPendingApprovals(family)
  const referenceDate = getReferenceDate(snapshot)
  const weekDays = getFamilyWeekChartDays(family.children, referenceDate)
  const weekTotal = weekDays.reduce((sum, day) => sum + day.xp, 0)

  const exitParent = () => {
    lock()
    setMode('child')
    setParentScreen('dash')
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <div
        style={{
          padding: '58px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            className="t-eyebrow"
            style={{ marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Shield size={14} stroke="var(--brand)" /> Parent area
          </div>
          <h1 className="t-h1">Family</h1>
        </div>
        <button
          type="button"
          onClick={exitParent}
          style={{
            height: 38,
            padding: '0 14px',
            borderRadius: 99,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            boxShadow: 'var(--sh-1)',
            cursor: 'pointer',
            fontFamily: 'var(--font)',
            fontWeight: 700,
            fontSize: 13,
            color: 'var(--ink-2)',
          }}
        >
          Exit
        </button>
      </div>

      <div className="q-body">
        {queueCount > 0 && (
          <button
            type="button"
            className="pressable g-brand"
            onClick={() => setParentScreen('approval')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              padding: 16,
              borderRadius: 'var(--r-lg)',
              color: '#fff',
              boxShadow: 'var(--sh-brand)',
              width: '100%',
              border: 'none',
              font: 'inherit',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: 'rgba(255,255,255,0.2)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Bell size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>
                {queueCount} items to review
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85 }}>
                Tasks, reading logs & redemptions
              </div>
            </div>
            <ChevR size={20} />
          </button>
        )}

        <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>
          Children
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {family.children.map((child) => {
            const tasksDone = countTasksDoneToday(family.tasks, child.id)
            const tasksTotal = countTasksTodayTotal(family.tasks, child.id)
            const pending = countPendingApprovalsForChild(family, child.id)
            const pct = tasksTotal ? (tasksDone / tasksTotal) * 100 : 0

            return (
              <div
                key={child.id}
                className="pressable"
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--sh-2)',
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  <Avatar size={50} initial={child.initial} avatar={child.avatar} />
                  <div style={{ flex: 1 }}>
                    <div className="t-h3" style={{ fontSize: 16.5 }}>
                      {child.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: 'var(--ink-3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginTop: 3,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Star size={13} stroke="var(--brand)" /> Level {child.level}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          color: 'var(--streak)',
                        }}
                      >
                        <FlameFill size={13} /> {child.habitStreak}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <Coin size={13} /> {child.coins}
                      </span>
                      {pending > 0 && (
                        <span style={{ color: 'var(--brand)', fontWeight: 700 }}>
                          {pending} pending
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="t-num" style={{ fontWeight: 800, fontSize: 15 }}>
                      {tasksDone}/{tasksTotal}
                    </div>
                    <div className="t-cap">today</div>
                  </div>
                </div>
                <div style={{ marginTop: 13 }}>
                  <Bar
                    pct={pct}
                    thin
                    fillStyle={{
                      background: `linear-gradient(90deg, oklch(0.5 0.15 ${child.avatar.hue1}), oklch(0.62 0.15 ${child.avatar.hue2}))`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>
          Manage
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            {
              icon: 'plus',
              label: 'Add task',
              sub: 'Create a habit',
              tone: '--brand',
              screen: 'addtask' as const,
            },
            {
              icon: 'check',
              label: 'Approvals',
              sub: `${queueCount} pending`,
              tone: '--success',
              screen: 'approval' as const,
            },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              className="pressable"
              onClick={() => setParentScreen(action.screen)}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-2)',
                padding: 16,
                border: 'none',
                font: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <IconTile icon={action.icon} tone={action.tone} size={40} r={12} />
              <div className="t-h3" style={{ marginTop: 11, fontSize: 15.5 }}>
                {action.label}
              </div>
              <div className="t-cap" style={{ marginTop: 1 }}>
                {action.sub}
              </div>
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-2)',
            padding: '17px 18px',
            marginTop: 22,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 16,
            }}
          >
            <span className="t-h3">Family activity</span>
            <span className="t-cap">This week · {weekTotal} XP</span>
          </div>
          <WeekChart days={weekDays} />
          <div
            style={{
              display: 'flex',
              gap: 18,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--line-soft)',
            }}
          >
            <Mini
              label="Pending"
              value={queueCount}
            />
            <Mini
              label="Children"
              value={family.children.length}
            />
            <Mini
              label="Active tasks"
              value={family.tasks.filter((task) => task.status === 'open').length}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
