import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getNavItemsForRole } from '@/lib/role-navigation'
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount'

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { signOut, userProfile } = useAuth()
  const menuItems = getNavItemsForRole(userProfile?.role)
  const totalUnread = useUnreadMessagesCount()

  const primaryItems = menuItems.slice(0, 4)
  const moreItems = menuItems.slice(4)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-school-yellow/20 px-2 py-2 z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {primaryItems.map((item) => {
          const isMessaging = item.url === '/messaging'
          const showBadge = isMessaging && totalUnread > 0

          return (
            <Link
              key={`${item.url}-${item.title}`}
              to={item.url}
              className={`relative flex flex-col items-center gap-0.5 p-2 rounded-xl min-w-[4rem] transition-all ${
                location.pathname === item.url
                  ? 'bg-school-yellow text-school-black shadow-sm'
                  : 'text-school-black/60 hover:bg-school-yellow/10'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {totalUnread > 99 ? '99+' : totalUnread}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate max-w-[4rem]">
                {item.title.split(' ')[0]}
              </span>
            </Link>
          )
        })}

        {moreItems.length > 0 && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-0.5 p-2 h-auto min-w-[4rem] text-school-black/60 hover:bg-school-yellow/10"
              >
                <Menu className="w-5 h-5" />
                <span className="text-[10px] font-medium">Plus</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl">
              <div className="flex flex-col h-full pt-2">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-school-yellow/20">
                  <img
                    src="/lovable-uploads/3e4bbc9d-9aac-4075-9c18-7bd64ab1fdf5.png"
                    alt="Houssem Academy"
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <h2 className="font-bold text-lg text-school-black">Houssem Academy</h2>
                    <p className="text-school-black/60 text-sm">Menu complet</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1">
                  {moreItems.map((item) => {
                    const isMessaging = item.url === '/messaging'
                    const showBadge = isMessaging && totalUnread > 0

                    return (
                      <Link
                        key={`${item.url}-${item.title}`}
                        to={item.url}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          location.pathname === item.url
                            ? 'bg-school-yellow text-school-black'
                            : 'text-school-black hover:bg-school-yellow/10'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium flex-1">{item.title}</span>
                        {showBadge && (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                            {totalUnread > 99 ? '99+' : totalUnread}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>

                <div className="pt-4 border-t border-school-yellow/20 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-school-gray-light rounded-xl">
                    <div className="w-9 h-9 bg-school-yellow/30 rounded-full flex items-center justify-center text-sm font-bold">
                      {userProfile?.first_name?.[0]}
                      {userProfile?.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {userProfile?.first_name} {userProfile?.last_name}
                      </p>
                      <p className="text-xs text-school-black/60 truncate">{userProfile?.email}</p>
                    </div>
                  </div>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </nav>
  )
}

export default MobileNavigation
