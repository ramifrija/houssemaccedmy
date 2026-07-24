import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarDays, Download, Check, X, Clock, Loader2, UserCheck, BookOpen, AlertTriangle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { formatLocalDate } from "@/lib/courses-api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/components/auth/AuthProvider"
import { useToast } from "@/hooks/use-toast"

interface CourseOption {
  id: string
  name: string
  classId: number
  className: string
}

interface StudentAttendance {
  studentId: string
  fullName: string
  email: string
  status: 'present' | 'absent' | 'late'
  markedAt: string | null
}

const Attendance = () => {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isAdmin = userProfile?.role === 'admin'

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedCourseKey, setSelectedCourseKey] = useState<string>("")

  // Helper pour obtenir ou créer une session d'assiduité (avec fallback RPC security definer)
  const getOrCreateSessionId = async (classId: number, subject: string, dateStr: string): Promise<string | null> => {
    if (!user?.id) return null

    // 1. Chercher si la session existe déjà
    const { data: existing } = await supabase
      .from('attendance_sessions')
      .select('id')
      .eq('class_id', classId)
      .eq('subject', subject)
      .eq('session_date', dateStr)
      .limit(1)

    if (existing && existing.length > 0) {
      return existing[0].id
    }

    // 2. Essayer création directe
    const { data: inserted, error: insertErr } = await supabase
      .from('attendance_sessions')
      .insert({
        class_id: classId,
        teacher_id: user.id,
        subject: subject,
        session_date: dateStr,
        start_time: '08:00',
        end_time: '10:00',
        status: 'scheduled',
      })
      .select('id')
      .single()

    if (!insertErr && inserted) {
      return inserted.id
    }

    // 3. Fallback via la fonction RPC create_attendance_session (SECURITY DEFINER)
    const { data: rpcSessionId, error: rpcErr } = await supabase.rpc('create_attendance_session', {
      p_class_id: classId,
      p_subject: subject,
      p_date: dateStr,
      p_start_time: '08:00',
      p_end_time: '10:00',
    })

    if (!rpcErr && rpcSessionId) {
      return rpcSessionId as string
    }

    return null
  }

  // 1. Charger la liste des cours / classes accessibles pour l'utilisateur
  const { data: courses = [], isLoading: loadingCourses, error: coursesError } = useQuery({
    queryKey: ['attendance-course-options', user?.id, isAdmin],
    queryFn: async (): Promise<CourseOption[]> => {
      if (!user?.id) return []

      const options: CourseOption[] = []

      // A) Récupérer depuis la table `courses`
      let coursesQuery = supabase
        .from('courses')
        .select('id, name, class_id, teacher_id, classes(id, name)')

      if (!isAdmin) {
        coursesQuery = coursesQuery.eq('teacher_id', user.id)
      }

      const { data: coursesData } = await coursesQuery

      if (coursesData && coursesData.length > 0) {
        for (const c of coursesData) {
          const className = (c.classes as any)?.name ?? `Classe ${c.class_id}`
          options.push({
            id: c.id,
            name: c.name,
            classId: c.class_id,
            className: className,
          })
        }
      }

      // B) Si aucune matière explicite trouvée, vérifier `teacher_classes`
      if (options.length === 0 && !isAdmin) {
        const { data: teacherClasses } = await supabase
          .from('teacher_classes')
          .select('class_id, classes(id, name)')
          .eq('teacher_id', user.id)

        if (teacherClasses && teacherClasses.length > 0) {
          for (const tc of teacherClasses) {
            const className = (tc.classes as any)?.name ?? `Classe ${tc.class_id}`
            options.push({
              id: `tc-${tc.class_id}`,
              name: `Cours — ${className}`,
              classId: tc.class_id,
              className: className,
            })
          }
        }
      }

      // C) Si Admin et aucun cours, récupérer toutes les classes
      if (options.length === 0 && isAdmin) {
        const { data: allClasses } = await supabase.from('classes').select('id, name')
        if (allClasses) {
          for (const cl of allClasses) {
            options.push({
              id: `class-${cl.id}`,
              name: `Général — ${cl.name}`,
              classId: cl.id,
              className: cl.name,
            })
          }
        }
      }

      return options
    },
    enabled: !!user?.id,
  })

  const uniqueClasses = Array.from(
    new Map(courses.map((c) => [c.classId, { id: String(c.classId), name: c.className }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name, 'fr'))

  const dateStrForSchedule = formatLocalDate(selectedDate)
  const filteredCoursesForClass = selectedClassId 
    ? courses.filter(c => String(c.classId) === selectedClassId)
    : []
  
  const courseIdsForClass = filteredCoursesForClass.map(c => c.id).filter(id => id.includes('-') && !id.startsWith('tc-') && !id.startsWith('class-'))

  const { data: scheduledCourseIds = [], isLoading: loadingSchedule } = useQuery({
    queryKey: ['scheduled-courses-for-date', selectedClassId, dateStrForSchedule],
    queryFn: async () => {
      if (!selectedClassId) return []
      
      const validIds = new Set<string>()

      if (courseIdsForClass.length > 0) {
        // Fetch from course_sessions
        const { data: courseSessions } = await supabase
          .from('course_sessions')
          .select('course_id')
          .eq('session_date', dateStrForSchedule)
          .in('course_id', courseIdsForClass)

        if (courseSessions) {
          courseSessions.forEach(s => validIds.add(s.course_id))
        }
      }

      return Array.from(validIds)
    },
    enabled: !!selectedClassId
  })

  // Final strict filter:
  const filteredCourses = filteredCoursesForClass.filter(c => scheduledCourseIds.includes(c.id))

  const selectedCourse = courses.find((c) => `${c.id}_${c.classId}` === selectedCourseKey)

  // 2. Charger les étudiants de la classe + la session de présence + les enregistrements
  const {
    data: attendanceData,
    isLoading: loadingAttendance,
    error: attendanceError,
  } = useQuery({
    queryKey: ['attendance-sheet', selectedCourseKey, formatLocalDate(selectedDate)],
    queryFn: async () => {
      if (!selectedCourse || !user?.id) return { sessionId: null, students: [] }

      const dateStr = formatLocalDate(selectedDate)

      // A) Récupérer les élèves inscrits dans cette classe
      const { data: enrollments, error: enrollErr } = await supabase
        .from('student_enrollments')
        .select('student_id')
        .eq('class_id', selectedCourse.classId)

      if (enrollErr) throw enrollErr

      const studentIds = (enrollments ?? []).map((e) => e.student_id)

      if (studentIds.length === 0) {
        return { sessionId: null, students: [] }
      }

      // B) Récupérer les détails des profils des élèves
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .in('user_id', studentIds)

      if (profErr) throw profErr

      const profilesMap = new Map(
        (profiles ?? []).map((p) => [
          p.user_id,
          {
            fullName: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email || 'Élève',
            email: p.email ?? '',
          },
        ])
      )

      // C) Obtenir ou créer la session d'assiduité dans `attendance_sessions`
      const sessionId = await getOrCreateSessionId(selectedCourse.classId, selectedCourse.name, dateStr)

      // D) Récupérer les enregistrements de présence si une session existe
      const recordsMap = new Map<string, { status: 'present' | 'absent' | 'late'; markedAt: string | null }>()

      if (sessionId) {
        const { data: records } = await supabase
          .from('attendance_records')
          .select('student_id, status, marked_at')
          .eq('session_id', sessionId)

        if (records) {
          for (const r of records) {
            recordsMap.set(r.student_id, {
              status: (r.status as 'present' | 'absent' | 'late') ?? 'absent',
              markedAt: r.marked_at ?? null,
            })
          }
        }
      }

      // E) Combiner les élèves avec leur statut
      const students: StudentAttendance[] = studentIds.map((sId) => {
        const profile = profilesMap.get(sId) ?? { fullName: 'Élève', email: '' }
        const rec = recordsMap.get(sId)
        return {
          studentId: sId,
          fullName: profile.fullName,
          email: profile.email,
          status: rec?.status ?? 'absent',
          markedAt: rec?.markedAt ?? null,
        }
      })

      students.sort((a, b) => a.fullName.localeCompare(b.fullName, 'fr'))

      return { sessionId, students }
    },
    enabled: !!selectedCourse && !!user?.id,
  })

  // 3. Mutation pour marquer une présence
  const markMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: 'present' | 'absent' | 'late' }) => {
      if (!selectedCourse || !user?.id) return

      const dateStr = formatLocalDate(selectedDate)

      // Assurer l'existence de la session
      let targetSessionId = attendanceData?.sessionId

      if (!targetSessionId) {
        targetSessionId = await getOrCreateSessionId(selectedCourse.classId, selectedCourse.name, dateStr)
      }

      if (!targetSessionId) {
        throw new Error("Impossible de créer la session de présence. Veuillez exécuter le script SQL 024.")
      }

      // Tenter la RPC d'abord
      const { error: rpcErr } = await supabase.rpc('mark_attendance', {
        p_session_id: targetSessionId,
        p_student_id: studentId,
        p_status: status,
      })

      if (rpcErr) {
        // Fallback upsert direct si la RPC n'est pas dispo
        const { error: upsertErr } = await supabase
          .from('attendance_records')
          .upsert(
            {
              session_id: targetSessionId,
              student_id: studentId,
              status: status,
              marked_by: user.id,
              marked_at: new Date().toISOString(),
            },
            { onConflict: 'session_id,student_id' }
          )

        if (upsertErr) throw upsertErr
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attendance-sheet', selectedCourseKey, formatLocalDate(selectedDate)],
      })
    },
    onError: (err: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: err.message })
    },
  })

  const studentsList = attendanceData?.students ?? []

  const stats = {
    total: studentsList.length,
    present: studentsList.filter((s) => s.status === 'present').length,
    absent: studentsList.filter((s) => s.status === 'absent').length,
    late: studentsList.filter((s) => s.status === 'late').length,
    rate:
      studentsList.length > 0
        ? Math.round((studentsList.filter((s) => s.status === 'present').length / studentsList.length) * 100)
        : 0,
  }

  const exportCSV = () => {
    if (studentsList.length === 0) return
    const rows = studentsList.map((s) => ({
      Élève: s.fullName,
      Email: s.email,
      Statut: s.status,
      "Dernier marquage": s.markedAt ? new Date(s.markedAt).toLocaleString('fr-FR') : '—',
    }))
    const header = Object.keys(rows[0])
    const csv = [
      header.join(','),
      ...rows.map((r) => header.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `presences_${selectedCourse?.className}_${formatLocalDate(selectedDate)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-school-gray-light">
      <main className="flex-1">
        <PageHeader
          title="Gestion des Présences"
          description="Sélectionnez un cours pour faire l'appel et marquer la présence des élèves"
          actions={
            <Button
              className="bg-school-yellow text-school-black hover:bg-school-yellow-dark"
              onClick={exportCSV}
              disabled={studentsList.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          }
        />

        <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
          {/* Statistiques si un cours est sélectionné */}
          {selectedCourseKey && studentsList.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Élèves', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: <UserCheck className="w-5 h-5 text-blue-600" /> },
                { label: 'Présents', value: stats.present, color: 'text-green-600', bg: 'bg-green-50', icon: <Check className="w-5 h-5 text-green-600" /> },
                { label: 'Absents', value: stats.absent, color: 'text-red-600', bg: 'bg-red-50', icon: <X className="w-5 h-5 text-red-600" /> },
                { label: 'Taux Présence', value: `${stats.rate}%`, color: 'text-school-black', bg: 'bg-school-yellow/20', icon: <CalendarDays className="w-5 h-5 text-school-black" /> },
              ].map((stat) => (
                <Card key={stat.label} className="border-school-yellow/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-school-black/60">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Card Sélection de cours */}
          <Card className="border-school-yellow/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-school-black text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Sélectionner un Cours
              </CardTitle>
              <CardDescription>
                Choisissez la classe, le cours et la date pour lesquels vous souhaitez marquer les présences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCourses ? (
                <div className="flex items-center gap-2 text-sm text-school-black/60">
                  <Loader2 className="w-4 h-4 animate-spin text-school-yellow" />
                  Chargement de vos cours...
                </div>
              ) : coursesError ? (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Erreur : {(coursesError as Error).message}
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-6 text-school-black/50">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Aucun cours assigné</p>
                  <p className="text-xs mt-1 text-school-black/40">
                    Veuillez contacter l'administrateur pour vous inscrire à des cours ou des classes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-school-black">1. Classe</label>
                    <Select 
                      value={selectedClassId} 
                      onValueChange={(val) => {
                        setSelectedClassId(val)
                        setSelectedCourseKey("") // Reset course when class changes
                      }}
                    >
                      <SelectTrigger className="border-school-yellow/30 focus:border-school-yellow">
                        <SelectValue placeholder="— Sélectionner une classe —" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {uniqueClasses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-school-black">2. Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-left font-normal border-school-yellow/30 focus:border-school-yellow"
                        >
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {selectedDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-school-yellow/20" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          disabled={(date) => date > new Date()}
                          onSelect={(d) => {
                            if (d) setSelectedDate(d)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-school-black">3. Cours</label>
                    <Select 
                      value={selectedCourseKey} 
                      onValueChange={setSelectedCourseKey}
                      disabled={!selectedClassId || loadingSchedule || filteredCourses.length === 0}
                    >
                      <SelectTrigger className="border-school-yellow/30 focus:border-school-yellow">
                        <SelectValue placeholder={
                          !selectedClassId 
                            ? "Sélectionnez d'abord une classe" 
                            : loadingSchedule 
                              ? "Recherche de cours..." 
                              : filteredCourses.length === 0 
                                ? "Aucun cours prévu à cette date" 
                                : "— Sélectionner un cours —"
                        } />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {filteredCourses.map((c) => (
                          <SelectItem key={`${c.id}_${c.classId}`} value={`${c.id}_${c.classId}`}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedCourse && (
                <div className="p-3 bg-school-yellow/10 border border-school-yellow/20 rounded-lg mt-4">
                  <p className="font-semibold text-school-black text-sm">{selectedCourse.name}</p>
                  <p className="text-xs text-school-black/70 mt-0.5">
                    Classe : <strong>{selectedCourse.className}</strong> · Date : {selectedDate.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tableau de présence pour le cours sélectionné */}
          {selectedCourseKey && (
            <Card className="border-school-yellow/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-school-black">
                      {selectedCourse ? `Feuille d'appel — ${selectedCourse.name} (${selectedCourse.className})` : 'Liste des Élèves'}
                    </CardTitle>
                    <CardDescription>
                      {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </CardDescription>
                  </div>
                  {studentsList.length > 0 && (
                    <Badge className={stats.rate >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {stats.rate}% Présents
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingAttendance ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin mr-2 text-school-yellow" />
                    <span className="text-sm text-school-black/60">Chargement de la liste des élèves...</span>
                  </div>
                ) : attendanceError ? (
                  <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Erreur lors du chargement des élèves</p>
                      <p className="text-xs text-red-600 mt-0.5">{(attendanceError as Error).message}</p>
                    </div>
                  </div>
                ) : studentsList.length === 0 ? (
                  <div className="text-center py-10 text-school-black/50">
                    <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Aucun élève inscrit dans cette classe ({selectedCourse?.className})</p>
                    <p className="text-xs mt-1 text-school-black/40">
                      Les élèves doivent être inscrits dans la classe via la gestion des utilisateurs/classes.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-school-gray-light">
                          <TableHead className="font-semibold text-school-black">Élève</TableHead>
                          <TableHead className="font-semibold text-school-black">Email</TableHead>
                          <TableHead className="font-semibold text-school-black">Statut actuel</TableHead>
                          <TableHead className="font-semibold text-school-black">Marquer la présence</TableHead>
                          <TableHead className="font-semibold text-school-black text-xs">Mis à jour</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentsList.map((student) => (
                          <TableRow
                            key={student.studentId}
                            className={`transition-colors ${
                              student.status === 'present' ? 'bg-green-50/40' :
                              student.status === 'late'    ? 'bg-amber-50/40' :
                              'bg-red-50/20'
                            }`}
                          >
                            <TableCell className="font-medium text-school-black">
                              {student.fullName}
                            </TableCell>
                            <TableCell className="text-xs text-school-black/60">
                              {student.email || '—'}
                            </TableCell>
                            <TableCell>
                              {student.status === 'present' && (
                                <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Présent</Badge>
                              )}
                              {student.status === 'late' && (
                                <Badge className="bg-amber-100 text-amber-800"><Clock className="w-3 h-3 mr-1" />Retard</Badge>
                              )}
                              {student.status === 'absent' && (
                                <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Absent</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1.5 flex-wrap">
                                <Button
                                  size="sm"
                                  disabled={markMutation.isPending}
                                  variant={student.status === 'present' ? 'default' : 'outline'}
                                  className={student.status === 'present'
                                    ? 'bg-green-600 text-white hover:bg-green-700 h-8 text-xs font-medium'
                                    : 'border-green-400 text-green-700 hover:bg-green-50 h-8 text-xs font-medium'}
                                  onClick={() => markMutation.mutate({ studentId: student.studentId, status: 'present' })}
                                >
                                  <Check className="w-3.5 h-3.5 mr-1" />Présent
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={markMutation.isPending}
                                  variant={student.status === 'late' ? 'default' : 'outline'}
                                  className={student.status === 'late'
                                    ? 'bg-amber-500 text-white hover:bg-amber-600 h-8 text-xs font-medium'
                                    : 'border-amber-400 text-amber-700 hover:bg-amber-50 h-8 text-xs font-medium'}
                                  onClick={() => markMutation.mutate({ studentId: student.studentId, status: 'late' })}
                                >
                                  <Clock className="w-3.5 h-3.5 mr-1" />Retard
                                </Button>
                                <Button
                                  size="sm"
                                  disabled={markMutation.isPending}
                                  variant={student.status === 'absent' ? 'default' : 'outline'}
                                  className={student.status === 'absent'
                                    ? 'bg-red-600 text-white hover:bg-red-700 h-8 text-xs font-medium'
                                    : 'border-red-400 text-red-700 hover:bg-red-50 h-8 text-xs font-medium'}
                                  onClick={() => markMutation.mutate({ studentId: student.studentId, status: 'absent' })}
                                >
                                  <X className="w-3.5 h-3.5 mr-1" />Absent
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-school-black/50">
                              {student.markedAt
                                ? new Date(student.markedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default Attendance