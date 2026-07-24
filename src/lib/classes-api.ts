import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { ROLE_IDS } from '@/lib/role-ids'

export interface ClassRow {
  id: number
  name: string
  academic_level_id: number | null
  studentCount: number
}

export interface ClassStudent {
  userId: string
  name: string
  email: string | null
}

export async function fetchClasses(): Promise<ClassRow[]> {
  const { data: classes, error } = await supabase
    .from('classes')
    .select('id, name, academic_level_id')
    .order('name')

  if (error) throw error

  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('class_id')

  const countByClass = new Map<number, number>()
  for (const row of enrollments ?? []) {
    countByClass.set(row.class_id, (countByClass.get(row.class_id) ?? 0) + 1)
  }

  return (classes ?? []).map((cls) => ({
    id: cls.id,
    name: cls.name,
    academic_level_id: cls.academic_level_id,
    studentCount: countByClass.get(cls.id) ?? 0,
  }))
}

export async function createClass(name: string, academicLevelId?: number) {
  const { data, error } = await supabase
    .from('classes')
    .insert({
      name: name.trim(),
      academic_level_id: academicLevelId ?? null,
    })
    .select('id')
    .single()

  if (error) throw error
  return data.id as number
}

export async function updateClass(classId: number, name: string) {
  const { error } = await supabase
    .from('classes')
    .update({ name: name.trim() })
    .eq('id', classId)

  if (error) throw error
}

export async function deleteClass(classId: number) {
  const { error } = await supabase.from('classes').delete().eq('id', classId)
  if (error) throw error
}

export async function fetchClassStudents(classId: number): Promise<ClassStudent[]> {
  const { data, error } = await supabase
    .from('student_enrollments')
    .select('student_id, profiles(user_id, first_name, last_name, email)')
    .eq('class_id', classId)

  if (error) throw error

  return (data ?? []).map((row) => {
    const profile = row.profiles as {
      user_id: string
      first_name: string | null
      last_name: string | null
      email: string | null
    } | null
    return {
      userId: row.student_id,
      name: profile ? formatUserDisplayName(profile) : 'Élève',
      email: profile?.email ?? null,
    }
  })
}

export async function assignStudentToClass(studentId: string, classId: number) {
  const { error } = await supabase.from('student_enrollments').insert({
    student_id: studentId,
    class_id: classId,
  })

  if (error && error.code !== '23505') throw error
}

export async function removeStudentFromClass(studentId: string, classId: number) {
  const { error } = await supabase
    .from('student_enrollments')
    .delete()
    .eq('student_id', studentId)
    .eq('class_id', classId)

  if (error) throw error
}

export async function fetchStudentsWithoutClass(): Promise<ClassStudent[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email')
    .eq('role_id', ROLE_IDS.student)
    .order('last_name')

  if (error) throw error

  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student_id')

  const enrolled = new Set((enrollments ?? []).map((e) => e.student_id))

  return (profiles ?? [])
    .filter((p) => !enrolled.has(p.user_id))
    .map((p) => ({
      userId: p.user_id,
      name: formatUserDisplayName(p),
      email: p.email,
    }))
}

export async function fetchTeacherClasses(teacherId: string): Promise<{ id: number; name: string, studentCount?: number }[]> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('class_id, classes(id, name)')
    .eq('teacher_id', teacherId)

  if (error) throw error

  const seen = new Map<number, { id: number; name: string }>()
  for (const row of courses ?? []) {
    const cls = row.classes as { id: number; name: string } | null
    if (cls && !seen.has(cls.id)) {
      seen.set(cls.id, cls)
    }
  }
  
  const classIds = Array.from(seen.keys())
  if (classIds.length === 0) return []
  
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('class_id')
    .in('class_id', classIds)

  const countByClass = new Map<number, number>()
  for (const row of enrollments ?? []) {
    countByClass.set(row.class_id, (countByClass.get(row.class_id) ?? 0) + 1)
  }

  return [...seen.values()]
    .map(cls => ({
      ...cls,
      studentCount: countByClass.get(cls.id) ?? 0
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

export async function fetchCoursesForClass(classId: number, teacherId?: string) {
  let query = supabase
    .from('courses')
    .select('id, name, class_id')
    .eq('class_id', classId)
    .order('name')

  if (teacherId) {
    query = query.eq('teacher_id', teacherId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map((c) => ({ id: c.id as string, name: c.name as string }))
}

export async function fetchTeacherClassStudents(teacherId: string): Promise<ClassStudent[]> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('class_id')
    .eq('teacher_id', teacherId)

  if (error) throw error

  const classIds = [...new Set((courses ?? []).map((c) => c.class_id))]
  if (classIds.length === 0) return []

  const { data: enrollments, error: enrollError } = await supabase
    .from('student_enrollments')
    .select('student_id, profiles(user_id, first_name, last_name, email)')
    .in('class_id', classIds)

  if (enrollError) throw enrollError

  const seen = new Set<string>()
  const students: ClassStudent[] = []

  for (const row of enrollments ?? []) {
    if (seen.has(row.student_id)) continue
    seen.add(row.student_id)
    const profile = row.profiles as {
      user_id: string
      first_name: string | null
      last_name: string | null
      email: string | null
    } | null
    students.push({
      userId: row.student_id,
      name: profile ? formatUserDisplayName(profile) : 'Élève',
      email: profile?.email ?? null,
    })
  }

  return students.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}
