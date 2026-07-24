import type { AppRole } from '@/lib/role-navigation'

/** DB uses `prof`; app uses `teacher`. */
export function normalizeRoleName(roleName?: string | null): AppRole | undefined {
  if (!roleName) return undefined
  if (roleName === 'prof') return 'teacher'
  if (roleName === 'admin' || roleName === 'teacher' || roleName === 'student' || roleName === 'parent') {
    return roleName
  }
  return undefined
}

export const ROLE_ID_TO_APP_ROLE: Record<number, AppRole> = {
  1: 'admin',
  2: 'teacher',
  3: 'student',
  4: 'parent',
}

/** Role name as stored in `user_roles.role_name`. */
export function appRoleToDbRoleName(role: AppRole): string {
  return role === 'teacher' ? 'prof' : role
}
