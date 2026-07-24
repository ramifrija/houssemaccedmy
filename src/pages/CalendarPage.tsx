
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MonthlyCalendarPlanner from '@/components/MonthlyCalendarPlanner'
import CalendarHeader from '@/components/calendar/CalendarHeader'
import CalendarSidebar from '@/components/calendar/CalendarSidebar'
import TodaysCourses from '@/components/calendar/TodaysCourses'
import UpcomingCourses from '@/components/calendar/UpcomingCourses'
import CourseFormDialog from '@/components/calendar/CourseFormDialog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays } from 'lucide-react'
import {
  CalendarSession,
  createCourseWithSchedule,
  deleteCalendarSession,
  fetchCalendarSessions,
  fetchCalendarSessionsForStudent,
  fetchCalendarSessionsForTeacher,
  sessionsForDateActive,
  sessionsUpcoming,
  updateCalendarSession,
} from '@/lib/courses-api'
import { useToast } from '@/hooks/use-toast'
import { queryKeys } from '@/lib/query-keys'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'

const CalendarPage = () => {
  const { user, userProfile } = useAuth()
  const canManage = userProfile?.role === 'admin'
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null)
  const { toast } = useToast()

  // Récupérer les enfants liés si l'utilisateur connecté est un Parent
  const { data: children = [] } = useQuery({
    queryKey: ['parent-children', user?.id],
    queryFn: async () => {
      if (!user?.id || userProfile?.role !== 'parent') return []

      // 1. Fetch via parent_students
      const { data: psData } = await supabase
        .from('parent_students')
        .select('student_id')
        .eq('parent_id', user.id)

      const psChildIds = (psData ?? []).map((row) => row.student_id)

      // 2. Fetch via profiles parent_id
      const { data: profChildren } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('parent_id', user.id)

      const profChildIds = (profChildren ?? []).map((row) => row.user_id)

      const childUserIds = Array.from(new Set([...psChildIds, ...profChildIds]))
      if (childUserIds.length === 0) return []

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email')
        .in('user_id', childUserIds)

      const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select('student_id, class_id, classes(name)')
        .in('student_id', childUserIds)

      const classMap = new Map<string, { id: number; name: string }>()
      for (const e of enrollments ?? []) {
        const clsObj = Array.isArray(e.classes) ? e.classes[0] : e.classes
        if (clsObj) {
          classMap.set(e.student_id, { id: e.class_id, name: clsObj.name })
        }
      }

      return (profiles ?? []).map((p) => ({
        id: p.id,
        user_id: p.user_id,
        first_name: p.first_name,
        last_name: p.last_name,
        class_name: classMap.get(p.user_id)?.name ?? 'Non inscrit',
        class_id: classMap.get(p.user_id)?.id,
      }))
    },
    enabled: !!user?.id && userProfile?.role === 'parent',
  })

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  const activeChild = useMemo(() => {
    if (children.length === 0) return null
    if (selectedChildId) return children.find((c) => c.user_id === selectedChildId) || children[0]
    return children[0]
  }, [children, selectedChildId])

  useEffect(() => {
    if (activeChild && !selectedChildId) {
      setSelectedChildId(activeChild.user_id)
    }
  }, [activeChild, selectedChildId])

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: userProfile?.role === 'parent' && activeChild
      ? ['calendar-sessions-child', activeChild.user_id]
      : userProfile?.role === 'teacher'
      ? ['calendar-sessions-teacher', user?.id]
      : queryKeys.calendarSessions,
    queryFn: () => {
      if (userProfile?.role === 'parent') {
        if (!activeChild?.user_id) return []
        return fetchCalendarSessionsForStudent(activeChild.user_id)
      }
      if (userProfile?.role === 'teacher' && user?.id) {
        return fetchCalendarSessionsForTeacher(user.id)
      }
      return fetchCalendarSessions()
    },
    enabled: userProfile?.role !== 'parent' || !!activeChild,
  })

  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.calendarSessions })

  const createCourse = useMutation({
    mutationFn: createCourseWithSchedule,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Cours créé', description: 'Le cours a été ajouté au planning.' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  const deleteCourse = useMutation({
    mutationFn: deleteCalendarSession,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Cours supprimé' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  const updateCourse = useMutation({
    mutationFn: updateCalendarSession,
    onSuccess: async () => {
      await invalidate()
      toast({ title: 'Cours mis à jour' })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Erreur', description: error.message })
    },
  })

  const todaysCourses = useMemo(
    () => sessionsForDateActive(sessions, selectedDate),
    [sessions, selectedDate]
  )

  const defaultSessionDate = selectedDate.toISOString().slice(0, 10)

  return (
    <div className="min-h-screen bg-school-gray-light">
      <CalendarHeader onNewCourseClick={() => setIsDialogOpen(true)} canManage={canManage} />

      <div className="p-4 lg:p-6 space-y-6">
        {userProfile?.role === 'parent' && children.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-school-yellow/20 rounded-xl shadow-xs shrink-0">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Visualisation de l'emploi du temps</h3>
              <p className="text-xs text-slate-500">Sélectionnez un enfant pour voir son calendrier scolaire.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Button
                  key={child.user_id}
                  size="sm"
                  variant={selectedChildId === child.user_id ? 'default' : 'outline'}
                  className={selectedChildId === child.user_id ? 'bg-school-yellow text-school-black shadow-xs font-semibold' : 'text-school-black/70 border-school-yellow/20 hover:bg-school-yellow/5'}
                  onClick={() => setSelectedChildId(child.user_id)}
                >
                  🏫 {child.first_name} ({child.class_name})
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 lg:col-span-2 rounded-xl" />
              <Skeleton className="h-80 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <div className="w-full">
                  <MonthlyCalendarPlanner 
                    courses={sessions} 
                    selectedDate={selectedDate} 
                    onDateSelect={(d) => d && setSelectedDate(d)} 
                  />
                </div>
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-school-yellow/40 bg-white p-12 text-center h-full">
                    <CalendarDays className="w-12 h-12 text-school-yellow mb-4" />
                    <h3 className="text-lg font-semibold text-school-black mb-2">Aucun cours planifié</h3>
                    <p className="text-sm text-school-black/60 mb-4">
                      {canManage
                        ? 'Créez votre premier cours pour commencer à organiser l\'emploi du temps.'
                        : 'Aucun cours n\'est planifié pour le moment.'}
                    </p>
                  </div>
                ) : (
                  <TodaysCourses
                    courses={todaysCourses}
                    selectedDate={selectedDate}
                    canManage={canManage}
                    onDelete={async (id) => {
                      await deleteCourse.mutateAsync(id)
                    }}
                    onEdit={(course) => {
                      setSelectedSession(course)
                      setIsDialogOpen(true)
                    }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {canManage && (
      <CourseFormDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) setSelectedSession(null)
        }}
        defaultSessionDate={defaultSessionDate}
        initialValues={
          selectedSession
            ? {
                sessionId: selectedSession.id,
                courseId: selectedSession.courseId,
                name: selectedSession.title,
                teacherId: selectedSession.teacherId,
                classId: selectedSession.classId,
                sessionDate: selectedSession.sessionDate.toISOString().slice(0, 10),
                startTime: selectedSession.startTime,
                durationMinutes: computeDuration(selectedSession.startTime, selectedSession.endTime),
                room: selectedSession.room === '—' ? '' : selectedSession.room,
                notes: selectedSession.notes ?? '',
              }
            : undefined
        }
        onSubmit={async (payload) => {
          if (selectedSession) {
            await updateCourse.mutateAsync({
              sessionId: selectedSession.id,
              courseId: selectedSession.courseId,
              name: payload.name,
              teacherId: payload.teacherId,
              classId: payload.classId,
              sessionDate: payload.sessionDate,
              startTime: payload.startTime,
              durationMinutes: payload.durationMinutes,
              room: payload.room,
              notes: payload.notes,
            })
            setSelectedSession(null)
          } else {
            await createCourse.mutateAsync(payload)
          }
        }}
      />
      )}
    </div>
  )
}

function computeDuration(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

export default CalendarPage
