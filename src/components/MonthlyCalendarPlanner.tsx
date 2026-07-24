
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CalendarSession, sortSessionsChronologically } from '@/lib/courses-api'

interface MonthlyCalendarPlannerProps {
  courses?: CalendarSession[]
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
}

const MonthlyCalendarPlanner = ({ courses = [], selectedDate, onDateSelect }: MonthlyCalendarPlannerProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthlySchedule = useMemo(
    () => sortSessionsChronologically(courses),
    [courses]
  )

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getCoursesForDate = (date: Date) =>
    monthlySchedule.filter((course) => course.sessionDate.toDateString() === date.toDateString())

  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()

  return (
    <Card className="border-school-yellow/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-school-black">Planning Mensuel</CardTitle>
            <CardDescription>
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-school-black/70">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset + daysInMonth }, (_, i) => {
            const dayNum = i - startOffset + 1
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth
            const dayCourses = isCurrentMonth ? getCoursesForDate(date) : []

            return (
              <div
                key={i}
                className={`border border-school-yellow/20 min-h-[72px] p-1 text-xs cursor-pointer transition-colors ${
                  isCurrentMonth ? 'bg-white hover:bg-school-yellow/5' : 'bg-school-gray-light/40'
                } ${
                  isCurrentMonth && selectedDate && selectedDate.toDateString() === date.toDateString()
                    ? 'ring-2 ring-school-yellow bg-school-yellow/10'
                    : ''
                }`}
                onClick={() => {
                  if (isCurrentMonth && onDateSelect) {
                    onDateSelect(date)
                  }
                }}
              >
                {isCurrentMonth && <div className={`font-medium mb-1 ${selectedDate && selectedDate.toDateString() === date.toDateString() ? 'text-school-yellow' : ''}`}>{dayNum}</div>}
                {dayCourses.length > 0 && (
                  <div className="mt-2 flex justify-center">
                    <span className="bg-school-yellow/20 text-school-yellow-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {dayCourses.length} cours
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthlyCalendarPlanner
