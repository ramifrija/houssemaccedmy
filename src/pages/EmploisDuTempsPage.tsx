import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { fetchClasses } from '@/lib/classes-api'
import { fetchCalendarSessions } from '@/lib/courses-api'
import WeeklyTimetable from '@/components/calendar/WeeklyTimetable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

// Helper to get the Monday of the current week
function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export default function EmploisDuTempsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('')
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekStart = useMemo(() => getMonday(currentDate), [currentDate])

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: fetchClasses,
  })

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id.toString())
    }
  }, [classes, selectedClassId])

  const { data: allSessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['calendar-sessions'],
    queryFn: fetchCalendarSessions,
  })

  const classSessions = useMemo(() => {
    if (!selectedClassId) return []
    return allSessions.filter((s) => s.classId.toString() === selectedClassId)
  }, [allSessions, selectedClassId])

  const goToPreviousWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 7)
    setCurrentDate(prev)
  }

  const goToNextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 7)
    setCurrentDate(next)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader 
        title="Emplois du Temps" 
        description="Consultez les emplois du temps par classe" 
      />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-xl shadow-xs border border-school-yellow/20">
          <div className="flex flex-col gap-1 w-full md:w-1/3">
            <span className="text-sm font-semibold text-school-black">Classe :</span>
            <Select value={selectedClassId} onValueChange={setSelectedClassId} disabled={loadingClasses}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id.toString()}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={goToToday} className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loadingSessions ? (
          <div className="h-96 flex items-center justify-center text-school-black/50">
            Chargement de l'emploi du temps...
          </div>
        ) : !selectedClassId ? (
          <div className="h-96 flex flex-col items-center justify-center bg-white border border-dashed border-school-yellow/40 rounded-xl p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-school-yellow mb-4" />
            <h3 className="text-lg font-semibold text-school-black">Aucune classe sélectionnée</h3>
            <p className="text-sm text-school-black/60">Veuillez sélectionner une classe pour voir son emploi du temps.</p>
          </div>
        ) : (
          <WeeklyTimetable sessions={classSessions} startDate={weekStart} />
        )}
      </div>
    </div>
  )
}
