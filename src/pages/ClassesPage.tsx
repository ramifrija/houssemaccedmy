import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  assignStudentToClass,
  createClass,
  deleteClass,
  fetchClassStudents,
  fetchClasses,
  fetchStudentsWithoutClass,
  removeStudentFromClass,
  updateClass,
} from '@/lib/classes-api'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

const ClassesPage = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [newClassName, setNewClassName] = useState('')
  const [editClassId, setEditClassId] = useState<number | null>(null)
  const [editClassName, setEditClassName] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
  const [studentToAdd, setStudentToAdd] = useState('')

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['admin-classes'],
    queryFn: fetchClasses,
  })

  const { data: classStudents = [] } = useQuery({
    queryKey: ['class-students', selectedClassId],
    queryFn: () => fetchClassStudents(selectedClassId!),
    enabled: selectedClassId != null,
  })

  const { data: unassignedStudents = [] } = useQuery({
    queryKey: ['unassigned-students'],
    queryFn: fetchStudentsWithoutClass,
    enabled: selectedClassId != null,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-classes'] })
    queryClient.invalidateQueries({ queryKey: ['class-students', selectedClassId] })
    queryClient.invalidateQueries({ queryKey: ['unassigned-students'] })
  }

  const addClass = useMutation({
    mutationFn: () => createClass(newClassName),
    onSuccess: () => {
      setNewClassName('')
      invalidate()
      toast({ title: 'Classe créée' })
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Erreur', description: e.message }),
  })

  const saveClass = useMutation({
    mutationFn: () => updateClass(editClassId!, editClassName),
    onSuccess: () => {
      setEditClassId(null)
      invalidate()
      toast({ title: 'Classe mise à jour' })
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Erreur', description: e.message }),
  })

  const removeClass = useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      if (selectedClassId === editClassId) setSelectedClassId(null)
      invalidate()
      toast({ title: 'Classe supprimée' })
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Erreur', description: e.message }),
  })

  const addStudent = useMutation({
    mutationFn: () => assignStudentToClass(studentToAdd, selectedClassId!),
    onSuccess: () => {
      setStudentToAdd('')
      invalidate()
      toast({ title: 'Élève affecté' })
    },
    onError: (e: Error) => toast({ variant: 'destructive', title: 'Erreur', description: e.message }),
  })

  const removeStudent = useMutation({
    mutationFn: (studentId: string) => removeStudentFromClass(studentId, selectedClassId!),
    onSuccess: invalidate,
  })

  return (
    <div className="min-h-screen bg-school-gray-light">
      <PageHeader title="Gestion des Classes" description="Créer des classes et affecter les élèves" />

      <div className="p-4 space-y-6">
        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-lg">Nouvelle classe</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Input
              placeholder="Nom de la classe (ex: 7e B)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="max-w-sm"
            />
            <Button
              className="bg-school-yellow text-school-black"
              disabled={!newClassName.trim() || addClass.isPending}
              onClick={() => addClass.mutate()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </CardContent>
        </Card>

        <Card className="border-school-yellow/20">
          <CardHeader>
            <CardTitle className="text-lg">Classes ({classes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-center py-6 text-school-black/50">Chargement...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Élèves</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((cls) => (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{cls.name}</TableCell>
                      <TableCell>{cls.studentCount}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditClassId(cls.id)
                                setEditClassName(cls.name)
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Renommer la classe</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Nom</Label>
                                <Input value={editClassName} onChange={(e) => setEditClassName(e.target.value)} />
                              </div>
                              <Button onClick={() => saveClass.mutate()} className="w-full">
                                Enregistrer
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClassId(cls.id)}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Élèves
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClass.mutate(cls.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedClassId != null && (
          <Card className="border-school-yellow/20">
            <CardHeader>
              <CardTitle className="text-lg">
                Élèves — {classes.find((c) => c.id === selectedClassId)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Ajouter un élève</Label>
                  <Select value={studentToAdd} onValueChange={setStudentToAdd}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un élève sans classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedStudents.map((s) => (
                        <SelectItem key={s.userId} value={s.userId}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={!studentToAdd || addStudent.isPending}
                  onClick={() => addStudent.mutate()}
                >
                  Ajouter
                </Button>
              </div>

              {classStudents.length === 0 ? (
                <p className="text-sm text-school-black/50 text-center py-4">Aucun élève dans cette classe</p>
              ) : (
                <div className="space-y-2">
                  {classStudents.map((student) => (
                    <div
                      key={student.userId}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{student.name}</p>
                        {student.email && <p className="text-xs text-school-black/60">{student.email}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent.mutate(student.userId)}
                      >
                        Retirer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ClassesPage
