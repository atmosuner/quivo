import { useState } from 'react'
import { Button, Coin, EmptyState, Field, SubHead } from '../../components/index.ts'
import { gift, plus } from '../../components/icons/icons.tsx'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useAppStore } from '../../stores/appStore.ts'

const Gift = gift
const Plus = plus

const COVER_TONES = [250, 160, 12, 295, 78, 45, 330, 200]

type View = 'list' | 'add'

export function ParentRewardsScreen() {
  const snapshot = useFamilyStore((state) => state.snapshot)
  const createReward = useFamilyStore((state) => state.createReward)
  const toggleReward = useFamilyStore((state) => state.toggleReward)
  const setParentScreen = useAppStore((state) => state.setParentScreen)

  const [view, setView] = useState<View>('list')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('')
  const [selectedTone, setSelectedTone] = useState(COVER_TONES[0])
  const [saving, setSaving] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  if (!snapshot) return null

  const rewards = snapshot.family.rewards

  const costNum = Number.parseInt(cost, 10)
  const isValid = title.trim().length > 0 && Number.isFinite(costNum) && costNum > 0

  const handleCreate = async () => {
    if (!isValid) {
      setFieldError('Enter a title and a coin cost greater than zero.')
      return
    }
    setFieldError(null)
    setSaving(true)
    await createReward({
      title: title.trim(),
      description: description.trim(),
      cost: costNum,
      coverTone: selectedTone,
    })
    setSaving(false)
    if (!useFamilyStore.getState().error) {
      setTitle('')
      setDescription('')
      setCost('')
      setSelectedTone(COVER_TONES[0])
      setView('list')
    }
  }

  if (view === 'add') {
    return (
      <div className="q-scroll" style={{ paddingBottom: 28 }}>
        <SubHead title="New reward" onBack={() => { setView('list'); setFieldError(null) }} />
        <div className="q-body" style={{ paddingTop: 8 }}>
          <Field
            label="Reward title"
            placeholder="e.g. Movie night"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Field
            label="Description (optional)"
            placeholder="e.g. Pick any movie for family night"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Field
            label="Coin cost"
            placeholder="50"
            num
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />

          <div style={{ marginBottom: 20 }}>
            <div className="t-label" style={{ marginBottom: 10 }}>Color</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {COVER_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 99,
                    background: `oklch(0.65 0.18 ${tone})`,
                    border: selectedTone === tone ? '3px solid var(--ink)' : '3px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedTone === tone ? 'var(--sh-2)' : 'none',
                  }}
                  aria-label={`Color ${tone}`}
                  aria-pressed={selectedTone === tone}
                />
              ))}
            </div>
          </div>

          {fieldError && (
            <div className="t-cap" role="alert" style={{ marginBottom: 12, color: 'var(--coin-ink)' }}>
              {fieldError}
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            block
            disabled={saving || !isValid}
            onClick={() => void handleCreate()}
          >
            <Plus size={20} /> {saving ? 'Creating…' : 'Create reward'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="q-scroll" style={{ paddingBottom: 28 }}>
      <SubHead
        title="Rewards"
        onBack={() => setParentScreen('dash')}
        right={
          <button
            type="button"
            onClick={() => setView('add')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontFamily: 'var(--font)',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <Plus size={20} /> New
          </button>
        }
      />
      <div className="q-body" style={{ paddingTop: 4 }}>
        {rewards.length === 0 && (
          <EmptyState
            icon={<Gift size={32} />}
            title="No rewards yet"
            description="Add rewards children can redeem with their coins."
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rewards.map((reward) => (
            <div
              key={reward.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-2)',
                overflow: 'hidden',
                opacity: reward.active ? 1 : 0.55,
              }}
            >
              <div
                style={{
                  height: 6,
                  background: `oklch(0.65 0.18 ${reward.coverTone})`,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '14px 15px',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-h3" style={{ fontSize: 15.5 }}>{reward.title}</div>
                  {reward.description && (
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 2 }}>
                      {reward.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                    <Coin size={15} />
                    <span className="t-num" style={{ fontWeight: 800, fontSize: 14, color: 'var(--coin-ink)' }}>
                      {reward.cost}
                    </span>
                    <span className="t-cap">coins</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleReward(reward.id)}
                  style={{
                    height: 30,
                    padding: '0 12px',
                    borderRadius: 99,
                    border: '1px solid var(--line)',
                    background: reward.active ? 'var(--success-tint, oklch(0.95 0.05 145))' : 'var(--surface-2)',
                    color: reward.active ? 'var(--success)' : 'var(--ink-3)',
                    fontFamily: 'var(--font)',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {reward.active ? 'Active' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
