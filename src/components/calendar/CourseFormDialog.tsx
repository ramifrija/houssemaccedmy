import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { fetchClassOptions, fetchTeacherOptions, fetchMatiereOptions, TeacherOption, ClassOption, MatiereOption } from '@/lib/users-api'

export interface CourseFormValues {
  name: string
  teacherId: string
  classId: number
  sessionDate: string
  startTime: string
  durationMinutes: number
  room: string
  notes?: string
  isRecurring: boolean
  recurrenceEndDate?: string
}

interface CourseFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (payload: CourseFormValues) => Promise<void> | void
  initialValues?: Partial<CourseFormValues> & { sessionId?: string; courseId?: string }
  defaultSessionDate?: string
}

const CourseFormDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  initialValues,
  defaultSessionDate,
}: CourseFormDialogProps) => {
  const [name, setName] = useState('')
  const [teacherId, setTeacherId] = useState('')
  const [classId, setClassId] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('08:00')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [room, setRoom] = useState('')
  const [notes, setNotes] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [classes, setClasses] = useState<ClassOption[]>([])
  const [matieres, setMatieres] = useState<MatiereOption[]>([])
  const [openMatiere, setOpenMatiere] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    Promise.all([fetchTeacherOptions(), fetchClassOptions(), fetchMatiereOptions()]).then(([t, c, m]) => {
      setTeachers(t)
      setClasses(c)
      setMatieres(m)
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setTeacherId('')
      setClassId('')
      setSessionDate(defaultSessionDate ?? new Date().toISOString().slice(0, 10))
      setStartTime('08:00')
      setDurationMinutes(60)
      setRoom('')
      setNotes('')
      setIsRecurring(false)
      setRecurrenceEndDate('')
      return
    }

    if (initialValues) {
      setName(initialValues.name ?? '')
      setTeacherId(initialValues.teacherId ?? '')
      setClassId(initialValues.classId ? String(initialValues.classId) : '')
      setSessionDate(initialValues.sessionDate ?? defaultSessionDate ?? new Date().toISOString().slice(0, 10))
      setStartTime(initialValues.startTime ?? '08:00')
      setDurationMinutes(initialValues.durationMinutes ?? 60)
      setRoom(initialValues.room ?? '')
      setNotes(initialValues.notes ?? '')
      setIsRecurring(initialValues.isRecurring ?? false)
      setRecurrenceEndDate(initialValues.recurrenceEndDate ?? '')
    } else {
      setSessionDate(defaultSessionDate ?? new Date().toISOString().slice(0, 10))
    }
  }, [isOpen, initialValues, defaultSessionDate])

  const handleCreate = async () => {
    if (!onSubmit || !name.trim() || !teacherId || !classId || !sessionDate || !startTime) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        teacherId,
        classId: Number(classId),
        sessionDate,
        startTime,
        durationMinutes: Number(durationMinutes) || 60,
        room,
        notes: notes || undefined,
        isRecurring,
        recurrenceEndDate: isRecurring ? recurrenceEndDate || undefined : undefined,
      })
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  const isEditing = Boolean(initialValues?.sessionId)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-school-yellow/20 max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-school-black">
            {isEditing ? 'Modifier le cours' : 'Créer un nouveau cours'}
          </DialogTitle>
          <DialogDescription>Planifier un cours avec professeur, classe et horaire</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="title" className="text-school-black">Matière</Label>
            <Popover open={openMatiere} onOpenChange={setOpenMatiere}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openMatiere}
                  className="justify-between border-school-yellow/30 focus:border-school-yellow font-normal"
                >
                  {name
                    ? matieres.find((matiere) => matiere.name === name)?.name || name
                    : "Sélectionner une matière..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 border-school-yellow/20" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher une matière..." />
                  <CommandList>
                    <CommandEmpty>Aucune matière trouvée.</CommandEmpty>
                    <CommandGroup>
                      {matieres.map((matiere) => (
                        <CommandItem
                          key={matiere.id}
                          value={matiere.name}
                          onSelect={(currentValue) => {
                            setName(currentValue)
                            setOpenMatiere(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              name === matiere.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {matiere.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-school-black">Professeur</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger className="border-school-yellow/30 focus:border-school-yellow">
                <SelectValue placeholder={teachers.length ? 'Sélectionner un professeur' : 'Aucun professeur disponible'} />
              </SelectTrigger>
              <SelectContent className="bg-white border-school-yellow/20 max-h-60">
                {teachers.map((t) => (
                  <SelectItem key={t.user_id} value={t.user_id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-school-black">Classe</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="border-school-yellow/30 focus:border-school-yellow">
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent className="bg-white border-school-yellow/20 max-h-60">
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="session-date" className="text-school-black">Date du cours</Label>
            <Input
              id="session-date"
              type="date"
              className="border-school-yellow/30 focus:border-school-yellow"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="time" className="text-school-black">Heure de début</Label>
              <Input
                id="time"
                type="time"
                className="border-school-yellow/30 focus:border-school-yellow"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-school-black">Durée (min)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                step={15}
                className="border-school-yellow/30 focus:border-school-yellow"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="room" className="text-school-black">Salle</Label>
            <Input
              id="room"
              placeholder="Ex: Salle 101"
              className="border-school-yellow/30 focus:border-school-yellow"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </div>

          {!isEditing && (
            <div className="flex items-center justify-between rounded-lg border border-school-yellow/20 p-3">
              <div>
                <Label className="text-school-black">Cours récurrent</Label>
                <p className="text-xs text-school-black/60">Répéter chaque semaine au même jour</p>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>
          )}

          {!isEditing && isRecurring && (
            <div>
              <Label htmlFor="recurrence-end" className="text-school-black">Fin de récurrence (optionnel)</Label>
              <Input
                id="recurrence-end"
                type="date"
                className="border-school-yellow/30 focus:border-school-yellow"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes" className="text-school-black">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplémentaires..."
              className="border-school-yellow/30 focus:border-school-yellow"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              className="flex-1 bg-school-yellow text-school-black hover:bg-school-yellow-dark"
              disabled={submitting || !name.trim() || !teacherId || !classId}
              onClick={handleCreate}
            >
              {submitting ? 'Enregistrement…' : isEditing ? 'Mettre à jour' : 'Créer le cours'}
            </Button>
            <Button
              variant="outline"
              className="border-school-yellow/50 text-school-black hover:bg-school-yellow/10"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CourseFormDialog
