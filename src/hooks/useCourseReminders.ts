import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  CalendarSession,
  fetchCalendarSessionsForStudent,
  fetchCalendarSessionsForTeacher,
  sessionStartDateTime,
  sessionsForDate,
} from '@/lib/courses-api'

const REMINDER_MINUTES = 15
const CHECK_INTERVAL_MS = 30_000
const STORAGE_KEY = 'houssem-course-reminders'

function loadNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as { date: string; ids: string[] }
    const today = new Date().toDateString()
    if (parsed.date !== today) return new Set()
    return new Set(parsed.ids)
  } catch {
    return new Set()
  }
}

function saveNotified(ids: Set<string>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: new Date().toDateString(), ids: [...ids] })
  )
}

function shouldRemind(session: CalendarSession, now: Date): boolean {
  const start = sessionStartDateTime(session)
  const diffMs = start.getTime() - now.getTime()
  const diffMin = diffMs / 60_000
  return diffMin > 0 && diffMin <= REMINDER_MINUTES
}

export function useCourseReminders() {
  const { user, userProfile } = useAuth()
  const role = userProfile?.role
  const notifiedRef = useRef<Set<string>>(loadNotified())

  const enabled = Boolean(user?.id && (role === 'student' || role === 'teacher'))

  const { data: sessions = [] } = useQuery({
    queryKey: ['course-reminders', role, user?.id],
    queryFn: async () => {
      if (role === 'student') return fetchCalendarSessionsForStudent(user!.id)
      if (role === 'teacher') return fetchCalendarSessionsForTeacher(user!.id)
      return []
    },
    enabled,
    refetchInterval: 5 * 60_000,
  })

  useEffect(() => {
    if (!enabled || sessions.length === 0) return

    const check = () => {
      const now = new Date()
      const todaySessions = sessionsForDate(sessions, now)

      for (const session of todaySessions) {
        if (!shouldRemind(session, now)) continue
        if (notifiedRef.current.has(session.id)) continue

        notifiedRef.current.add(session.id)
        saveNotified(notifiedRef.current)

        toast('Cours dans 15 minutes', {
          description: `${session.title} — ${session.className} à ${session.startTime} (${session.room})`,
          duration: 12_000,
        })
      }
    }

    check()
    const id = window.setInterval(check, CHECK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled, sessions])
}
