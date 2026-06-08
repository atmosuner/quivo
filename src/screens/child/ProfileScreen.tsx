import {
  Avatar,
  Button,
  IconTile,
  WeekChart,
} from '../../components/index.ts'
import { cssVar } from '../../components/lib/css.ts'
import { chevR, shield, star } from '../../components/icons/icons.tsx'
import { getIcon } from '../../components/icons/icons.tsx'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import {
  getActiveChild,
  getLevelTitle,
  getReferenceDate,
  getWeekChartDays,
} from '../shared/selectors.ts'

const ChevR = chevR
const Shield = shield
const Star = star

export function ProfileScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const switchActiveChild = useFamilyStore((state) => state.switchActiveChild)
  const setActiveTab = useAppStore((state) => state.setActiveTab)
  const pushChildScreen = useAppStore((state) => state.pushChildScreen)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  if (!child) return null

  const referenceDate = getReferenceDate(snapshot)
  const weekDays = getWeekChartDays(child, referenceDate)
  const weekTotal = child.weeklyXp.reduce((sum, xp) => sum + xp, 0)

  const statCards = [
    {
      icon: 'bolt',
      label: 'Total XP',
      value: child.totalXp.toLocaleString(),
      tone: '--brand',
    },
    {
      icon: 'flame',
      label: 'Day streak',
      value: child.habitStreak,
      tone: '--streak',
    },
    {
      icon: 'book',
      label: 'Books read',
      value: child.booksReadLifetime,
      tone: '--cat-reading',
    },
    {
      icon: 'check',
      label: 'Tasks done',
      value: child.tasksCompletedLifetime,
      tone: '--success',
    },
  ]

  const menuItems = [
    {
      icon: 'book',
      label: 'Reading tracker',
      tone: '--cat-reading',
      action: () => pushChildScreen({ screen: 'reading', dataId: child.id }),
    },
    {
      icon: 'trophy',
      label: 'Achievements',
      tone: '--coin-ink',
      action: () => setActiveTab('achievements'),
    },
    {
      icon: 'settings',
      label: 'Settings',
      tone: '--ink-2',
      action: () => pushChildScreen({ screen: 'settings', dataId: child.id }),
    },
  ]

  return (
    <div className="q-scroll q-body-tabbed">
      <div
        style={{
          padding: '70px 20px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Avatar size={92} initial={child.initial} avatar={child.avatar} ring />
        <h1 className="t-h1" style={{ marginTop: 16 }}>
          {child.name}
        </h1>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 8,
            height: 30,
            padding: '0 14px',
            borderRadius: 99,
            background: 'var(--brand-tint)',
            color: 'var(--brand-ink)',
            fontWeight: 700,
            fontSize: 13.5,
            whiteSpace: 'nowrap',
          }}
        >
          <Star size={15} /> Level {child.level} · {getLevelTitle(child.level)}
        </div>
        {child.coinsPending > 0 && (
          <div className="t-cap" style={{ marginTop: 10 }}>
            {child.coinsPending} coins pending approval
          </div>
        )}
      </div>

      {snapshot.family.children.length > 1 && (
        <div
          className="seg"
          style={{ margin: '0 20px 8px' }}
        >
          {snapshot.family.children.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={entry.id === child.id ? 'on' : ''}
              onClick={() => void switchActiveChild(entry.id)}
            >
              {entry.name}
            </button>
          ))}
        </div>
      )}

      <div className="q-body" style={{ paddingTop: 22 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {statCards.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-2)',
                padding: '15px 16px',
              }}
            >
              <IconTile icon={stat.icon} tone={stat.tone} size={36} r={11} />
              <div
                className="t-num"
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginTop: 11,
                  color: 'var(--ink)',
                }}
              >
                {stat.value}
              </div>
              <div className="t-cap" style={{ marginTop: 1 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-2)',
            padding: '17px 18px',
            marginTop: 14,
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
            <span className="t-h3">This week</span>
            <span
              className="t-num"
              style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}
            >
              {weekTotal} XP
            </span>
          </div>
          <WeekChart days={weekDays} />
        </div>

        <div
          style={{
            marginTop: 14,
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--sh-2)',
            overflow: 'hidden',
          }}
        >
          {menuItems.map((item, index) => {
            const I = getIcon(item.icon)
            return (
              <button
                key={item.label}
                type="button"
                className="pressable"
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '14px 16px',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    index < menuItems.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  font: 'inherit',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ color: cssVar(item.tone) }}>
                  <I size={21} />
                </span>
                <span className="t-h3" style={{ flex: 1, fontSize: 15.5 }}>
                  {item.label}
                </span>
                <ChevR size={18} stroke="var(--ink-4)" />
              </button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="md"
          block
          style={{ marginTop: 18 }}
          onClick={() => {
            const app = useAppStore.getState()
            app.setParentScreen('dash')
            app.setMode('parent')
          }}
        >
          <Shield size={19} stroke="var(--brand)" /> Parent area
        </Button>
      </div>
    </div>
  )
}
