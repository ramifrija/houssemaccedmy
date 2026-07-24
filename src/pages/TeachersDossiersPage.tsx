import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { fetchTeachersForDossier } from '@/lib/teacher-dossier-api'
import { Search, GraduationCap, ChevronRight } from 'lucide-react'

const TeachersDossiersPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teacher-dossiers'],
    queryFn: fetchTeachersForDossier,
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teachers
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q)
    )
  }, [teachers, search])

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader
        title="Fiches Professeurs"
        description="Suivi des cours et séances par professeur"
      />

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-school-black/40" />
          <Input
            className="pl-9"
            placeholder="Rechercher un professeur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="border-school-yellow/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              {filtered.length} professeur{filtered.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-center py-8 text-school-black/50">Chargement...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-center py-8 text-school-black/50">Aucun professeur</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((teacher) => (
                  <button
                    key={teacher.userId}
                    type="button"
                    onClick={() => navigate(`/teachers/${teacher.userId}`)}
                    className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-school-yellow/10 hover:bg-school-yellow/5 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-school-black truncate">{teacher.name}</p>
                      <p className="text-xs text-school-black/60">{teacher.email ?? '—'}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline">{teacher.sessionsThisMonth} séances ce mois</Badge>
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

export default TeachersDossiersPage
