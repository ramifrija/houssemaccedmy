import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { fetchTeacherClassStudents } from '@/lib/classes-api'
import { fetchStudents } from '@/lib/users-api'
import { fetchGradesForStudent } from '@/lib/grades-api'

export type PaymentStatus = 'paid' | 'partial' | 'unpaid'

export interface StudentDossierListItem {
  userId: string
  name: string
  email: string | null
  className: string | null
  classId: number | null
  currentPaymentStatus: PaymentStatus | null
}

export interface StudentDossierProfile {
  userId: string
  name: string
  email: string | null
  className: string | null
  classId: number | null
  createdAt: string
}

export interface StudentAttendanceEntry {
  id: string
  status: string
  sessionDate: string
  subject: string
  className: string
  startTime: string
  markedAt: string | null
}

export interface StudentPaymentRow {
  id: string
  amount: number
  paymentDate: string
  status: string
  paymentMethod: string | null
  notes: string | null
}

export interface InsertPaymentInput {
  studentId: string
  amount: number
  paymentDate: string
  paymentMethod?: string
  notes?: string
  recordedBy: string
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

export function formatPaymentPeriod(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`
}

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
    case 'paid':
      return 'Payé'
    case 'partial':
      return 'Partiel'
    case 'pending':
      return 'En attente'
    case 'refunded':
      return 'Remboursé'
    case 'failed':
      return 'Échoué'
    default:
      return 'Impayé'
  }
}

async function fetchCurrentPaymentStatuses(
  studentIds: string[]
): Promise<Map<string, PaymentStatus>> {
  const map = new Map<string, PaymentStatus>()
  if (studentIds.length === 0) return map

  const now = new Date()
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const currentMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`

  const { data, error } = await supabase
    .from('student_payments')
    .select('student_id, status, payment_date')
    .in('student_id', studentIds)
    .gte('payment_date', currentMonthStart)
    .lte('payment_date', currentMonthEnd)

  if (error) throw error
  for (const row of data ?? []) {
    const status = row.status === 'completed' ? 'paid' : (row.status === 'pending' ? 'unpaid' : 'unpaid')
    map.set(row.student_id, status as PaymentStatus)
  }
  return map
}

export async function fetchStudentsForDossier(
  teacherId?: string,
  isAdmin = false
): Promise<StudentDossierListItem[]> {
  let students: { userId: string; name: string; email: string | null; className?: string; classId?: number }[]

  if (isAdmin) {
    // To match the professors panel, we fetch ALL students from enrollments OR fetchStudents
    const rows = await fetchStudents()
    
    // Some students might be in enrollments but missing role_id = 3, so we fetch them too
    const { data: allEnrollments } = await supabase
      .from('student_enrollments')
      .select('student_id, class_id, classes(name), profiles(user_id, first_name, last_name, email)')
    
    const studentMap = new Map<string, { userId: string; name: string; email: string | null; className?: string; classId?: number }>()
    
    for (const r of rows) {
      studentMap.set(r.user_id, {
        userId: r.user_id,
        name: formatUserDisplayName(r),
        email: r.email,
        className: r.class_name ?? null,
        classId: r.class_id ?? null,
      })
    }
    
    for (const e of allEnrollments ?? []) {
      if (!studentMap.has(e.student_id) && e.profiles) {
        const p = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles
        if (p) {
          const c = Array.isArray(e.classes) ? e.classes[0] : e.classes
          studentMap.set(e.student_id, {
            userId: e.student_id,
            name: formatUserDisplayName(p),
            email: p.email,
            className: c?.name ?? null,
            classId: e.class_id,
          })
        }
      }
    }
    
    students = Array.from(studentMap.values())
  } else if (teacherId) {
    const rows = await fetchTeacherClassStudents(teacherId)
    
    // Fetch the classes the teacher actually teaches
    const { data: teacherCourses } = await supabase
      .from('courses')
      .select('class_id')
      .eq('teacher_id', teacherId)
    const teacherClassIds = new Set((teacherCourses ?? []).map(c => c.class_id))

    const classByStudent = new Map<string, { name: string; id: number }[]>()
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('student_id, class_id, classes(name)')
      .in('student_id', rows.map((r) => r.userId))

    for (const e of enrollments ?? []) {
      if (!teacherClassIds.has(e.class_id)) continue
      const cls = e.classes as { name: string } | null
      const list = classByStudent.get(e.student_id) ?? []
      list.push({ name: cls?.name ?? '—', id: e.class_id })
      classByStudent.set(e.student_id, list)
    }

    students = rows.map((s) => {
      const studentClasses = classByStudent.get(s.userId) ?? []
      const classNames = studentClasses.map(c => c.name).join(', ')
      return {
        userId: s.userId,
        name: s.name,
        email: s.email,
        className: classNames || null,
        classId: studentClasses[0]?.id ?? null,
      }
    })
  } else {
    return []
  }

  students.sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  const paymentMap = isAdmin
    ? await fetchCurrentPaymentStatuses(students.map((s) => s.userId))
    : new Map<string, PaymentStatus>()

  return students.map((s) => ({
    userId: s.userId,
    name: s.name,
    email: s.email,
    className: s.className ?? null,
    classId: s.classId ?? null,
    currentPaymentStatus: paymentMap.get(s.userId) ?? null,
  }))
}

export async function fetchStudentDossierProfile(studentId: string): Promise<StudentDossierProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, created_at')
    .eq('user_id', studentId)
    .single()

