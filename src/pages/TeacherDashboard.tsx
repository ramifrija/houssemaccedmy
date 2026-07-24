import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Calendar, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  fetchCalendarSessionsForTeacher,
  sessionsForDateActive,
} from '@/lib/courses-api'
import { fetchMyConversations } from '@/lib/messaging-api'
import { queryKeys } from '@/lib/query-keys'
import { ActiveSessionPanel } from '@/components/teacher/ActiveSessionPanel'

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const today = new Date()

  const { data: sessions = [] } = useQuery({
    queryKey: ['teacher-sessions', user?.id],
    queryFn: () => fetchCalendarSessionsForTeacher(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60_000,
  })

  const todayClasses = sessionsForDateActive(sessions, today)

  const { data: conversations = [] } = useQuery({
    queryKey: queryKeys.conversations,
    queryFn: fetchMyConversations,
  })

  const recentMessages = conversations
    .filter((c) => c.lastMessage)
    .slice(0, 5)
    .map((c) => ({
      student: c.name,
      message: c.lastMessage,
      time: c.lastMessageAt
        ? new Date(c.lastMessageAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        : '—',
      conversationId: c.id,
    }))

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader
          title="Espace Professeur"
          description="Vos cours et communications"
          actions={
            <Button
              onClick={() => navigate('/messaging')}
              className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messagerie
            </Button>
          }
        />

        <div className="p-4 space-y-6 animate-fade-in">
          <ActiveSessionPanel sessions={sessions} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => navigate('/messaging')}
              className="bg-blue-600 text-white hover:bg-blue-700 h-16 flex-col gap-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm">Messages</span>
            </Button>
            <Button
              onClick={() => navigate('/students')}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Fiches élèves</span>
            </Button>
            <Button
              onClick={() => navigate('/calendar')}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Planning</span>
            </Button>
            <Button
              onClick={() => navigate('/teacher/grades')}
              variant="outline"
              className="h-16 flex-col gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-sm">Notes</span>
            </Button>
          </div>

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
                          <BookOpen className="w-5 h-5 text-school-black" />
                        </div>
                        <div>
                          <p className="font-medium text-school-black text-sm">{course.title}</p>
                          <p className="text-school-black/60 text-xs">
                            {course.className} — {course.room}
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

          <Card className="border-school-yellow/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-school-black text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <p className="text-sm text-school-black/50 text-center py-4">Aucun message récent</p>
              ) : (
                <div className="space-y-3">
                  {recentMessages.map((msg) => (
                    <div
                      key={msg.conversationId}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-school-yellow/10 hover:bg-school-yellow/5 cursor-pointer"
                      onClick={() => navigate('/messaging')}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-school-black text-sm">{msg.student}</p>
                          <span className="text-school-black/50 text-xs">{msg.time}</span>
                        </div>
                        <p className="text-school-black/70 text-sm truncate">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button onClick={() => navigate('/messaging')} variant="outline" className="w-full mt-3">
                Voir tous les messages
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard
