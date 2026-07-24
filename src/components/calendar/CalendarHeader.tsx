
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

interface CalendarHeaderProps {
  onNewCourseClick?: () => void
  canManage?: boolean
}

const CalendarHeader = ({ onNewCourseClick, canManage = false }: CalendarHeaderProps) => {
  return (
    <PageHeader
      title="Calendrier des Cours"
      description="Emploi du temps"
      actions={
        canManage ? (
          <Button
            size="sm"
            className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
            onClick={onNewCourseClick}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nouveau Cours</span>
          </Button>
        ) : undefined
      }
    />
  )
}

export default CalendarHeader
