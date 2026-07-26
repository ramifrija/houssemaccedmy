import { supabase } from '@/integrations/supabase/client'
import { ROLE_IDS } from '@/lib/role-ids'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { deleteUser as adminDeleteUser } from '@/lib/admin-delete-user'

export interface UserRow {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  created_at: string
  role_name: string
  status: string | null
  class_name?: string
  class_id?: number
}

type ProfileRow = {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  created_at: string
  role_id: number
}

export async function fetchTeachers(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, email, created_at, role_id, status')
    .eq('role_id', ROLE_IDS.teacher)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email ?? null,
    created_at: row.created_at,
    role_name: 'prof',
    status: row.status ?? null,
  }))
}

export async function fetchAdmins(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, email, created_at, role_id, status')
    .eq('role_id', ROLE_IDS.admin)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email ?? null,
    created_at: row.created_at,
    role_name: 'admin',
    status: row.status ?? null,
  }))
}

export async function fetchStudents(): Promise<UserRow[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, email, created_at, role_id, status')
    .eq('role_id', ROLE_IDS.student)
    .order('created_at', { ascending: false })

  if (error) throw error

  type ProfileRowWithStatus = ProfileRow & { status: string | null }
  const rows = (profiles ?? []) as ProfileRowWithStatus[]
  if (rows.length === 0) return []

  const userIds = rows.map((p) => p.user_id)
  const { data: enrollments } = await supabase
    .from('student_enrollments')
    .select('student_id, class_id, classes(name)')
    .in('student_id', userIds)

  type EnrollmentQueryResult = {
    student_id: string
    class_id: number
    classes: { name: string } | { name: string }[] | null
  }

  const classByStudent = new Map<string, { name: string; class_id: number }>()
  for (const e of (enrollments ?? []) as unknown as EnrollmentQueryResult[]) {
    const clsObj = Array.isArray(e.classes) ? e.classes[0] : e.classes
    classByStudent.set(e.student_id, {
      name: clsObj?.name ?? '',
      class_id: e.class_id,
    })
  }

  return rows.map((profile) => {
    const cls = classByStudent.get(profile.user_id)
    return {
      id: profile.id,
      user_id: profile.user_id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email ?? null,
      created_at: profile.created_at,
      role_name: 'student',
      status: profile.status ?? null,
      class_name: cls?.name,
      class_id: cls?.class_id,
    }
  })
}

export interface UpdateUserInput {
  user_id: string
  first_name: string
  last_name: string
  email: string
  class_id?: number | null
  status?: string
  password?: string
}

export async function updateUser(input: UpdateUserInput) {
  const updatePayload: Record<string, unknown> = {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    email: input.email.trim(),
  }
  if (input.status !== undefined) updatePayload.status = input.status

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('user_id', input.user_id)

  if (error) throw error

  if (input.class_id !== undefined) {
    await supabase.from('student_enrollments').delete().eq('student_id', input.user_id)

    if (input.class_id) {
      const { error: enrollError } = await supabase.from('student_enrollments').insert({
        student_id: input.user_id,
        class_id: input.class_id,
      })
      if (enrollError) throw enrollError
    }
  }

  if (input.password && input.password.trim().length > 0) {
    const { error: rpcError } = await supabase.rpc('admin_update_user_password', {
      p_user_id: input.user_id,
      p_password: input.password.trim(),
    })

    if (rpcError) {
      console.warn('Erreur lors de la mise à jour du mot de passe via RPC:', rpcError)
      throw new Error(rpcError.message ?? 'Erreur lors de la modification du mot de passe')
    }
  }
}

export async function updateUserStatus(userId: string, status: 'approved' | 'pending' | 'rejected') {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('user_id', userId)
  if (error) throw error
}

export async function deleteUser(userId: string) {
  await adminDeleteUser(userId)
}

export function teacherDisplayName(
  teachers: UserRow[],
  teacherId: string
): string {
  const teacher = teachers.find((t) => t.user_id === teacherId)
  return teacher ? formatUserDisplayName(teacher) : 'Professeur'
}

export interface TeacherOption {
  user_id: string
  label: string
}

export async function fetchTeacherOptions(): Promise<TeacherOption[]> {
  const teachers = await fetchTeachers()
  return teachers.map((t) => ({
    user_id: t.user_id,
    label: formatUserDisplayName(t),
  }))
}

export async function fetchParents(): Promise<UserRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, email, created_at, role_id, status')
    .eq('role_id', ROLE_IDS.parent)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email ?? null,
    created_at: row.created_at,
    role_name: 'parent',
    status: row.status ?? null,
  }))
}

export async function fetchParentChildren(parentId: string): Promise<UserRow[]> {
  const { data: psData, error: psErr } = await supabase
    .from('parent_students')
    .select('student_id')
    .eq('parent_id', parentId)

  if (psErr) throw psErr
  const studentIds = (psData ?? []).map((d) => d.student_id)

  if (studentIds.length === 0) return []

  const { data, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, email, created_at, role_id')
    .in('user_id', studentIds)

  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    email: row.email ?? null,
    created_at: row.created_at,
    role_name: 'student',
  }))
}

export async function assignStudentToParent(parentId: string, studentId: string) {
  const { error } = await supabase.from('parent_students').insert({
    parent_id: parentId,
    student_id: studentId,
  })
  if (error && !error.message.includes('unique')) throw error
  await supabase.from('profiles').update({ parent_id: parentId }).eq('user_id', studentId)
}

export async function removeStudentFromParent(parentId: string, studentId: string) {
  const { error } = await supabase
    .from('parent_students')
    .delete()
    .eq('parent_id', parentId)
    .eq('student_id', studentId)

  if (error) throw error
}

export interface ClassOption {
  id: number
  name: string
}

export async function fetchClassOptions(): Promise<ClassOption[]> {
  const { data, error } = await supabase.from('classes').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}

export interface MatiereOption {
  id: string
  name: string
}

export async function fetchMatiereOptions(): Promise<MatiereOption[]> {
  const { data, error } = await supabase.from('matieres').select('id, name').order('name')
  if (error) throw error
  return data ?? []
}
