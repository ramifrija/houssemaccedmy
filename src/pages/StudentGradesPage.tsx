import { useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { fetchGradesForStudent } from '@/lib/grades-api'
import { fetchStudentDossierProfile } from '@/lib/student-dossier-api'
import { fetchCoursesForClass } from '@/lib/classes-api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BookOpen, GraduationCap } from 'lucide-react'

const StudentGradesPage = () => {
  const { user } = useAuth()

  const { data: grades = [], isLoading: loadingGrades } = useQuery({
    queryKey: ['student-grades', user?.id],
    queryFn: () => fetchGradesForStudent(user!.id),
    enabled: !!user?.id,
  })

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['student-profile', user?.id],
    queryFn: () => fetchStudentDossierProfile(user!.id),
    enabled: !!user?.id,
  })

  const classId = profile?.classId

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['class-courses', classId],
    queryFn: () => fetchCoursesForClass(classId!),
    enabled: classId != null,
  })

  const isLoading = loadingGrades || loadingProfile || loadingCourses

  const terms = useMemo(() => {
    const termSet = new Set<string>()
    for (const grade of grades) {
      termSet.add(grade.term || 'Autres / Non défini')
    }
    
    // S'il n'y a aucune note mais qu'on a des cours, on affiche un trimestre par défaut
    if (termSet.size === 0 && courses.length > 0) {
       termSet.add('Trimestre 1')
    }
    
    return Array.from(termSet).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [grades, courses])

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader title="Mes Notes" description="Vos résultats par matière" />

      <div className="p-4 space-y-8 max-w-5xl mx-auto">
        {isLoading ? (
          <p className="text-sm text-center text-school-black/50 py-8">Chargement...</p>
        ) : terms.length === 0 && courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-school-black/20 mx-auto mb-4" />
              <p className="text-school-black/60">Vous n'êtes inscrit à aucun cours pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          terms.map(term => {
            // Find grades for this term
            const termGrades = grades.filter(g => (g.term || 'Autres / Non défini') === term)
            
            // Calculate term average (ramené sur 20)
            let totalScore = 0
            let totalMax = 0
            termGrades.forEach(g => {
               const normalized = (g.score / g.maxScore) * 20
               totalScore += normalized
               totalMax += 20
            })
            const average = totalMax > 0 ? (totalScore / (totalMax / 20)).toFixed(2) : null

            return (
              <Card key={term} className="border-school-yellow/20 shadow-sm overflow-hidden">
                <div className="bg-school-yellow/10 border-b border-school-yellow/20 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-school-black flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-school-yellow-dark" />
                    {term}
                  </h2>
                  {average && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-school-yellow/30 shadow-sm">
                      <GraduationCap className="w-4 h-4 text-school-yellow-dark" />
                      <span className="font-semibold text-school-black text-sm">Moyenne :</span>
                      <span className="font-bold text-school-yellow-dark">{average} / 20</span>
                    </div>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[45%] font-semibold text-slate-700">Matière</TableHead>
                        <TableHead className="w-[30%] font-semibold text-slate-700 text-center">Note</TableHead>
                        <TableHead className="w-[25%] font-semibold text-slate-700 text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map(course => {
                        // Match grade by courseId or subject name
                        const grade = termGrades.find(g => g.courseId === String(course.id) || g.subject === course.name)
                        
                        return (
                          <TableRow key={course.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium text-school-black whitespace-nowrap text-sm sm:text-base">
                              {course.name}
                            </TableCell>
                            
                            <TableCell className="text-center">
                              {grade ? (
                                <Badge variant="outline" className={`border ${grade.score >= (grade.maxScore * 0.75) ? 'bg-green-100 text-green-800 border-green-200' : grade.score < (grade.maxScore * 0.5) ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                                  {grade.score} / {grade.maxScore}
                                </Badge>
                              ) : (
                                <span className="text-xs italic text-slate-400">Non noté</span>
                              )}
                            </TableCell>
                            
                            <TableCell className="text-sm text-slate-500 text-right whitespace-nowrap">
                              {grade ? new Date(grade.createdAt).toLocaleDateString('fr-FR') : '-'}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

export default StudentGradesPage
