import { Button } from '../../components/index.ts'
import { close, pages } from '../../components/icons/icons.tsx'

const Close = close
const Pages = pages

export interface InstallHintProps {
  onClose: () => void
}

/** MVP install instructions for Add to Home Screen / PWA install. */
export function InstallHint({ onClose }: InstallHintProps) {
  return (
    <div
      className="celebration-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-hint-title"
      onClick={onClose}
    >
      <div
        className="celebration-card"
        style={{ animation: 'none', position: 'relative' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="g-brand"
          style={{
            width: 56,
            height: 56,
            margin: '0 auto',
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}
        >
          <Pages size={28} />
        </div>
        <h2 id="install-hint-title" className="t-h1" style={{ marginTop: 16, fontSize: 21 }}>
          Install Quivo
        </h2>
        <p className="t-body" style={{ marginTop: 8, textAlign: 'left' }}>
          <strong>iPhone / iPad:</strong> Tap Share, then &quot;Add to Home Screen&quot;.
        </p>
        <p className="t-body" style={{ marginTop: 8, textAlign: 'left' }}>
          <strong>Android:</strong> Tap the browser menu, then &quot;Install app&quot; or &quot;Add
          to Home screen&quot;.
        </p>
        <p className="t-cap" style={{ marginTop: 12 }}>
          Temporary MVP icon — final brand assets coming later.
        </p>
        <Button variant="primary" size="md" block style={{ marginTop: 18 }} onClick={onClose}>
          Got it
        </Button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close install instructions"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            padding: 6,
            cursor: 'pointer',
            color: 'var(--ink-3)',
          }}
        >
          <Close size={20} />
        </button>
      </div>
    </div>
  )
}
