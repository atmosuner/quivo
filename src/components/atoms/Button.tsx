import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'tint' | 'quiet'
type ButtonSize = 'lg' | 'md' | 'sm'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    block ? 'btn-block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  )
}
