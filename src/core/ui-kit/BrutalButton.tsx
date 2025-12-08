import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type BrutalButtonVariant = 'primary' | 'secondary' | 'danger'
type BrutalButtonSize = 'md' | 'sm'

type BrutalButtonProps = {
  variant?: BrutalButtonVariant
  size?: BrutalButtonSize
  icon?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

const variantStyles: Record<BrutalButtonVariant, string> = {
  primary: 'bg-accent-primary text-text-main',
  secondary: 'bg-accent-success text-main',
  danger: 'bg-accent-danger text-text-main',
}

const sizeStyles: Record<BrutalButtonSize, string> = {
  md: 'px-6 py-3 text-base',
  sm: 'px-4 py-2 text-sm',
}

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', disabled, icon, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 font-mono font-bold uppercase tracking-tight rounded-none',
        'border-3 border-black transition-all duration-150 select-none',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        !disabled && 'hover:-translate-y-1 hover:-translate-x-1',
        disabled &&
          'bg-neutral-100 text-neutral-900 cursor-not-allowed border-neutral-900 shadow-none active:translate-x-0 active:translate-y-0',
        !disabled && variantStyles[variant],
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

BrutalButton.displayName = 'BrutalButton'
