import { useState } from 'react'
import { IconTile, SubHead } from '../../../components/index.ts'
import { chevR } from '../../../components/icons/icons.tsx'
import { DEVICE_FAMILY_ID_KEY, DEVICE_ROLE_KEY } from '../../../lib/storage/keys.ts'
import { useFamilyStore } from '../../../stores/familyStore.ts'
import { useAppStore } from '../../../stores/appStore.ts'
import { useSessionStore } from '../../../stores/sessionStore.ts'
import { InstallHint } from '../../shared/InstallHint.tsx'
import { getActiveChild } from '../../shared/selectors.ts'

const ChevR = chevR

interface SettingsRow {
  icon: string
  label: string
  tone: string
  detail?: string
  action?: () => void
}

interface SettingsGroup {
  head: string
  rows: SettingsRow[]
}

export interface SettingsScreenProps {
  onBack: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const switchActiveChild = useFamilyStore((state) => state.switchActiveChild)
  const exportData = useFamilyStore((state) => state.exportData)
  const [showInstallHint, setShowInstallHint] = useState(false)

  if (!snapshot) return null

  const child = getActiveChild(snapshot.family)
  const requireApproval = snapshot.family.settings.requireApprovalDefault

  const handleDisconnect = () => {
    localStorage.removeItem(DEVICE_ROLE_KEY)
    localStorage.removeItem(DEVICE_FAMILY_ID_KEY)
    useFamilyStore.setState({ snapshot: null, isLoading: true })
    useSessionStore.getState().clearEffects()
    useAppStore.getState().setDeviceRole('child')
    useAppStore.getState().setOnboardingScreen('landing')
    useAppStore.getState().setMode('onboarding')
    useFamilyStore.getState().markReady()
  }

  const handleExport = () => {
    exportData()
  }


  const groups: SettingsGroup[] = [
    {
      head: 'Account',
      rows: [
        {
          icon: 'user',
          label: child ? `${child.name}'s profile` : 'Active profile',
          tone: '--brand',
        },
        {
          icon: 'bell',
          label: 'Notifications',
          tone: '--cat-family',
          detail: 'On',
        },
      ],
    },
    {
      head: 'Parent controls',
      rows: [
        {
          icon: 'check',
          label: 'Approval required',
          tone: '--success',
          detail: requireApproval ? 'Reading & tasks' : 'Off',
        },
        {
          icon: 'gift',
          label: 'Reward approvals',
          tone: '--coin-ink',
          detail: 'On',
        },
      ],
    },
    {
      head: 'Data',
      rows: [
        {
          icon: 'pages',
          label: 'Export data',
          tone: '--cat-reading',
          detail: 'JSON backup',
          action: handleExport,
        },
        {
          icon: 'user',
          label: 'Disconnect this device',
          tone: '--ink-3',
          action: handleDisconnect,
        },
      ],
    },
    {
      head: 'App',
      rows: [
        {
          icon: 'moon',
          label: 'Appearance',
          tone: '--ink-2',
          detail: 'Light',
        },
        {
          icon: 'star',
          label: 'About Quivo',
          tone: '--cat-learning',
          detail: 'v1.0 MVP',
        },
        {
          icon: 'pages',
          label: 'Install app',
          tone: '--cat-reading',
          detail: 'Add to home screen',
          action: () => setShowInstallHint(true),
        },
      ],
    },
  ]

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead title="Settings" onBack={onBack} />
      <div style={{ padding: '4px 20px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>
        {snapshot.family.children.length > 1 && (
          <div>
            <div className="t-eyebrow" style={{ margin: '0 4px 10px' }}>
              Switch child
            </div>
            <div className="seg" role="group" aria-label="Switch child">
              {snapshot.family.children.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={entry.id === child?.id ? 'on' : ''}
                  onClick={() => void switchActiveChild(entry.id)}
                  aria-pressed={entry.id === child?.id}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.head}>
            <div className="t-eyebrow" style={{ margin: '0 4px 10px' }}>
              {group.head}
            </div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-2)',
                overflow: 'hidden',
              }}
            >
              {group.rows.map((row, index) => {
                const RowTag = row.action ? 'button' : 'div'
                return (
                  <RowTag
                    key={row.label}
                    type={row.action ? 'button' : undefined}
                    className={row.action ? 'pressable' : undefined}
                    onClick={row.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 13,
                      padding: '13px 15px',
                      borderBottom:
                        index < group.rows.length - 1 ? '1px solid var(--line-soft)' : 'none',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: row.action ? 'pointer' : 'default',
                    }}
                  >
                    <IconTile icon={row.icon} tone={row.tone} size={34} r={10} />
                    <span className="t-h3" style={{ flex: 1, fontSize: 15.5 }}>
                      {row.label}
                    </span>
                    {row.detail && <span className="t-cap">{row.detail}</span>}
                    {row.action && <ChevR size={17} stroke="var(--ink-4)" />}
                  </RowTag>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {showInstallHint && <InstallHint onClose={() => setShowInstallHint(false)} />}
    </div>
  )
}
