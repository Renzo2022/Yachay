import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../utils/cn.ts'

type BaseProps = {
  label?: string
  labelClassName?: string
  error?: string
  badge?: ReactNode
}

type BrutalInputProps =
  | (BaseProps & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>)
  | (BaseProps & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>)

export const BrutalInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, BrutalInputProps>(
  ({ label, labelClassName, error, className, id, badge, multiline, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const Component = (multiline ? 'textarea' : 'input') as 'textarea' | 'input'

    return (
      <label className="flex flex-col gap-2 font-mono text-sm uppercase text-text-main relative" htmlFor={inputId}>
        {label ? <span className={cn(labelClassName ?? 'text-text-main')}>{label}</span> : null}
        <div className="relative">
          <Component
            id={inputId}
            ref={ref as never}
            className={cn(
              'w-full border-3 border-black bg-white text-main p-3 font-mono rounded-none',
              'shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:bg-accent-warning/40 focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]',
              multiline && 'min-h-[120px] resize-vertical',
              error && 'border-accent-danger text-accent-danger',
              className,
            )}
            {...(props as Record<string, unknown>)}
          />
          {badge ? (
            <span className="absolute top-2 right-2 text-xs font-bold bg-accent-warning border-2 border-black px-2 py-1 rounded-none">
              {badge}
            </span>
          ) : null}
        </div>
        {error ? <span className="text-accent-danger text-xs normal-case">{error}</span> : null}
      </label>
    )
  },
)

BrutalInput.displayName = 'BrutalInput'
