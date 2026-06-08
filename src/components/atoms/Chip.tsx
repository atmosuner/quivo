import type { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  children: ReactNode
}

export function Chip({ active = false, className = '', children, ...rest }: ChipProps) {
  const classes = ['chip', active ? 'chip-active' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
