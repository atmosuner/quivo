import type { InputHTMLAttributes } from 'react'

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  num?: boolean
}

export function Field({ label, num = false, id, ...rest }: FieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
      <label className="t-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        className="field-input"
        inputMode={num ? 'numeric' : 'text'}
        {...rest}
      />
    </div>
  )
}
