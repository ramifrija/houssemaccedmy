import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { fetchTeacherClassStudents } from '@/lib/classes-api'
import { Users } from 'lucide-react'

const TeacherStudentsPage = () => {
  const { user } = useAuth()

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['teacher-class-students', user?.id],
    queryFn: () => fetchTeacherClassStudents(user!.id),
    enabled: !!user?.id,
  })

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title="Mes Élèves"
        description="Élèves des classes où vous enseignez"
      />

      <div className="p-4">
        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Liste des élèves ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-center py-8 text-school-black/50">Chargement...</p>
            ) : students.length === 0 ? (
              <p className="text-sm text-center py-8 text-school-black/50">
                Aucun élève trouvé pour vos cours
              </p>
            ) : (
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.userId}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                  >
                    <div>
                      <p className="font-medium text-school-black">{student.name}</p>
                      {student.email && (
                        <p className="text-xs text-school-black/60">{student.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeacherStudentsPage
