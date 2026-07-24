import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Calendar, BookOpen, Bell, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { fetchAnnouncements } from '@/lib/announcements-api'
import {
  fetchCalendarSessionsForStudent,
  sessionsForDateActive,
} from '@/lib/courses-api'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const today = new Date()

  const { data: sessions = [] } = useQuery({
    queryKey: ['student-sessions', user?.id],
    queryFn: () => fetchCalendarSessionsForStudent(user!.id),
    enabled: !!user?.id,
  })

  const todayClasses = sessionsForDateActive(sessions, today)

  const { data: recentAnnouncements = [] } = useQuery({
    queryKey: ['announcements', 'student-recent'],
    queryFn: () => fetchAnnouncements(3),
  })

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader
          title="Mon Espace Élève"
          description="Vos cours, annonces et messages"
        />

        <div className="p-4 space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => navigate('/messaging')}
              className="bg-blue-600 text-white hover:bg-blue-700 h-16 flex-col gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">Messages</span>
            </Button>
            <Button
              onClick={() => navigate('/calendar')}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Emploi du temps</span>
            </Button>
            <Button
              onClick={() => navigate('/student/grades')}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Mes Notes</span>
            </Button>
          </div>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Annonces Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length === 0 ? (
                <p className="text-sm text-school-black/50 text-center py-4">Aucune annonce pour le moment</p>
              ) : (
                <div className="space-y-3">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          announcement.priority === 'high'
                            ? 'bg-red-500'
                            : announcement.priority === 'low'
                              ? 'bg-green-500'
                              : 'bg-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-school-black text-sm">{announcement.title}</p>
                          <span className="text-school-black/50 text-xs">
                            {new Date(announcement.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-school-black/70 text-sm line-clamp-2">{announcement.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-school-yellow/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-school-black text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Mes Cours Aujourd&apos;hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayClasses.length === 0 ? (
                <p className="text-sm text-school-black/50 text-center py-4">Aucun cours aujourd&apos;hui</p>
              ) : (
                <div className="space-y-3">
                  {todayClasses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-school-yellow/20 rounded-lg">
                          <Clock className="w-5 h-5 text-school-black" />
                        </div>
                        <div>
                          <p className="font-medium text-school-black text-sm">{course.title}</p>
                          <p className="text-school-black/60 text-xs">
                            {course.teacherName} — {course.room}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {course.startTime}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
