
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Calendar, TrendingUp, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useResponsive } from '@/hooks/use-responsive'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchAttendanceTrend,
  fetchClassAttendanceStats,
  fetchSessionsTodayCount,
  fetchStudentCount,
  fetchTeacherCount,
} from '@/lib/reports-api'
import { fetchAnnouncements } from '@/lib/announcements-api'

const Index = () => {
  const { isMobile, isTablet } = useResponsive()
  const todayStr = new Date().toISOString().slice(0, 10)

  const { data: totalStudents = 0, isLoading: loadingStudents } = useQuery({
    queryKey: ['admin-total-students'],
    queryFn: fetchStudentCount,
  })

  const { data: totalTeachers = 0 } = useQuery({
    queryKey: ['admin-total-teachers'],
    queryFn: fetchTeacherCount,
  })

  const { data: sessionsToday = 0, isLoading: loadingSessions } = useQuery({
    queryKey: ['admin-sessions-today', todayStr],
    queryFn: () => fetchSessionsTodayCount(todayStr),
  })

  const { data: attendanceTrend = [], isLoading: loadingTrend } = useQuery({
    queryKey: ['admin-attendance-trend'],
    queryFn: () => fetchAttendanceTrend(7),
  })

  const { data: classStats = [] } = useQuery({
    queryKey: ['admin-class-stats', todayStr],
    queryFn: () => fetchClassAttendanceStats(todayStr),
  })

  const { data: recentAnnouncements = [] } = useQuery({
    queryKey: ['announcements', 'recent'],
    queryFn: () => fetchAnnouncements(5),
  })

  const presentRate =
    attendanceTrend.length > 0
      ? `${attendanceTrend[attendanceTrend.length - 1]?.rate ?? 0}%`
      : '—'

  const stats = [
    { title: 'Total Élèves', value: String(totalStudents), change: 'Inscrits', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Professeurs', value: String(totalTeachers), change: 'Actifs', icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Séances Aujourd\'hui', value: String(sessionsToday), change: 'Cours planifiés', icon: Calendar, color: 'text-school-yellow', bgColor: 'bg-yellow-50' },
    { title: 'Taux de Présence', value: presentRate, change: "Aujourd'hui", icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  ]

  const statsLoading = loadingStudents || loadingSessions
  const gridGap = isMobile ? 'gap-3' : 'gap-6'
  const statsGrid = isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title="Tableau de Bord"
        description="Vue d'ensemble de l'établissement"
        actions={
          <Button asChild variant="outline" size="sm" className="border-school-yellow text-school-black hover:bg-school-yellow/10">
            <Link to="/announcements">
              <Bell className="w-4 h-4 mr-2" />
              Annonces
            </Link>
          </Button>
        }
      />

      <div className={`${isMobile ? 'p-3' : 'p-6'} space-y-6`}>
        <div className={`grid ${gridGap} ${statsGrid}`}>
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-school-yellow/20">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => (
                <Card key={stat.title} className="border-school-yellow/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-school-black">{stat.title}</CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-school-black">{stat.value}</div>
                    <p className="text-xs text-school-black/60 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className={`grid ${gridGap} ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          <Card className={`${isMobile ? '' : 'lg:col-span-2'} border-school-yellow/20`}>
            <CardHeader>
              <CardTitle className="text-school-black">Dernières annonces</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-school-black/50 text-center py-8">Aucune annonce</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-school-gray-light/50">
                      <div className="w-2 h-2 rounded-full bg-school-yellow shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-school-black truncate">{item.title}</p>
                        <p className="text-xs text-school-black/60">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline">{item.priority}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="text-school-black">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start bg-school-yellow text-school-black hover:bg-school-yellow-dark">
                <Link to="/users">
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/classes">
                  <Calendar className="w-4 h-4 mr-2" />
                  Classes
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/calendar">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendrier
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/reports">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Rapports
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className={`grid ${gridGap} grid-cols-1`}>
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="text-school-black">Présences — 7 jours</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTrend || attendanceTrend.length === 0 ? (
                <p className="text-sm text-center text-school-black/50 py-12">Pas de données de présence</p>
              ) : (
                <div className={isMobile ? 'h-48' : 'h-64'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(value: number) => [`${value}%`, 'Taux']} />
                      <Line type="monotone" dataKey="rate" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Index
