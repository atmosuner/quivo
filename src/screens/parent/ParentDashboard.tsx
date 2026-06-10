import { useEffect, useState, type ReactNode } from 'react'
import QRCode from 'qrcode'
import {
  Avatar,
  Bar,
  Button,
  Coin,
  IconTile,
  Mini,
  WeekChart,
} from '../../components/index.ts'
import { bell, chevR, flameFill, lock, shield, star } from '../../components/icons/icons.tsx'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { signOutGoogle } from '../../lib/firebase/googleAuth.ts'
import { isValidPin } from '../../lib/security/parentPin.ts'
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
const LockIcon = lock
const Shield = shield
const Star = star

function SetPinModal({ childId, childName, hasPin, onClose }: {
  childId: string
  childName: string
  hasPin: boolean
  onClose: () => void
}) {
  const setChildPin = useFamilyStore((state) => state.setChildPin)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!isValidPin(pin)) { setError('PIN must be exactly 4 digits.'); return }
    if (pin !== confirm) { setError("PINs don't match."); return }
    setBusy(true)
    await setChildPin(childId, pin)
    onClose()
  }

  const handleRemove = async () => {
    setBusy(true)
    await setChildPin(childId, null)
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'var(--bg)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '24px 20px 40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="t-h3" style={{ marginBottom: 4 }}>
          {hasPin ? `Change PIN for ${childName}` : `Set PIN for ${childName}`}
        </div>
        <p className="t-body" style={{ color: 'var(--ink-2)', marginBottom: 20, fontSize: 14 }}>
          Children enter this PIN to access their profile.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="field-input"
            type="number"
            inputMode="numeric"
            placeholder="New 4-digit PIN"
            value={pin}
            maxLength={4}
            onChange={(e) => { setPin(e.target.value.slice(0, 4)); setError(null) }}
            autoFocus
          />
          <input
            className="field-input"
            type="number"
            inputMode="numeric"
            placeholder="Confirm PIN"
            value={confirm}
            maxLength={4}
            onChange={(e) => { setConfirm(e.target.value.slice(0, 4)); setError(null) }}
          />
          {error && (
            <div style={{ fontSize: 13, color: 'oklch(0.55 0.18 15)', fontWeight: 600 }}>{error}</div>
          )}
          <Button variant="primary" size="md" block disabled={busy} onClick={() => void handleSave()}>
            {busy ? 'Saving…' : 'Save PIN'}
          </Button>
          {hasPin && (
            <Button variant="ghost" size="md" block disabled={busy} onClick={() => void handleRemove()}>
              Remove PIN
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsRow({
  icon, title, sub, onClick,
}: {
  icon: ReactNode
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', background: 'var(--surface)', borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-2)', padding: '14px 16px', border: 'none',
        font: 'inherit', textAlign: 'left', cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <div>
          <div className="t-h3" style={{ fontSize: 15 }}>{title}</div>
          <div className="t-cap" style={{ marginTop: 1 }}>{sub}</div>
        </div>
      </div>
      <ChevR size={16} stroke="var(--ink-4)" />
    </button>
  )
}

function QrModal({ onClose }: { onClose: () => void }) {
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const familyId = useFamilyStore((state) => state.snapshot?.family.id) ?? ''

  useEffect(() => {
    if (!familyId) return
    void QRCode.toDataURL(familyId, { width: 240, margin: 2, color: { dark: '#000', light: '#fff' } })
      .then(setQrUrl)
  }, [familyId])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', background: 'var(--bg)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
          padding: '28px 20px 48px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="t-h3">Connect a child device</div>
        <p className="t-body" style={{ color: 'var(--ink-2)', textAlign: 'center', fontSize: 14, maxWidth: 280 }}>
          Open Quivo on the child's device, tap <strong>Child device</strong>, and scan this code.
        </p>
        {qrUrl ? (
          <img
            src={qrUrl}
            alt="Family QR code"
            width={200}
            height={200}
            style={{ borderRadius: 12, border: '1px solid var(--line)' }}
          />
        ) : (
          <div style={{ width: 200, height: 200, background: 'var(--surface)', borderRadius: 12, display: 'grid', placeItems: 'center' }}>
            <div className="t-cap">Generating…</div>
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>
          Keep this code private — anyone who scans it can view your family data.
        </p>
      </div>
    </div>
  )
}

export function ParentDashboard() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const setParentScreen = useAppStore((state) => state.setParentScreen)
  const [pinModalChildId, setPinModalChildId] = useState<string | null>(null)
  const [showQrModal, setShowQrModal] = useState(false)

  if (!snapshot) return null

  const { family } = snapshot
  const queueCount = countPendingApprovals(family)
  const referenceDate = getReferenceDate(snapshot)
  const weekDays = getFamilyWeekChartDays(family.children, referenceDate)
  const weekTotal = weekDays.reduce((sum, day) => sum + day.xp, 0)

  const handleSignOut = async () => {
    await signOutGoogle()
    useFamilyStore.setState({ snapshot: null, isLoading: false })
    useAppStore.getState().setOnboardingScreen('landing')
    useAppStore.getState().setMode('onboarding')
  }

  const pinChild = pinModalChildId ? family.children.find((c) => c.id === pinModalChildId) : null

  return (
    <>
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
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPinModalChildId(child.id) }}
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'none',
                    border: '1px solid var(--line)',
                    borderRadius: 99,
                    padding: '5px 12px',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--ink-3)',
                    fontFamily: 'var(--font)',
                  }}
                >
                  <LockIcon size={12} stroke="var(--ink-4)" />
                  {child.pinHash ? 'Change PIN' : 'Set PIN'}
                </button>
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
            {
              icon: 'gift',
              label: 'Rewards',
              sub: `${family.rewards.filter((r) => r.active).length} active`,
              tone: '--coin-ink',
              screen: 'parentrewards' as const,
            },
            {
              icon: 'pages',
              label: 'Add book',
              sub: 'Reading list',
              tone: '--cat-reading',
              screen: 'parentaddbook' as const,
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

        <div className="t-eyebrow" style={{ margin: '24px 2px 12px' }}>
          Devices &amp; Account
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SettingsRow
            icon={<span style={{ fontSize: 18, lineHeight: 1 }}>📱</span>}
            title="Connect a child device"
            sub="Show QR code to link another device"
            onClick={() => setShowQrModal(true)}
          />
          <SettingsRow
            icon={<span style={{ fontSize: 18, lineHeight: 1 }}>🚪</span>}
            title="Sign out"
            sub="Sign out of your Google account"
            onClick={() => { void handleSignOut() }}
          />
        </div>
      </div>
    </div>

    {pinChild && (
      <SetPinModal
        childId={pinChild.id}
        childName={pinChild.name}
        hasPin={!!pinChild.pinHash}
        onClose={() => setPinModalChildId(null)}
      />
    )}
    {showQrModal && (
      <QrModal onClose={() => setShowQrModal(false)} />
    )}
    </>
  )
}
