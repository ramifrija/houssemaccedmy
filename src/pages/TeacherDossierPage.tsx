import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import {
  fetchTeacherCourses,
  fetchTeacherDossierProfile,
  fetchTeacherSessions,
  fetchTeacherStats,
} from '@/lib/teacher-dossier-api'
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react'

const TeacherDossierPage = () => {
  const { teacherId } = useParams<{ teacherId: string }>()
  const navigate = useNavigate()

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['teacher-dossier-profile', teacherId],
    queryFn: () => fetchTeacherDossierProfile(teacherId!),
    enabled: !!teacherId,
  })

  const { data: stats } = useQuery({
    queryKey: ['teacher-dossier-stats', teacherId],
    queryFn: () => fetchTeacherStats(teacherId!),
    enabled: !!teacherId,
  })

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['teacher-dossier-courses', teacherId],
    queryFn: () => fetchTeacherCourses(teacherId!),
    enabled: !!teacherId,
  })

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['teacher-dossier-sessions', teacherId],
    queryFn: () => fetchTeacherSessions(teacherId!),
    enabled: !!teacherId,
  })

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-school-gray-light flex items-center justify-center">
        <p className="text-school-black/50">Chargement...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-school-gray-light flex flex-col items-center justify-center gap-4">
        <p className="text-school-black/60">Professeur introuvable</p>
        <Button variant="outline" onClick={() => navigate('/teachers')}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title={profile.name}
        description="Fiche professeur"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/teachers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        }
      />

      <div className="p-4">
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-school-yellow/10">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="courses">Cours</TabsTrigger>
            <TabsTrigger value="sessions">Séances</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Cours" value={String(stats?.courseCount ?? 0)} />
              <StatCard label="Classes" value={String(stats?.classCount ?? 0)} />
              <StatCard label="Séances totales" value={String(stats?.totalSessions ?? 0)} />
              <StatCard label="Ce mois" value={String(stats?.sessionsThisMonth ?? 0)} />
            </div>
            <Card className="border-school-yellow/20">
              <CardContent className="p-4 space-y-2 text-sm">
                <p><span className="text-school-black/60">Email :</span> {profile.email ?? '—'}</p>
                <p>
                  <span className="text-school-black/60">Membre depuis :</span>{' '}
                  {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card className="border-school-yellow/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Cours assignés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCourses ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
                ) : courses.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucun cours</p>
                ) : (
                  <div className="space-y-2">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                      >
                        <p className="font-medium text-sm">{course.name}</p>
                        <Badge variant="outline">{course.className}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="border-school-yellow/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Historique des séances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucune séance</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                      >
                        <div>
                          <p className="font-medium text-sm">{session.courseName}</p>
                          <p className="text-xs text-school-black/60">
                            {session.className} · {new Date(session.sessionDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className="text-sm text-school-black/70">
                          {session.startTime} – {session.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-school-yellow/20">
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold text-school-black">{value}</p>
        <p className="text-xs text-school-black/60 mt-1">{label}</p>
      </CardContent>
    </Card>
  )
}

export default TeacherDossierPage
