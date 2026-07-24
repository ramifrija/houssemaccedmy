import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/components/auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { formatUserDisplayName } from '@/lib/display-user-name'
import { CalendarSession, sortSessionsChronologically } from '@/lib/courses-api'
import {
  GraduationCap,
  Calendar,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Clock,
  BookOpen,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface ChildInfo {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  class_name?: string
  class_id?: number
  payment_status: 'completed' | 'pending' | 'none'
  absences_count: number
}

export function ParentDashboard() {
  const { user, userProfile } = useAuth()
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [timetable, setTimetable] = useState<CalendarSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadParentData = async () => {
      setLoading(true)
      try {
        // 1. Fetch children attached via parent_students table
        const { data: psData, error: psErr } = await supabase
          .from('parent_students')
          .select('student_id')
          .eq('parent_id', user.id)

        if (psErr) console.warn('parent_students query warning:', psErr)

        const psChildIds = (psData ?? []).map((row) => row.student_id)

        // 2. Fetch children attached via profile parent_id
        const { data: profChildren, error: profErr } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('parent_id', user.id)

        if (profErr) console.warn('profiles parent_id query warning:', profErr)

        const profChildIds = (profChildren ?? []).map((row) => row.user_id)

        // Combine both lists and remove duplicates
        const childUserIds = Array.from(new Set([...psChildIds, ...profChildIds]))

        if (childUserIds.length === 0) {
          setChildren([])
          setLoading(false)
          return
        }

        // Fetch children profiles (without restrictive status filter)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, user_id, first_name, last_name, email, status')
          .in('user_id', childUserIds)

        // Fetch student enrollments for class names
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

        // Fetch payments status for children
        const { data: payments } = await supabase
          .from('student_payments')
          .select('student_id, status')
          .in('student_id', childUserIds)

        const paymentMap = new Map<string, 'completed' | 'pending' | 'none'>()
        for (const p of payments ?? []) {
          if (p.status === 'completed') {
            paymentMap.set(p.student_id, 'completed')
          } else if (!paymentMap.has(p.student_id) || paymentMap.get(p.student_id) !== 'completed') {
            paymentMap.set(p.student_id, 'pending')
          }
        }

        // Fetch absences count for children
        const { data: attendance } = await supabase
          .from('attendance_records')
          .select('student_id, status')
          .in('student_id', childUserIds)
          .eq('status', 'absent')

        const absenceMap = new Map<string, number>()
        for (const a of attendance ?? []) {
          absenceMap.set(a.student_id, (absenceMap.get(a.student_id) ?? 0) + 1)
        }

        const childList: ChildInfo[] = (profiles ?? []).map((p) => ({
          id: p.id,
          user_id: p.user_id,
          first_name: p.first_name,
          last_name: p.last_name,
          email: p.email,
          class_name: classMap.get(p.user_id)?.name ?? 'Non inscris',
          class_id: classMap.get(p.user_id)?.id,
          payment_status: paymentMap.get(p.user_id) ?? 'none',
          absences_count: absenceMap.get(p.user_id) ?? 0,
        }))

        setChildren(childList)
        if (childList.length > 0) {
          setSelectedChildId(childList[0].user_id)
        }
      } catch (err) {
        console.error('Error loading parent data:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadParentData()
  }, [user?.id])

  // Load timetable for selected child
  useEffect(() => {
    if (!selectedChildId) return

    const loadTimetable = async () => {
      const selectedChild = children.find((c) => c.user_id === selectedChildId)
      if (!selectedChild?.class_id) {
        setTimetable([])
        return
      }

      try {
        const { data: sessionsData } = await supabase
          .from('course_sessions')
          .select(`
            id,
            session_date,
            start_time,
            end_time,
            room,
            notes,
            schedule_id,
            courses!inner (
              id,
              name,
              color,
              teacher_id,
              class_id
            )
          `)
          .eq('courses.class_id', selectedChild.class_id)
          .gte('session_date', new Date().toISOString().slice(0, 10))
          .order('session_date', { ascending: true })
          .limit(10)

        const mapped: CalendarSession[] = (sessionsData ?? []).map((row: any) => ({
          id: row.id,
          courseId: row.courses.id,
          title: row.courses.name,
          teacherId: row.courses.teacher_id,
          teacherName: 'Professeur',
          className: selectedChild.class_name ?? '—',
          classId: selectedChild.class_id!,
          sessionDate: new Date(`${row.session_date}T12:00:00`),
          startTime: row.start_time.slice(0, 5),
          endTime: row.end_time.slice(0, 5),
          room: row.room ?? '—',
          notes: row.notes,
          color: 'bg-blue-500',
          scheduleId: row.schedule_id,
        }))

        setTimetable(sortSessionsChronologically(mapped))
      } catch (err) {
        console.error('Error fetching child timetable:', err)
      }
    }

    void loadTimetable()
  }, [selectedChildId, children])

  const activeChild = children.find((c) => c.user_id === selectedChildId)

  // Filtrer pour ne garder QUE les cours d'Aujourd'hui et Demain Matin (< 13h)
  const upcomingShortTermSessions = useMemo(() => {
    const getLocalDateStr = (d: Date) => {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const now = new Date()
    const todayStr = getLocalDateStr(now)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = getLocalDateStr(tomorrow)

    return timetable.filter((session) => {
      const dateStr = getLocalDateStr(session.sessionDate)

      // 1. Cours d'aujourd'hui
      if (dateStr === todayStr) return true

      // 2. Cours de demain matin (début avant 13h)
      if (dateStr === tomorrowStr) {
        const startHour = parseInt(session.startTime.split(':')[0], 10)
        return startHour < 13
      }

      return false
    })
  }, [timetable])

  return (
    <div className="min-h-screen bg-slate-50">
      <PageHeader
        title={`Bonjour, ${userProfile?.first_name ?? 'Parent'}`}
        description="Espace Famille — Suivi en temps réel de la scolarité de vos enfants"
        actions={
          <Button asChild variant="outline" className="border-school-yellow bg-school-yellow/10 text-school-black">
            <Link to="/announcements">
              <Sparkles className="w-4 h-4 mr-2 text-amber-600" />
              Notifications & Annonces
            </Link>
          </Button>
        }
      />

      <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Children Feed Cards (Facebook-style Selector & Overview) */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Mes Enfants ({children.length})
          </h2>

          {loading ? (
            <p className="text-center py-8 text-slate-400 text-sm">Chargement des données familiales...</p>
          ) : children.length === 0 ? (
            <Card className="border-dashed border-amber-300 bg-amber-50/50">
              <CardContent className="py-8 text-center">
                <GraduationCap className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-800">Aucun enfant rattaché</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Veuillez contacter l'administration de l'établissement pour associer vos enfants à votre compte parent.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const isSelected = child.user_id === selectedChildId
                return (
                  <Card
                    key={child.id}
                    onClick={() => setSelectedChildId(child.user_id)}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? 'border-blue-500 shadow-md bg-white ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-slate-100">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-school-yellow text-school-black font-bold">
                            {child.first_name?.[0]}
                            {child.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate">
                            {formatUserDisplayName(child)}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                            {child.class_name}
                          </p>
                        </div>
                        {isSelected && <ChevronRight className="w-5 h-5 text-blue-500" />}
                      </div>

                      {/* Summary Badges Feed */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* Payment Status Tag */}
                        <div>
                          {child.payment_status === 'completed' ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> Payé
                            </Badge>
                          ) : child.payment_status === 'pending' ? (
                            <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" /> Impayé (En attente)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500">
                              <DollarSign className="w-3 h-3" /> Non renseigné
                            </Badge>
                          )}
                        </div>

                        {/* Absence Counter */}
                        <div className="text-xs font-semibold">
                          {child.absences_count > 0 ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                              <UserCheck className="w-3 h-3" /> {child.absences_count} absence(s)
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Assidu (0 absence)
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Selected Child Detail Feed (Emploi du temps & Présence) */}
        {activeChild && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column : Timetable Feed */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-slate-200">
                <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Cours — {formatUserDisplayName(activeChild)}
                    </CardTitle>
                    <Badge variant="outline" className="bg-white">
                      {activeChild.class_name}
                    </Badge>
                  </div>
                  <CardDescription>Aujourd'hui et demain matin (avant 13h)</CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {upcomingShortTermSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm">Aucun cours aujourd'hui ni demain matin.</p>
                    </div>
                  ) : (
                    upcomingShortTermSessions.map((session) => {
                      const isToday = session.sessionDate.toDateString() === new Date().toDateString()
                      return (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                            isToday
                              ? 'bg-school-yellow/10 border-school-yellow/30 hover:bg-school-yellow/15'
                              : 'bg-slate-50 border-slate-200/80 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                              isToday ? 'bg-school-yellow text-school-black' : 'bg-blue-100 text-blue-700'
                            }`}>
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-semibold text-slate-900 text-sm">{session.title}</h4>
                                {isToday && (
                                  <span className="text-[9px] font-bold text-school-black bg-school-yellow px-1.5 py-0.5 rounded-full uppercase">Aujourd'hui</span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">Salle: {session.room}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge variant="secondary" className="bg-white text-slate-700 border flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {session.startTime} - {session.endTime}
                            </Badge>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {session.sessionDate.toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Column : Quick Status & Summary Card */}
            <div className="space-y-4">
              <Card className="border-slate-200 bg-white">
                <CardHeader className="bg-slate-50/50 pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                    Résumé Scolaire
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Prochain Cours Target */}
                  <div className="p-3 rounded-lg bg-school-yellow/10 border border-school-yellow/30 space-y-2">
                    <span className="text-[10px] font-bold text-school-black uppercase tracking-wide flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Prochain cours
                    </span>
                    {upcomingShortTermSessions.length > 0 ? (
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{upcomingShortTermSessions[0].title}</h4>
                        <p className="text-xs text-slate-600 mt-1">
                          🗓️ {upcomingShortTermSessions[0].sessionDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          ⏰ {upcomingShortTermSessions[0].startTime} - {upcomingShortTermSessions[0].endTime} (Salle {upcomingShortTermSessions[0].room})
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Aucun cours aujourd'hui ni demain matin</p>
                    )}
                  </div>

                  {/* Status Payment Alert Box */}
                  {activeChild.payment_status === 'pending' ? (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                      <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Règlement en attente
                      </div>
                      <p className="text-xs text-amber-700">
                        Le paiement des frais de scolarité pour ce mois est actuellement en attente de régularisation.
                      </p>
                    </div>
                  ) : activeChild.payment_status === 'completed' ? (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Scolarité à jour
                      </div>
                      <p className="text-xs text-emerald-700">
                        Tous les règlements de scolarité sont validés pour cet élève.
                      </p>
                    </div>
                  ) : null}

                  {/* Absences summary */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">Total Absences</span>
                    <span className={`font-bold text-sm ${activeChild.absences_count > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {activeChild.absences_count} cours manqué(s)
                    </span>
                  </div>

                  <Button asChild variant="outline" className="w-full justify-between text-xs">
                    <Link to="/announcements">
                      Voir le centre de notifications
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ParentDashboard
