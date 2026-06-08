export interface ToggleProps {
  on: boolean
  onChange: (next: boolean) => void
  ariaLabel?: string
}

export function Toggle({ on, onChange, ariaLabel = 'Toggle' }: ToggleProps) {
  return (
    <button
      type="button"
      className={`toggle${on ? ' on' : ' off'}`}
      onClick={() => onChange(!on)}
      aria-label={ariaLabel}
      aria-pressed={on}
    >
      <span className="toggle-knob" />
    </button>
  )
}
