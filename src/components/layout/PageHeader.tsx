import { SidebarTrigger } from '@/components/ui/sidebar'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-school-yellow/20 p-4 lg:p-6 safe-area-pt">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <SidebarTrigger className="hidden lg:flex text-school-black hover:bg-school-yellow/10 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-school-black truncate">{title}</h1>
            {description && (
              <p className="text-sm text-school-black/60 line-clamp-2 sm:truncate">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">{actions}</div>
        )}
      </div>
    </header>
  )
}
