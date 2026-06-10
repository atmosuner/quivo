import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase/app.ts'
import { FirestoreRepository } from '../../lib/storage/firestoreRepository.ts'
import { DEVICE_FAMILY_ID_KEY, DEVICE_ROLE_KEY } from '../../lib/storage/keys.ts'
import { useAppStore } from '../../stores/appStore.ts'
import { useFamilyStore } from '../../stores/familyStore.ts'
import { useParentGateStore } from '../../stores/parentGateStore.ts'
import { useSessionStore } from '../../stores/sessionStore.ts'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Phase = 'scanning' | 'connecting' | 'error'

export function ChildJoinScreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const connectingRef = useRef(false)

  const [phase, setPhase] = useState<Phase>('scanning')
  const [error, setError] = useState<string | null>(null)

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const connect = async (familyId: string) => {
    if (connectingRef.current) return
    connectingRef.current = true
    stopCamera()
    setPhase('connecting')

    try {
      const snap = await getDoc(doc(db, 'families', familyId, 'data', 'snapshot'))
      if (!snap.exists()) throw new Error('not_found')

      localStorage.setItem(DEVICE_ROLE_KEY, 'child')
      localStorage.setItem(DEVICE_FAMILY_ID_KEY, familyId)

      useAppStore.getState().setDeviceRole('child')
      useFamilyStore.getState().setRepository(new FirestoreRepository(familyId))
      useSessionStore.getState().clearEffects()
      useParentGateStore.getState().clearSession()
      useAppStore.getState().resetNavigation()
      await useFamilyStore.getState().bootstrap()
    } catch (err) {
      const msg = (err as { message?: string })?.message === 'not_found'
        ? "No family found. Ask your parent to show the QR code again."
        : "Couldn't connect. Check your connection and try again."
      setError(msg)
      setPhase('error')
      connectingRef.current = false
    }
  }

  useEffect(() => {
    let cancelled = false
    let raf = 0

    const tick = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || cancelled) return

      if (video.readyState >= video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(img.data, img.width, img.height)
          if (code?.data && UUID_RE.test(code.data)) {
            void connect(code.data)
            return
          }
        }
      }

      raf = requestAnimationFrame(tick)
    }

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          raf = requestAnimationFrame(tick)
        }
      } catch {
        if (!cancelled) {
          setError('Camera access is needed to scan the code. Please allow it and try again.')
          setPhase('error')
        }
      }
    }

    void start()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      stopCamera()
    }
  }, [])

  const goBack = () => {
    stopCamera()
    useAppStore.getState().setOnboardingScreen('landing')
  }

  return (
    <div className="q-app" style={{ background: '#000' }}>
      <div className="q-main">
        {phase === 'scanning' && (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div
              style={{
                position: 'fixed', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <div style={{ position: 'relative', width: 220, height: 220 }}>
                {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => (
                  <Corner key={pos} pos={pos} />
                ))}
              </div>
              <div
                style={{
                  marginTop: 28, color: '#fff', fontSize: 15, fontWeight: 600,
                  textAlign: 'center', textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                  fontFamily: 'var(--font)', maxWidth: 240,
                }}
              >
                Point at the QR code on the parent device
              </div>
            </div>

            <button
              type="button"
              onClick={goBack}
              style={{
                position: 'fixed', top: 52, left: 20, pointerEvents: 'auto',
                background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none',
                borderRadius: 99, padding: '8px 16px', fontSize: 14,
                fontWeight: 600, fontFamily: 'var(--font)', cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          </>
        )}

        {phase === 'connecting' && (
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 16,
            }}
          >
            <div className="t-body" style={{ color: '#fff', fontWeight: 600 }}>Connecting to your family…</div>
          </div>
        )}

        {phase === 'error' && (
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: 20, padding: 32, textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 48 }}>⚠️</div>
            <div className="t-h3" style={{ color: '#fff' }}>{error}</div>
            <button
              type="button"
              onClick={goBack}
              style={{
                background: '#fff', color: '#000', border: 'none',
                borderRadius: 99, padding: '12px 28px',
                fontSize: 15, fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

type CornerPos = 'tl' | 'tr' | 'bl' | 'br'

function Corner({ pos }: { pos: CornerPos }) {
  const size = 28
  const t = 4
  const color = '#fff'
  const r = 6
  return (
    <div
      style={{
        position: 'absolute', width: size, height: size,
        top: pos.startsWith('t') ? 0 : undefined,
        bottom: pos.startsWith('b') ? 0 : undefined,
        left: pos.endsWith('l') ? 0 : undefined,
        right: pos.endsWith('r') ? 0 : undefined,
        borderTop: pos.startsWith('t') ? `${t}px solid ${color}` : undefined,
        borderBottom: pos.startsWith('b') ? `${t}px solid ${color}` : undefined,
        borderLeft: pos.endsWith('l') ? `${t}px solid ${color}` : undefined,
        borderRight: pos.endsWith('r') ? `${t}px solid ${color}` : undefined,
        borderTopLeftRadius: pos === 'tl' ? r : undefined,
        borderTopRightRadius: pos === 'tr' ? r : undefined,
        borderBottomLeftRadius: pos === 'bl' ? r : undefined,
        borderBottomRightRadius: pos === 'br' ? r : undefined,
      }}
    />
  )
}
