import { useEffect, useMemo, useState } from 'react'
import { Button } from '../atoms/Button.tsx'
import { Coin } from '../atoms/Coin.tsx'
import { arrowUp, bolt, check } from '../icons/icons.tsx'

const ArrowUp = arrowUp
const Bolt = bolt
const Check = check

export interface CelebrationData {
  title: string
  sub?: string
  xp: number
  coins: number
  levelUp?: boolean
}

export interface CelebrationProps {
  data: CelebrationData | null
  onClose: () => void
}

const CONFETTI_HUES = [282, 250, 45, 160, 12]

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export function Celebration({ data, onClose }: CelebrationProps) {
  const [reduceMotion, setReduceMotion] = useState(prefersReducedMotion)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduceMotion(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const confetti = useMemo(() => {
    if (!data || reduceMotion) return []
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.3,
      dur: 1.4 + Math.random() * 0.8,
      sz: 7 + Math.random() * 7,
      round: Math.random() > 0.5,
      tall: Math.random() > 0.5,
      hue: CONFETTI_HUES[i % CONFETTI_HUES.length],
    }))
  }, [data, reduceMotion])

  if (!data) return null

  return (
    <div
      className={`celebration-overlay${reduceMotion ? ' no-motion' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      onClick={onClose}
    >
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((c) => (
          <span
            key={c.id}
            className="confetti-piece"
            style={{
              left: `${c.left}%`,
              width: c.sz,
              height: c.sz * (c.tall ? 1 : 0.5),
              borderRadius: c.round ? 99 : 2,
              background: `oklch(0.68 0.16 ${c.hue})`,
              animation: `q-fall ${c.dur}s ${c.delay}s cubic-bezier(.3,.6,.5,1) forwards`,
            }}
          />
        ))}
      </div>
      <div
        className={reduceMotion ? 'celebration-card' : 'celebration-card pop'}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={data.levelUp ? 'g-brand' : 'g-success'}
          style={{
            width: 84,
            height: 84,
            margin: '0 auto',
            borderRadius: 26,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            boxShadow: 'var(--sh-3)',
          }}
        >
          {data.levelUp ? <ArrowUp size={42} /> : <Check size={44} />}
        </div>
        <h2 id="celebration-title" className="t-h1" style={{ marginTop: 18, fontSize: 23 }}>
          {data.title}
        </h2>
        {data.sub && (
          <div className="t-body" style={{ marginTop: 5 }}>
            {data.sub}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 10,
            marginTop: 18,
          }}
        >
          {data.xp > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                height: 40,
                padding: '0 16px',
                borderRadius: 99,
                background: 'var(--brand-tint)',
                color: 'var(--brand-ink)',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              <Bolt size={17} />+{data.xp} XP
            </span>
          )}
          {data.coins > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 40,
                padding: '0 16px',
                borderRadius: 99,
                background: 'var(--coin-tint)',
                color: 'var(--coin-ink)',
                fontWeight: 800,
                fontSize: 16,
              }}
            >
              <Coin size={18} />+{data.coins}
            </span>
          )}
        </div>
        <Button
          variant="primary"
          size="md"
          block
          style={{ marginTop: 20 }}
          onClick={onClose}
          aria-label="Dismiss celebration"
        >
          Nice!
        </Button>
      </div>
    </div>
  )
}
