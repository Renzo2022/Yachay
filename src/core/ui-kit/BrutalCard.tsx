import type { ReactNode } from 'react'
import { cn } from '../../utils/cn.ts'

type BrutalCardProps = {
  title?: ReactNode
  children: ReactNode
  className?: string
  titleClassName?: string
}

export const BrutalCard = ({ title, children, className, titleClassName }: BrutalCardProps) => (
  <section
    className={cn('border-3 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none', className)}
  >
    {title ? (
      <header className="mb-4 border-b-3 border-black pb-3">
        <h3 className={cn('text-2xl font-bold uppercase tracking-tight', titleClassName)}>{title}</h3>
      </header>
    ) : null}
    <div>{children}</div>
  </section>
)
