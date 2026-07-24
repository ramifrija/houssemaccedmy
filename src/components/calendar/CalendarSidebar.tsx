
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"

interface CalendarSidebarProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
}

const CalendarSidebar = ({ selectedDate, onDateSelect }: CalendarSidebarProps) => {
  return (
    <Card className="lg:col-span-1 border-school-yellow/20">
      <CardHeader>
        <CardTitle className="text-school-black">Calendrier</CardTitle>
        <CardDescription>Sélectionner une date</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className="rounded-md border border-school-yellow/20"
        />
        <div className="mt-4 space-y-2">
          <h4 className="font-medium text-school-black">Légende</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-school-black/70">Mathématiques</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-school-black/70">Français</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-school-black/70">Sciences</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CalendarSidebar
