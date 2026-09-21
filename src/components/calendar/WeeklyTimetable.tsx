import React from 'react'
import { CalendarSession } from '@/lib/courses-api'
import { cn } from '@/lib/utils'

interface WeeklyTimetableProps {
  sessions: CalendarSession[]
  startDate: Date // Should be Monday
}

const PIXELS_PER_HOUR = 64 // matches h-16
const PIXELS_PER_MINUTE = PIXELS_PER_HOUR / 60

export default function WeeklyTimetable({ sessions, startDate }: WeeklyTimetableProps) {
  // Generate the 6 days of the week (Mon-Sat)
  const days = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    return d
  })

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((s) => s.sessionDate.toDateString() === date.toDateString())
  }

  // Dynamic hours calculation
  const minHour = sessions.length > 0
    ? Math.min(...sessions.map(s => parseInt(s.startTime.split(':')[0], 10)))
    : 8;
  const maxHour = sessions.length > 0
    ? Math.max(...sessions.map(s => {
        const [h, m] = s.endTime.split(':').map(Number);
        return m > 0 ? h + 1 : h;
      }))
    : 18;

  const startHour = Math.max(7, Math.min(8, minHour - 1)); // start at least at 8, or earlier if needed
  const endHour = Math.min(22, Math.max(18, maxHour + 1)); // end at least at 18, or later if needed

  // If there's a huge gap (e.g. only classes at 17h), we can just trim the empty morning
  // Let's refine: startHour should just be minHour - 1, bounded by 7. If minHour is 14, startHour is 13.
  const dynamicStartHour = sessions.length > 0 ? Math.max(7, minHour - 1) : 8;
  const dynamicEndHour = sessions.length > 0 ? Math.min(22, maxHour + 1) : 18;
  
  const HOURS = Array.from(
    { length: Math.max(5, dynamicEndHour - dynamicStartHour + 1) }, 
    (_, i) => dynamicStartHour + i
  )

  const computeTop = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    const minutesFromStart = (h - dynamicStartHour) * 60 + m
    return Math.max(0, minutesFromStart * PIXELS_PER_MINUTE)
  }

  const computeHeight = (startStr: string, endStr: string) => {
    const [sh, sm] = startStr.split(':').map(Number)
    const [eh, em] = endStr.split(':').map(Number)
    const duration = eh * 60 + em - (sh * 60 + sm)
    return Math.max(20, duration * PIXELS_PER_MINUTE) // min height 20px
  }

  return (
    <div className="bg-white rounded-xl border border-school-yellow/20 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] border-b bg-school-gray-light/50">
            <div className="p-3 text-center text-xs font-semibold text-school-black/60 border-r">Heure</div>
            {days.map((day, i) => (
              <div key={i} className="p-3 text-center border-r last:border-r-0">
                <div className="font-semibold text-school-black capitalize">
                  {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                </div>
                <div className="text-xs text-school-black/60">
                  {day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr] bg-white relative">
            {/* Hours Column */}
            <div className="border-r bg-school-gray-light/20 relative z-10">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-16 border-b border-school-gray-light last:border-b-0 flex items-start justify-center pt-1.5 text-xs font-medium text-school-black/50"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {days.map((day, i) => {
              const daySessions = getSessionsForDate(day)
              return (
                <div key={i} className="border-r last:border-r-0 relative">
                  {/* Grid Lines */}
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-16 border-b border-school-gray-light/50 last:border-b-0"></div>
                  ))}

                  {/* Sessions */}
                  {daySessions.map((session) => {
                    const top = computeTop(session.startTime)
                    const height = computeHeight(session.startTime, session.endTime)

                    return (
                      <div
                        key={session.id}
                        className={cn(
                          'absolute left-1 right-1 rounded-md p-1.5 text-[11px] overflow-hidden shadow-sm border border-black/5 flex flex-col transition-all hover:z-10 hover:shadow-md leading-tight',
                          session.color || 'bg-blue-500'
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                        }}
                      >
                        <div className="font-bold text-white mb-0.5">{session.title}</div>
                        <div className="text-white/90 font-medium mb-0.5">
                          {session.startTime} - {session.endTime}
                        </div>
                        {session.teacherName && (
                          <div className="text-white/80 mt-auto truncate">{session.teacherName}</div>
                        )}
                        {session.room && session.room !== '—' && (
                          <div className="text-white/80 truncate">Salle: {session.room}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
