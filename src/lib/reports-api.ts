import { supabase } from '@/integrations/supabase/client'
import { ROLE_IDS } from '@/lib/role-ids'

export interface AttendanceDayStat {
  day: string
  date: string
  present: number
  absent: number
  late: number
  total: number
  rate: number
}

export interface ClassAttendanceStat {
  classId: number
  name: string
  present: number
  absent: number
  late: number
  total: number
  rate: number
}

export async function fetchStudentCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', ROLE_IDS.student)
  if (error) throw error
  return count ?? 0
}

export async function fetchTeacherCount(): Promise<number> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role_id', ROLE_IDS.teacher)
  if (error) throw error
  return count ?? 0
}

export async function fetchSessionsTodayCount(dateStr: string): Promise<number> {
  const { count, error } = await supabase
    .from('course_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('session_date', dateStr)
  if (error) throw error
  return count ?? 0
}

export async function fetchAttendanceTrend(days: number): Promise<AttendanceDayStat[]> {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  start.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('attendance_records')
    .select('status, marked_at')
    .gte('marked_at', start.toISOString())
    .lte('marked_at', end.toISOString())

  if (error) throw error

  const rows = data ?? []
  const result: AttendanceDayStat[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const dayRecords = rows.filter((r) => {
      const t = new Date(r.marked_at).getTime()
      return t >= dayStart.getTime() && t < dayEnd.getTime()
    })

    const present = dayRecords.filter((r) => r.status === 'present').length
    const absent = dayRecords.filter((r) => r.status === 'absent').length
    const late = dayRecords.filter((r) => r.status === 'late').length
    const total = dayRecords.length

    result.push({
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      present,
      absent,
      late,
      total,
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
    })
  }

  return result
}

export async function fetchClassAttendanceStats(dateStr: string): Promise<ClassAttendanceStat[]> {
  const { data: classes, error: classError } = await supabase
    .from('classes')
    .select('id, name')
    .order('name')

  if (classError) throw error
  if (!classes?.length) return []

  const dayStart = new Date(`${dateStr}T00:00:00`)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const { data: records, error: recordsError } = await supabase
    .from('attendance_records')
    .select('status, student_id, marked_at')
    .gte('marked_at', dayStart.toISOString())
    .lt('marked_at', dayEnd.toISOString())

  if (recordsError) throw error
  if (!records?.length) {
    return classes.map((c) => ({
      classId: c.id,
      name: c.name,
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      rate: 0,
    }))
  }

  const studentIds = [...new Set(records.map((r) => r.student_id))]
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student_id, class_id')
    .in('student_id', studentIds)

  const classByStudent = new Map<string, number>()
  for (const e of enrollments ?? []) {
    classByStudent.set(e.student_id, e.class_id)
  }

  const statsByClass = new Map<number, ClassAttendanceStat>()
  for (const cls of classes) {
    statsByClass.set(cls.id, {
      classId: cls.id,
      name: cls.name,
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      rate: 0,
    })
  }

  for (const record of records) {
    const classId = classByStudent.get(record.student_id)
    if (!classId) continue
    const stat = statsByClass.get(classId)
    if (!stat) continue
    stat.total += 1
    if (record.status === 'present') stat.present += 1
    if (record.status === 'absent') stat.absent += 1
    if (record.status === 'late') stat.late += 1
  }

  return [...statsByClass.values()]
    .map((s) => ({
      ...s,
      rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
    }))
    .filter((s) => s.total > 0)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}
