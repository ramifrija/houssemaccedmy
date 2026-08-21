import {
  Home,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  Settings,
  MessageSquare,
  Bell,
  BookOpen,
  GraduationCap,
  FolderOpen,
  ClipboardList,
  DollarSign,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type AppRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  roles: AppRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { title: 'Tableau de bord', url: '/', icon: Home, roles: ['admin'] },
  { title: 'Mon espace', url: '/teacher-dashboard', icon: Home, roles: ['teacher'] },
  { title: 'Mon espace', url: '/student-dashboard', icon: Home, roles: ['student'] },
  { title: 'Mon espace parent', url: '/parent-dashboard', icon: Home, roles: ['parent'] },
  { title: 'Mes notes', url: '/student/grades', icon: BookOpen, roles: ['student'] },
  { title: 'Messagerie', url: '/messaging', icon: MessageSquare, roles: ['admin', 'teacher', 'student', 'parent'] },
  { title: 'Calendrier', url: '/calendar', icon: Calendar, roles: ['admin', 'teacher', 'student', 'parent'] },
  { title: 'Annonces & Notifications', url: '/announcements', icon: Bell, roles: ['admin', 'teacher', 'student', 'parent'] },
  { title: 'Utilisateurs', url: '/users', icon: Users, roles: ['admin'] },
  { title: 'Fiches élèves', url: '/students', icon: FolderOpen, roles: ['admin', 'teacher'] },
  { title: 'Fiches profs', url: '/teachers', icon: ClipboardList, roles: ['admin'] },
  { title: 'Classes', url: '/classes', icon: GraduationCap, roles: ['admin'] },
  { title: 'Matières', url: '/matieres', icon: BookOpen, roles: ['admin'] },
  { title: 'Notes', url: '/teacher/grades', icon: BookOpen, roles: ['admin', 'teacher'] },
  { title: 'Présences', url: '/attendance', icon: UserCheck, roles: ['admin', 'teacher'] },
  { title: 'Paiements', url: '/payments', icon: DollarSign, roles: ['admin'] },
  { title: 'Finances', url: '/finances', icon: Wallet, roles: ['admin'] },
  { title: 'Rapports', url: '/reports', icon: BarChart3, roles: ['admin'] },
  { title: 'Paramètres', url: '/settings', icon: Settings, roles: ['admin', 'teacher', 'student', 'parent'] },
]

export function getNavItemsForRole(role?: string): NavItem[] {
  if (!role) return []
  return NAV_ITEMS.filter((item) => item.roles.includes(role as AppRole))
}

export function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case 'teacher':
      return '/teacher-dashboard'
    case 'student':
      return '/student-dashboard'
    case 'parent':
      return '/parent-dashboard'
    case 'admin':
    default:
      return '/'
  }
}
