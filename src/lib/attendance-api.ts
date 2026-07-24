import { supabase } from '@/integrations/supabase/client'

export type AttendanceStatus = 'present' | 'absent' | 'late'

export interface AttendanceRecordRow {
  id: string
  studentId: string
  fullName: string
  status: AttendanceStatus
  arrivalTime: string | null
  notes: string | null
  markedAt: string | null
}

export async function ensureAttendanceForCourseSession(courseSessionId: string): Promise<string> {
  const { data, error } = await supabase.rpc('ensure_attendance_for_course_session', {
    p_course_session_id: courseSessionId,
  })

  if (error) throw error
  return data as string
}

export async function fetchAttendanceRecords(sessionId: string): Promise<AttendanceRecordRow[]> {
  const { data, error } = await supabase.rpc('get_attendance_with_names', {
    _session_id: sessionId,
  })

  if (error) throw error

  return (data ?? [])
    .map((row: Record<string, unknown>) => ({
      id: String(row.id),
      studentId: String(row.student_id),
      fullName: String(row.full_name ?? 'Élève'),
      status: (row.status as AttendanceStatus) ?? 'absent',
      arrivalTime: row.arrival_time ? String(row.arrival_time) : null,
      notes: row.notes ? String(row.notes) : null,
      markedAt: row.marked_at ? String(row.marked_at) : null,
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'fr'))
}

export async function markAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  notes?: string
) {
  const { error } = await supabase.rpc('mark_attendance', {
    p_session_id: sessionId,
    p_student_id: studentId,
    p_status: status,
    p_notes: notes ?? null,
  })

  if (error) throw error
}

export async function fetchStudentAbsences(studentId: string, limit = 50) {
  const { data, error } = await supabase
    .from('attendance_records')
    .select(`
      id,
      status,
      marked_at,
      attendance_sessions (
        subject,
        session_date,
        start_time,
        end_time,
        classes (name)
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'absent')
    .order('marked_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}
