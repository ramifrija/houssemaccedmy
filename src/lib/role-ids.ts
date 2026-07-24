export const ROLE_IDS = {
  admin: 1,
  teacher: 2,
  student: 3,
  parent: 4,
} as const

export type CreatableRole = 'student' | 'teacher' | 'parent' | 'admin'

export const ROLE_LABELS: Record<CreatableRole, string> = {
  student: 'Élève',
  teacher: 'Professeur',
  parent: 'Parent',
  admin: 'Administrateur',
}
