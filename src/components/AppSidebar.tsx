
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/components/auth/AuthProvider'
import { getNavItemsForRole } from '@/lib/role-navigation'
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administration',
  teacher: 'Espace professeur',
  student: 'Espace étudiant',
  parent: 'Espace parent',
}

export function AppSidebar() {
  const location = useLocation()
  const { signOut, userProfile } = useAuth()
  const menuItems = getNavItemsForRole(userProfile?.role)
  const totalUnread = useUnreadMessagesCount()

  return (
    <Sidebar className="hidden lg:flex border-r border-school-yellow/20">
      <SidebarHeader className="bg-school-black text-school-yellow p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src="/lovable-uploads/3e4bbc9d-9aac-4075-9c18-7bd64ab1fdf5.png"
              alt="Houssem Academy Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">Houssem Academy</h2>
            <p className="text-school-yellow/70 text-sm">
              {ROLE_LABELS[userProfile?.role ?? ''] ?? 'Portail'}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-school-black/70">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isMessaging = item.url === '/messaging'
                const showBadge = isMessaging && totalUnread > 0

                return (
                  <SidebarMenuItem key={`${item.url}-${item.title}`}>
                    <SidebarMenuButton
                      asChild
                      className={`${
                        location.pathname === item.url
                          ? 'bg-school-yellow text-school-black'
                          : 'text-school-black hover:bg-school-yellow/10'
                      } transition-colors duration-200`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium flex-1">{item.title}</span>
                        {showBadge && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                            {totalUnread > 99 ? '99+' : totalUnread}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-school-gray-light border-t space-y-3">
        <Card className="border-school-yellow/20 shadow-none">
          <CardContent className="p-3 space-y-2">
            <div className="text-sm text-school-black/70">
              <p className="font-medium truncate">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
              <p className="text-xs text-school-black/50 truncate">{userProfile?.email}</p>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-school-black/40">© 2025 Houssem Academy</p>
      </SidebarFooter>
    </Sidebar>
  )
}
