import type { SupabaseClient } from '@supabase/supabase-js'
import { CreatableRole, ROLE_IDS } from '@/lib/role-ids'
import { appRoleToDbRoleName } from '@/lib/normalize-role'

export async function resolveRoleId(
  client: SupabaseClient,
  role: CreatableRole | 'admin'
): Promise<number> {
  const dbRoleName = appRoleToDbRoleName(role as 'admin' | 'teacher' | 'student' | 'parent')

  const { data } = await client
    .from('user_roles')
    .select('id')
    .eq('role_name', dbRoleName)
    .maybeSingle()

  if (data?.id) return data.id

  if (role === 'teacher') {
    const { data: fallback } = await client
      .from('user_roles')
      .select('id')
      .eq('role_name', 'teacher')
      .maybeSingle()
    if (fallback?.id) return fallback.id
  }

  return ROLE_IDS[role as CreatableRole] ?? ROLE_IDS.student
}

export function adminCreateUserMetadata(input: {
  first_name: string
  last_name: string
  role: CreatableRole
  subject?: string
}) {
  return {
    first_name: input.first_name.trim(),
    last_name: input.last_name.trim(),
    role: input.role,
    subject: input.subject?.trim() ?? null,
    created_by_admin: 'true',
  }
}
