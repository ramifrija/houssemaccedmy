import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { fetchTeachers } from '@/lib/users-api'

export interface TeacherDossierListItem {
  userId: string
  name: string
  email: string | null
  courseCount: number
  sessionCount: number
  sessionsThisMonth: number
}

export interface TeacherDossierProfile {
  userId: string
  name: string
  email: string | null
  createdAt: string
}

export interface TeacherCourseRow {
  id: string
  name: string
  className: string
  classId: number
}

export interface TeacherSessionRow {
  id: string
  courseName: string
  className: string
  sessionDate: string
  startTime: string
  endTime: string
  room: string
}

export async function fetchTeachersForDossier(): Promise<TeacherDossierListItem[]> {
  const teachers = await fetchTeachers()
  if (teachers.length === 0) return []

  const teacherIds = teachers.map((t) => t.user_id)

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, teacher_id')
    .in('teacher_id', teacherIds)

  if (coursesError) throw coursesError

  const courseIds = (courses ?? []).map((c) => c.id)
  const coursesByTeacher = new Map<string, number>()
  for (const c of courses ?? []) {
    coursesByTeacher.set(c.teacher_id, (coursesByTeacher.get(c.teacher_id) ?? 0) + 1)
  }

  let sessions: { id: string; course_id: string; session_date: string }[] = []
  if (courseIds.length > 0) {
    const { data: sessionRows, error: sessionsError } = await supabase
      .from('course_sessions')
      .select('id, course_id, session_date')
      .in('course_id', courseIds)

    if (sessionsError) throw sessionsError
    sessions = sessionRows ?? []
  }

  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const courseToTeacher = new Map((courses ?? []).map((c) => [c.id, c.teacher_id]))

  const sessionsByTeacher = new Map<string, number>()
  const sessionsThisMonthByTeacher = new Map<string, number>()

  for (const s of sessions) {
    const teacherId = courseToTeacher.get(s.course_id)
    if (!teacherId) continue
    sessionsByTeacher.set(teacherId, (sessionsByTeacher.get(teacherId) ?? 0) + 1)
    if (s.session_date >= monthStart) {
      sessionsThisMonthByTeacher.set(
        teacherId,
        (sessionsThisMonthByTeacher.get(teacherId) ?? 0) + 1
      )
    }
  }

  return teachers
    .map((t) => ({
      userId: t.user_id,
      name: formatUserDisplayName(t),
      email: t.email,
      courseCount: coursesByTeacher.get(t.user_id) ?? 0,
      sessionCount: sessionsByTeacher.get(t.user_id) ?? 0,
      sessionsThisMonth: sessionsThisMonthByTeacher.get(t.user_id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function fetchTeacherDossierProfile(teacherId: string): Promise<TeacherDossierProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, created_at')
    .eq('user_id', teacherId)
    .single()

  if (error) throw error
  if (!data) return null

  return {
    userId: data.user_id,
    name: formatUserDisplayName(data),
    email: data.email,
    createdAt: data.created_at,
  }
}

export async function fetchTeacherCourses(teacherId: string): Promise<TeacherCourseRow[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name, class_id, classes(name)')
    .eq('teacher_id', teacherId)
    .order('name')

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    classId: row.class_id,
    className: (row.classes as { name: string } | null)?.name ?? '—',
  }))
}

export async function fetchTeacherSessions(teacherId: string, limit = 50): Promise<TeacherSessionRow[]> {
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name, class_id, classes(name)')
    .eq('teacher_id', teacherId)

  const courseMap = new Map(
    (courses ?? []).map((c) => [
      c.id,
      {
        name: c.name,
        className: (c.classes as { name: string } | null)?.name ?? '—',
      },
    ])
  )

  const courseIds = [...courseMap.keys()]
  if (courseIds.length === 0) return []

  const { data, error } = await supabase
    .from('course_sessions')
    .select('id, course_id, session_date, start_time, end_time, room')
    .in('course_id', courseIds)
    .order('session_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((row) => {
    const course = courseMap.get(row.course_id)
    return {
      id: row.id,
      courseName: course?.name ?? '—',
      className: course?.className ?? '—',
      sessionDate: row.session_date,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      room: row.room ?? '—',
    }
  })
}

export async function fetchTeacherStats(teacherId: string) {
  const sessions = await fetchTeacherSessions(teacherId, 500)
  const courses = await fetchTeacherCourses(teacherId)

  const present = sessions.length
  const now = new Date()
  const thisMonth = sessions.filter((s) => {
    const d = new Date(`${s.sessionDate}T12:00:00`)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const classIds = new Set(courses.map((c) => c.classId))

  return {
    totalSessions: present,
    sessionsThisMonth: thisMonth,
    courseCount: courses.length,
    classCount: classIds.size,
  }
}
