import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'

export interface CalendarSession {
  id: string
  courseId: string
  title: string
  teacherId: string
  teacherName: string
  className: string
  classId: number
  sessionDate: Date
  startTime: string
  endTime: string
  room: string
  notes: string | null
  color: string
  scheduleId: string | null
}

function currentAcademicYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  if (month >= 8) return `${year}-${year + 1}`
  return `${year - 1}-${year}`
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor(total / 60) % 24
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:00`
}

function hexToTailwindBg(hex: string | null): string {
  if (!hex) return 'bg-blue-500'
  const map: Record<string, string> = {
    '#3B82F6': 'bg-blue-500',
    '#10B981': 'bg-green-500',
    '#F59E0B': 'bg-amber-500',
    '#EF4444': 'bg-red-500',
    '#8B5CF6': 'bg-violet-500',
  }
  return map[hex.toUpperCase()] ?? 'bg-blue-500'
}

type SessionViewRow = {
  session_id: string
  session_date: string
  start_time: string
  end_time: string
  room: string | null
  notes: string | null
  schedule_id: string | null
  course_id: string
  course_name: string
  course_color: string | null
  class_id: number
  teacher_id: string
  class_name: string | null
  teacher_first_name: string | null
  teacher_last_name: string | null
}

export function compareSessionsChronologically(a: CalendarSession, b: CalendarSession): number {
  const dateCmp = a.sessionDate.getTime() - b.sessionDate.getTime()
  if (dateCmp !== 0) return dateCmp
  return a.startTime.localeCompare(b.startTime)
}

export function sortSessionsChronologically(sessions: CalendarSession[]): CalendarSession[] {
  return [...sessions].sort(compareSessionsChronologically)
}

export function sessionsForDate(sessions: CalendarSession[], date: Date): CalendarSession[] {
  return sortSessionsChronologically(
    sessions.filter((session) => session.sessionDate.toDateString() === date.toDateString())
  )
}

export function sessionsFromToday(sessions: CalendarSession[], limit = 10): CalendarSession[] {
  return sessionsUpcoming(sessions, limit)
}

/** Local YYYY-MM-DD (avoids UTC drift from toISOString). */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function sessionStartDateTime(session: CalendarSession): Date {
  const d = new Date(session.sessionDate)
  const [h, m] = session.startTime.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function sessionEndDateTime(session: CalendarSession): Date {
  const d = new Date(session.sessionDate)
  const [h, m] = session.endTime.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return d
}

export function isSessionPast(session: CalendarSession, now = new Date()): boolean {
  return sessionEndDateTime(session) < now
}

export function isSessionInProgress(session: CalendarSession, now = new Date()): boolean {
  return sessionStartDateTime(session) <= now && sessionEndDateTime(session) >= now
}

/** Upcoming or in-progress sessions only (excludes finished). */
export function sessionsUpcoming(sessions: CalendarSession[], limit = 10, now = new Date()): CalendarSession[] {
  return sortSessionsChronologically(sessions.filter((session) => !isSessionPast(session, now))).slice(0, limit)
}

/** Day view: on today, hide finished sessions; other days show full day. */
export function sessionsForDateActive(
  sessions: CalendarSession[],
  date: Date,
  now = new Date()
): CalendarSession[] {
  const daySessions = sessionsForDate(sessions, date)
  const isToday = date.toDateString() === now.toDateString()
  if (!isToday) return daySessions
  return daySessions.filter((session) => !isSessionPast(session, now))
}

/** Current or next session today (within 30 min before start until end). */
export function findCurrentOrNextSession(
  sessions: CalendarSession[],
  now = new Date()
): CalendarSession | null {
  const todaySessions = sessionsForDate(sessions, now)
  const windowMs = 30 * 60 * 1000

  for (const session of todaySessions) {
    const start = sessionStartDateTime(session)
    const end = sessionEndDateTime(session)
    if (now.getTime() >= start.getTime() - windowMs && now <= end) {
      return session
    }
  }

  const next = todaySessions.find((session) => sessionStartDateTime(session) > now)
  return next ?? null
}

async function fetchStudentClassIds(studentId: string): Promise<number[]> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('class_id')
    .eq('student_id', studentId)

  if (error) throw error
  return (data ?? []).map((row) => row.class_id)
}

export async function fetchCalendarSessionsForStudent(studentId: string): Promise<CalendarSession[]> {
  const classIds = await fetchStudentClassIds(studentId)
  if (classIds.length === 0) return []
  const sessions = await fetchCalendarSessions()
  return sortSessionsChronologically(sessions.filter((session) => classIds.includes(session.classId)))
}

export async function fetchCalendarSessionsForTeacher(teacherId: string): Promise<CalendarSession[]> {
  const sessions = await fetchCalendarSessions()
  return sortSessionsChronologically(sessions.filter((session) => session.teacherId === teacherId))
}

async function fetchFromCalendarView(): Promise<CalendarSession[] | null> {
  const { data, error } = await supabase
    .from('calendar_sessions_view')
    .select('*')
    .order('session_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(500)

  if (error) {
    if (error.code === '42P01' || error.message.includes('calendar_sessions_view')) {
      return null
    }
    throw error
  }

  const mapped = (data as SessionViewRow[]).map((row) => ({
    id: row.session_id,
    courseId: row.course_id,
    title: row.course_name,
    teacherId: row.teacher_id,
    teacherName: formatUserDisplayName({
      first_name: row.teacher_first_name,
      last_name: row.teacher_last_name,
    }) || 'Professeur',
    className: row.class_name ?? '—',
    classId: row.class_id,
    sessionDate: new Date(`${row.session_date}T12:00:00`),
    startTime: row.start_time.slice(0, 5),
    endTime: row.end_time.slice(0, 5),
    room: row.room ?? '—',
    notes: row.notes,
    color: hexToTailwindBg(row.course_color),
    scheduleId: row.schedule_id,
  }))
  return sortSessionsChronologically(mapped)
}

export async function fetchCalendarSessions(): Promise<CalendarSession[]> {
  const CACHE_KEY = 'houssem_calendar_sessions_cache'
  try {
    const fromView = await fetchFromCalendarView()
    if (fromView) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fromView))
      return fromView
    }

    const { data, error } = await supabase
      .from('course_sessions')
      .select(`
        id,
        session_date,
        start_time,
        end_time,
        room,
        notes,
        schedule_id,
        courses (
          id,
          name,
          color,
          teacher_id,
          class_id,
          classes (name)
        )
      `)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(500)

    if (error) throw error

    type SessionRow = {
      id: string
      session_date: string
      start_time: string
      end_time: string
      room: string | null
      notes: string | null
      schedule_id: string | null
      courses: {
        id: string
        name: string
        color: string | null
        teacher_id: string
        class_id: number
        classes: { name: string } | null
      } | null
    }

    const rows = (data ?? []) as SessionRow[]
    const teacherIds = [...new Set(rows.map((r) => r.courses?.teacher_id).filter(Boolean))] as string[]
    const teacherNames = new Map<string, string>()

    if (teacherIds.length > 0) {
      const { data: teachers } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', teacherIds)

      for (const t of teachers ?? []) {
        teacherNames.set(t.user_id, formatUserDisplayName(t))
      }
    }

    const result = sortSessionsChronologically(
      rows
        .filter((row) => row.courses)
        .map((row) => {
          const course = row.courses!
          return {
            id: row.id,
            courseId: course.id,
            title: course.name,
            teacherId: course.teacher_id,
            teacherName: teacherNames.get(course.teacher_id) ?? 'Professeur',
            className: course.classes?.name ?? '—',
            classId: course.class_id,
            sessionDate: new Date(`${row.session_date}T12:00:00`),
            startTime: row.start_time.slice(0, 5),
            endTime: row.end_time.slice(0, 5),
            room: row.room ?? '—',
            notes: row.notes,
            color: hexToTailwindBg(course.color),
            scheduleId: row.schedule_id,
          }
        })
    )

    localStorage.setItem(CACHE_KEY, JSON.stringify(result))
    return result
  } catch (err) {
    console.warn('Network offline, returning cached calendar sessions:', err)
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        return parsed.map((item: any) => ({
          ...item,
          sessionDate: new Date(item.sessionDate),
        }))
      } catch (parseErr) {
        console.error('Error parsing cached sessions:', parseErr)
      }
    }
    throw err
  }
}

export interface CreateCourseInput {
  name: string
  teacherId: string
  classId: number
  sessionDate: string
  startTime: string
  durationMinutes: number
  room: string
  notes?: string
  isRecurring: boolean
  recurrenceEndDate?: string
}

export async function createCourseWithSchedule(input: CreateCourseInput) {
  const code = `${slugify(input.name)}-${input.classId}-${Date.now()}`
  const endTime = addMinutes(`${input.startTime}:00`, input.durationMinutes)

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      name: input.name.trim(),
      code,
      class_id: input.classId,
      teacher_id: input.teacherId,
      academic_year: currentAcademicYear(),
      semester: 'annual',
      description: input.notes?.trim() || null,
      color: '#3B82F6',
    })
    .select('id')
    .single()

  if (courseError) throw courseError

  const courseId = course.id as string

  if (input.isRecurring) {
    const sessionDate = new Date(`${input.sessionDate}T12:00:00`)
    const dayOfWeek = sessionDate.getDay()

    const { data: schedule, error: scheduleError } = await supabase
      .from('course_schedules')
      .insert({
        course_id: courseId,
        day_of_week: dayOfWeek,
        start_time: `${input.startTime}:00`,
        end_time: endTime,
        room: input.room.trim() || null,
        effective_from: input.sessionDate,
        effective_until: input.recurrenceEndDate ?? null,
      })
      .select('id')
      .single()

    if (scheduleError) throw scheduleError

    const endDate =
      input.recurrenceEndDate ??
      new Date(sessionDate.getFullYear(), sessionDate.getMonth() + 3, sessionDate.getDate())
        .toISOString()
        .slice(0, 10)

    const { error: genError } = await supabase.rpc('generate_course_sessions', {
      p_course_id: courseId,
      p_start_date: input.sessionDate,
      p_end_date: endDate,
    })

    if (genError) throw genError
    return
  }

  const { error: sessionError } = await supabase.from('course_sessions').insert({
    course_id: courseId,
    session_date: input.sessionDate,
    start_time: `${input.startTime}:00`,
    end_time: endTime,
    room: input.room.trim() || null,
    notes: input.notes?.trim() || null,
  })

  if (sessionError) throw sessionError
}

export async function deleteCalendarSession(sessionId: string) {
  const { error } = await supabase.from('course_sessions').delete().eq('id', sessionId)
  if (error) throw error
}

export interface UpdateSessionInput {
  sessionId: string
  courseId: string
  name: string
  teacherId: string
  classId: number
  sessionDate: string
  startTime: string
  durationMinutes: number
  room: string
  notes?: string
}

export async function updateCalendarSession(input: UpdateSessionInput) {
  const endTime = addMinutes(`${input.startTime}:00`, input.durationMinutes)

  const { error: courseError } = await supabase
    .from('courses')
    .update({
      name: input.name.trim(),
      teacher_id: input.teacherId,
      class_id: input.classId,
      description: input.notes?.trim() || null,
    })
    .eq('id', input.courseId)

  if (courseError) throw courseError

  const { error: sessionError } = await supabase
    .from('course_sessions')
    .update({
      session_date: input.sessionDate,
      start_time: `${input.startTime}:00`,
      end_time: endTime,
      room: input.room.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq('id', input.sessionId)

  if (sessionError) throw sessionError
}