  if (error) throw error
  if (!profile) return null

  const { data: enrollment } = await supabase
    .from('student_enrollments')
    .select('class_id, classes(name)')
    .eq('student_id', studentId)
    .maybeSingle()

  const cls = enrollment?.classes as { name: string } | null

  return {
    userId: profile.user_id,
    name: formatUserDisplayName(profile),
    email: profile.email,
    className: cls?.name ?? null,
    classId: enrollment?.class_id ?? null,
    createdAt: profile.created_at,
  }
}

export async function fetchStudentAttendanceHistory(studentId: string): Promise<StudentAttendanceEntry[]> {
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
        classes (name)
      )
    `)
    .eq('student_id', studentId)
    .order('marked_at', { ascending: false })
    .limit(100)

  if (error) throw error

  return (data ?? []).map((row) => {
    const session = row.attendance_sessions as {
      subject: string
      session_date: string
      start_time: string
      classes: { name: string } | null
    } | null

    return {
      id: row.id,
      status: row.status,
      sessionDate: session?.session_date ?? '—',
      subject: session?.subject ?? '—',
      className: session?.classes?.name ?? '—',
      startTime: session?.start_time?.slice(0, 5) ?? '—',
      markedAt: row.marked_at,
    }
  })
}

export async function fetchStudentDossierGrades(studentId: string) {
  return fetchGradesForStudent(studentId)
}

export async function fetchStudentPayments(studentId: string): Promise<StudentPaymentRow[]> {
  const { data, error } = await supabase
    .from('student_payments')
    .select('id, amount, payment_date, status, payment_method, notes')
    .eq('student_id', studentId)
    .order('payment_date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    amount: Number(row.amount),
    paymentDate: row.payment_date,
    status: row.status,
    paymentMethod: row.payment_method,
    notes: row.notes,
  }))
}

export async function insertStudentPayment(input: InsertPaymentInput) {
  const { error } = await supabase.from('student_payments').insert({
    student_id: input.studentId,
    amount: input.amount,
    payment_date: input.paymentDate,
    status: 'completed',
    payment_method: input.paymentMethod?.trim() || null,
    notes: input.notes?.trim() || null,
    recorded_by: input.recordedBy,
  })

  if (error) throw error
}

export async function deleteStudentPayment(paymentId: string) {
  const { error } = await supabase.from('student_payments').delete().eq('id', paymentId)
  if (error) throw error
}

export function attendanceStatusLabel(status: string): string {
  switch (status) {
    case 'present':
      return 'Présent'
    case 'absent':
      return 'Absent'
    case 'late':
      return 'Retard'
    default:
      return status
  }
}
