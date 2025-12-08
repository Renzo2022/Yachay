import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'md' | 'sm'

type ButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent-primary text-text-main border-black',
  secondary: 'bg-accent-secondary text-main border-black',
  ghost: 'bg-main text-text-main border-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-base',
  sm: 'px-4 py-2 text-sm',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = 'primary', size = 'md', icon, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2 font-mono font-bold uppercase tracking-tight rounded-none',
        'border-4 shadow-brutal transition-transform duration-150',
        'hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
