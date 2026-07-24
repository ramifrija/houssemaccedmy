import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { createGrade, deleteGrade, fetchAllGrades, fetchGradesForTeacher } from '@/lib/grades-api'
import { fetchClassStudents, fetchClasses, fetchCoursesForClass, fetchTeacherClasses } from '@/lib/classes-api'
import { Plus, Trash2, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

function SearchableSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder, 
  emptyText,
  disabled 
}: {
  value: string
  onValueChange: (val: string) => void
  options: { label: string; value: string }[]
  placeholder: string
  emptyText: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">
            {value
              ? options.find((opt) => opt.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const TeacherGradesPage = () => {
  const { user, userProfile } = useAuth()
  const isAdmin = userProfile?.role === 'admin'
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [subject, setSubject] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('20')
  const [term, setTerm] = useState('')
  const [observations, setObservations] = useState('')

  const numericClassId = classId ? Number(classId) : null

  const { data: adminClasses = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: fetchClasses,
    enabled: isAdmin,
  })

  const { data: teacherClasses = [] } = useQuery({
    queryKey: ['teacher-classes', user?.id],
    queryFn: () => fetchTeacherClasses(user!.id),
    enabled: !!user?.id && !isAdmin,
  })

  const classes = isAdmin
    ? adminClasses.map((c) => ({ id: c.id, name: c.name }))
    : teacherClasses

  const { data: classStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['class-students', numericClassId],
    queryFn: () => fetchClassStudents(numericClassId!),
    enabled: numericClassId != null && !Number.isNaN(numericClassId),
  })

  const { data: classCourses = [] } = useQuery({
    queryKey: ['class-courses', numericClassId, user?.id, isAdmin],
    queryFn: () =>
      fetchCoursesForClass(numericClassId!, isAdmin ? undefined : user!.id),
    enabled: numericClassId != null && !!user?.id,
  })

  const { data: teacherGrades = [], isLoading: loadingTeacherGrades } = useQuery({
    queryKey: ['teacher-grades', user?.id],
    queryFn: () => fetchGradesForTeacher(user!.id),
    enabled: !!user?.id && !isAdmin,
  })

  const { data: adminGrades = [], isLoading: loadingAdminGrades } = useQuery({
    queryKey: ['admin-grades'],
    queryFn: fetchAllGrades,
    enabled: isAdmin,
  })

  const grades = isAdmin ? adminGrades : teacherGrades
  const isLoading = isAdmin ? loadingAdminGrades : loadingTeacherGrades

  const handleClassChange = (value: string) => {
    setClassId(value)
    setStudentId('')
    setCourseId('')
    setSubject('')
  }

  const handleCourseChange = (value: string) => {
    setCourseId(value)
    const course = classCourses.find((c) => String(c.id) === value)
    if (course) setSubject(course.name)
  }

  const resetForm = () => {
    setClassId('')
    setStudentId('')
    setCourseId('')
    setSubject('')
    setScore('')
    setMaxScore('20')
    setTerm('')
    setObservations('')
  }

  const addGrade = useMutation({
    mutationFn: async () => {
      if (!user?.id || !classId || !studentId || !subject || !score) {
        throw new Error('Classe, élève, matière et note requis')
      }
      await createGrade({
        studentId,
        teacherId: user.id,
        courseId: courseId || undefined,
        subject,
        score: Number(score),
        maxScore: Number(maxScore) || 20,
        observations,
        term,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher-grades', user?.id] })
      await queryClient.invalidateQueries({ queryKey: ['admin-grades'] })
      resetForm()
      setIsModalOpen(false)
      toast({ title: 'Note enregistrée' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  const removeGrade = useMutation({
    mutationFn: deleteGrade,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher-grades', user?.id] })
      await queryClient.invalidateQueries({ queryKey: ['admin-grades'] })
      toast({ title: 'Note supprimée' })
    },
  })

  const [addingGradeForCourseId, setAddingGradeForCourseId] = useState<string | null>(null)
  const [inlineScore, setInlineScore] = useState('')
  const [inlineMaxScore, setInlineMaxScore] = useState('20')
  const [inlineTerm, setInlineTerm] = useState('')

  const addInlineGrade = useMutation({
    mutationFn: async (payload: { studentId: string, courseId: string, subject: string, score: number, term: string, maxScore: number }) => {
      if (!user?.id) throw new Error('Utilisateur non connecté')
      await createGrade({
        studentId: payload.studentId,
        teacherId: user.id,
        courseId: payload.courseId,
        subject: payload.subject,
        score: payload.score,
        maxScore: payload.maxScore || 20,
        term: payload.term,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teacher-grades', user?.id] })
      await queryClient.invalidateQueries({ queryKey: ['admin-grades'] })
      setAddingGradeForCourseId(null)
      setInlineScore('')
      setInlineTerm('')
      toast({ title: 'Note enregistrée' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  // Drill-down states for "Notes attribuées"
  const [listClassId, setListClassId] = useState<number | null>(null)
  const [selectedStudentForGrades, setSelectedStudentForGrades] = useState<{id: string, name: string} | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSetListClassId = (id: number | null) => {
    setListClassId(id)
    setSearchQuery('')
  }

  const { data: listClassStudents = [], isLoading: loadingListStudents } = useQuery({
    queryKey: ['class-students', listClassId],
    queryFn: () => fetchClassStudents(listClassId!),
    enabled: listClassId != null,
  })

  const { data: listClassCourses = [] } = useQuery({
    queryKey: ['list-class-courses', listClassId, user?.id, isAdmin],
    queryFn: () => fetchCoursesForClass(listClassId!, isAdmin ? undefined : user!.id),
    enabled: listClassId != null && !!user?.id,
  })

  // Filter existing grades array for the selected student
  const studentGrades = selectedStudentForGrades
    ? grades.filter(g => g.studentId === selectedStudentForGrades.id)
    : []

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredStudents = listClassStudents.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader 
        title="Notes & Évaluations" 
        description="Attribuer des notes à vos élèves" 
        actions={
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-school-yellow text-school-black">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter une note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Classe</Label>
                    <SearchableSelect
                      value={classId}
                      onValueChange={handleClassChange}
                      options={classes.map(c => ({ label: c.name, value: String(c.id) }))}
                      placeholder="Choisir une classe"
                      emptyText="Aucune classe trouvée."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Élève</Label>
                    <SearchableSelect
                      value={studentId}
                      onValueChange={setStudentId}
                      disabled={!classId || loadingStudents}
                      options={classStudents.map(s => ({ label: s.name, value: s.userId }))}
                      placeholder={
                        !classId
                          ? "Sélectionnez d'abord une classe"
                          : loadingStudents
                            ? "Chargement..."
                            : classStudents.length === 0
                              ? "Aucun élève dans cette classe"
                              : "Choisir un élève"
                      }
                      emptyText="Aucun élève trouvé."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cours (optionnel)</Label>
                    <SearchableSelect
                      value={courseId}
                      onValueChange={handleCourseChange}
                      disabled={!classId}
                      options={classCourses.map(c => ({ label: c.name, value: String(c.id) }))}
                      placeholder="Lier à un cours de la classe"
                      emptyText="Aucun cours trouvé."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Matière</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Mathématiques" />
                  </div>
                  <div className="space-y-2">
                    <Label>Trimestre</Label>
                    <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Ex: T1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Input type="number" step="0.25" value={score} onChange={(e) => setScore(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sur</Label>
                    <Input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observations</Label>
                  <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} />
                </div>
                <Button
                  className="w-full bg-school-yellow text-school-black mt-4"
                  disabled={addGrade.isPending || !classId || !studentId}
                  onClick={() => addGrade.mutate()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Enregistrer la note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="p-4 space-y-6">
        <Card className="border-school-yellow/20">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-lg">Notes attribuées</CardTitle>
              {listClassId && (
                <Button variant="outline" size="sm" onClick={() => handleSetListClassId(null)}>
                  Retour aux classes
                </Button>
              )}
            </div>
            <div className="w-full sm:w-72">
              <Input 
                placeholder={listClassId === null ? "Rechercher une classe..." : "Rechercher un élève..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {listClassId === null ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredClasses.map((cls) => (
                  <Button
                    key={cls.id}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center text-school-black border-school-yellow/30 hover:border-school-yellow hover:bg-school-yellow/10 transition-colors"
                    onClick={() => handleSetListClassId(cls.id)}
                  >
                    <span className="font-semibold text-lg">{cls.name}</span>
                    <span className="text-sm text-school-black/60">
                      {(cls as any).studentCount !== undefined ? `${(cls as any).studentCount} élève(s)` : ''}
                    </span>
                  </Button>
                ))}
                {filteredClasses.length === 0 && (
                  <p className="text-sm text-school-black/50 col-span-full text-center py-6">Aucune classe trouvée</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-4 text-school-black">
                  Élèves de la classe {classes.find(c => c.id === listClassId)?.name}
                </h3>
                {loadingListStudents ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Chargement des élèves...</p>
                ) : filteredStudents.length === 0 ? (
                  <p className="text-sm text-center py-6 text-school-black/50">Aucun élève trouvé.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredStudents.map((student) => (
                      <Button
                        key={student.userId}
                        variant="outline"
                        className="justify-start text-left h-auto py-3"
                        onClick={() => setSelectedStudentForGrades({ id: student.userId, name: student.name })}
                      >
                        {student.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog 
        open={selectedStudentForGrades !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedStudentForGrades(null)
            setAddingGradeForCourseId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notes de {selectedStudentForGrades?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {listClassCourses.length === 0 ? (
              <p className="text-sm text-center py-6 text-school-black/50">Aucun cours trouvé pour cette classe.</p>
            ) : (
              listClassCourses.map(course => {
                const courseNotes = studentGrades.filter(g => g.courseId === String(course.id) || g.subject === course.name)
                const cIdStr = String(course.id)
                
                return (
                  <div key={course.id} className="border border-school-yellow/30 rounded-md p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-school-black">{course.name}</h4>
                      {addingGradeForCourseId !== cIdStr && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-school-black hover:text-school-yellow hover:bg-school-yellow/10"
                          onClick={() => {
                            setAddingGradeForCourseId(cIdStr)
                            setInlineScore('')
                            setInlineTerm('')
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter une note
                        </Button>
                      )}
                    </div>

                    {courseNotes.length === 0 && addingGradeForCourseId !== cIdStr ? (
                      <p className="text-sm text-school-black/50">Pas de note pour ce cours.</p>
                    ) : null}

                    {courseNotes.length > 0 && (
                      <div className="space-y-2">
                        {courseNotes.map(note => (
                          <div key={note.id} className="flex flex-wrap items-center justify-between text-sm p-2 bg-school-gray-light rounded-md">
                            <div>
                              <span className="font-medium text-school-black">{note.score}/{note.maxScore}</span>
                              {note.term && <span className="text-school-black/70 ml-2">({note.term})</span>}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-school-black/50">{new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeGrade.mutate(note.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {addingGradeForCourseId === cIdStr && (
                      <div className="flex flex-wrap items-end gap-3 p-3 bg-school-yellow/5 rounded-md border border-school-yellow/20 mt-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Trimestre</Label>
                          <Input className="h-8 text-sm w-24" value={inlineTerm} onChange={(e) => setInlineTerm(e.target.value)} placeholder="Ex: T1" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Note</Label>
                          <Input className="h-8 text-sm w-20" type="number" step="0.25" value={inlineScore} onChange={(e) => setInlineScore(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sur</Label>
                          <Input className="h-8 text-sm w-20" type="number" value={inlineMaxScore} onChange={(e) => setInlineMaxScore(e.target.value)} />
                        </div>
                        <Button 
                          className="h-8 bg-school-yellow text-school-black" 
                          disabled={!inlineScore || addInlineGrade.isPending}
                          onClick={() => addInlineGrade.mutate({
                            studentId: selectedStudentForGrades!.id,
                            courseId: cIdStr,
                            subject: course.name,
                            score: Number(inlineScore),
                            term: inlineTerm,
                            maxScore: Number(inlineMaxScore) || 20
                          })}
                        >
                          Enregistrer
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-8 text-school-black/60"
                          onClick={() => setAddingGradeForCourseId(null)}
                        >
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Autres notes non liées aux cours affichés */}
            {(() => {
              const courseIds = new Set(listClassCourses.map(c => String(c.id)))
              const courseNames = new Set(listClassCourses.map(c => c.name))
              const otherNotes = studentGrades.filter(g => !courseIds.has(g.courseId!) && !courseNames.has(g.subject))
              
              if (otherNotes.length === 0) return null

              return (
                <div className="mt-6">
                  <h4 className="font-semibold text-school-black mb-3">Autres notes</h4>
                  <div className="space-y-2">
                    {otherNotes.map(note => (
                      <div key={note.id} className="flex flex-wrap items-center justify-between text-sm p-3 bg-school-gray-light rounded-md border border-gray-200">
                        <div>
                          <span className="font-semibold text-school-black">{note.subject}</span>
                          <span className="ml-3 font-medium text-school-black">{note.score}/{note.maxScore}</span>
                          {note.term && <span className="text-school-black/70 ml-2">({note.term})</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-school-black/50">{new Date(note.createdAt).toLocaleDateString('fr-FR')}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeGrade.mutate(note.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TeacherGradesPage
