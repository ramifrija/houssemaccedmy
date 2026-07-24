import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  fetchStudentsForDossier,
  paymentStatusLabel,
} from '@/lib/student-dossier-api'
import { Search, Users, ChevronRight } from 'lucide-react'

const StudentsDossiersPage = () => {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const [search, setSearch] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')

  const { data: students = [], isLoading, isError, error } = useQuery({
    queryKey: ['student-dossiers', user?.id, isAdmin],
    queryFn: () => fetchStudentsForDossier(isAdmin ? undefined : user!.id, isAdmin),
    enabled: !!user?.id,
  })

  if (isError) {
    console.error("Error fetching students:", error);
  }

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>()
    students.forEach((s) => {
      if (s.className) classes.add(s.className)
    })
    return Array.from(classes).sort()
  }, [students])

  const filtered = useMemo(() => {
    let result = students
    
    if (selectedClass !== 'all') {
      result = result.filter(s => s.className === selectedClass)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.className?.toLowerCase().includes(q)
      )
    }
    
    return result
  }, [students, search, selectedClass])

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title="Fiches Élèves"
        description={isAdmin ? 'Dossiers complets de tous les élèves' : 'Dossiers de vos élèves'}
      />

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-school-black/40" />
            <Input
              className="pl-9"
              placeholder="Rechercher par nom, email ou classe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {isAdmin && uniqueClasses.length > 0 && (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[220px] bg-white border-school-yellow/30">
                <SelectValue placeholder="Toutes les classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les classes</SelectItem>
                {uniqueClasses.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <Card className="border-school-yellow/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {filtered.length} élève{filtered.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-center py-8 text-school-black/50">Chargement...</p>
            ) : isError ? (
              <p className="text-sm text-center py-8 text-red-500">
                Erreur: {error instanceof Error ? error.message : JSON.stringify(error)}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-center py-8 text-school-black/50">Aucun élève trouvé</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((student) => (
                  <button
                    key={student.userId}
                    type="button"
                    onClick={() => navigate(`/students/${student.userId}`)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10 hover:bg-school-yellow/5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-school-black truncate">{student.name}</p>
                      <p className="text-xs text-school-black/60">
                        {student.className ?? 'Sans classe'}
                        {student.email ? ` · ${student.email}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {isAdmin && student.currentPaymentStatus && (
                        <Badge
                          variant="outline"
                          className={
                            student.currentPaymentStatus === 'paid'
                              ? 'border-green-300 text-green-700'
                              : student.currentPaymentStatus === 'partial'
                                ? 'border-amber-300 text-amber-700'
                                : 'border-red-300 text-red-700'
                          }
                        >
                          {paymentStatusLabel(student.currentPaymentStatus)}
                        </Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-school-black/40" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentsDossiersPage
