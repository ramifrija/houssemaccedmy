import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { fetchGradesForStudent } from '@/lib/grades-api'
import { BookOpen } from 'lucide-react'

const StudentGradesPage = () => {
  const { user } = useAuth()

  const { data: grades = [], isLoading } = useQuery({
    queryKey: ['student-grades', user?.id],
    queryFn: () => fetchGradesForStudent(user!.id),
    enabled: !!user?.id,
  })

  const bySubject = useMemo(() => {
    const map = new Map<string, typeof grades>()
    for (const grade of grades) {
      const key = grade.subject
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(grade)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'fr'))
  }, [grades])

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader title="Mes Notes" description="Vos résultats par matière" />

      <div className="p-4 space-y-6">
        {isLoading ? (
          <p className="text-sm text-center text-school-black/50 py-8">Chargement...</p>
        ) : bySubject.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-school-black/20 mx-auto mb-4" />
              <p className="text-school-black/60">Aucune note publiée pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          bySubject.map(([subject, subjectGrades]) => (
            <Card key={subject} className="border-school-yellow/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-school-black">{subject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10"
                  >
                    <div>
                      <p className="font-medium text-school-black text-sm">
                        {grade.score} / {grade.maxScore}
                      </p>
                      {grade.observations && (
                        <p className="text-xs text-school-black/60 mt-1">{grade.observations}</p>
                      )}
                      <p className="text-xs text-school-black/40 mt-1">
                        {grade.teacherName}
                        {grade.term ? ` — ${grade.term}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(grade.createdAt).toLocaleDateString('fr-FR')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default StudentGradesPage
