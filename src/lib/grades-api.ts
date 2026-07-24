import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'

export interface GradeRow {
  id: string
  studentId: string
  studentName: string
  teacherId: string
  teacherName: string
  courseId: string | null
  subject: string
  score: number
  maxScore: number
  observations: string | null
  term: string | null
  createdAt: string
}

export interface CreateGradeInput {
  studentId: string
  teacherId: string
  courseId?: string
  subject: string
  score: number
  maxScore?: number
  observations?: string
  term?: string
}

export async function fetchGradesForStudent(studentId: string): Promise<GradeRow[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return mapGradeRows(data ?? [])
}

export async function fetchGradesForTeacher(teacherId: string): Promise<GradeRow[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return mapGradeRows(data ?? [])
}

export async function fetchAllGrades(): Promise<GradeRow[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return mapGradeRows(data ?? [])
}

async function mapGradeRows(rows: Record<string, unknown>[]): Promise<GradeRow[]> {
  if (rows.length === 0) return []

  const userIds = new Set<string>()
  for (const row of rows) {
    userIds.add(String(row.student_id))
    userIds.add(String(row.teacher_id))
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name')
    .in('user_id', [...userIds])

  const names = new Map<string, string>()
  for (const p of profiles ?? []) {
    names.set(p.user_id, formatUserDisplayName(p))
  }

  return rows.map((row) => ({
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: names.get(String(row.student_id)) ?? 'Élève',
    teacherId: String(row.teacher_id),
    teacherName: names.get(String(row.teacher_id)) ?? 'Professeur',
    courseId: row.course_id ? String(row.course_id) : null,
    subject: String(row.subject),
    score: Number(row.score),
    maxScore: Number(row.max_score ?? 20),
    observations: row.observations ? String(row.observations) : null,
    term: row.term ? String(row.term) : null,
    createdAt: String(row.created_at),
  }))
}

export async function createGrade(input: CreateGradeInput) {
  const { error } = await supabase.from('grades').insert({
    student_id: input.studentId,
    teacher_id: input.teacherId,
    course_id: input.courseId ?? null,
    subject: input.subject.trim(),
    score: input.score,
    max_score: input.maxScore ?? 20,
    observations: input.observations?.trim() || null,
    term: input.term?.trim() || null,
  })

  if (error) throw error
}

export async function deleteGrade(gradeId: string) {
  const { error } = await supabase.from('grades').delete().eq('id', gradeId)
  if (error) throw error
}

export async function fetchCoursesForGrading(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name')
    .order('name')

  if (error) throw error
  return (data ?? []).map((c) => ({ id: c.id, name: c.name }))
}
