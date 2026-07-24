import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageContentProps {
  children: ReactNode
  className?: string
}

export function PageContent({ children, className }: PageContentProps) {
  return (
    <div className={cn('flex-1 p-4 sm:p-6 space-y-6 min-w-0 overflow-x-hidden', className)}>
      {children}
    </div>
  )
}
